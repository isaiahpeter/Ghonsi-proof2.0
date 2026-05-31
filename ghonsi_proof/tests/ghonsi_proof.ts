import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GhonsiProof } from "../target/types/ghonsi_proof";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { assert } from "chai";

// ─── Metaplex ────────────────────────────────────────────────────────────────
const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

function metadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  )[0];
}

// ─── Program PDAs ─────────────────────────────────────────────────────────────
function programAuthorityPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("program_authority")],
    programId
  );
}

function mintAuthorityPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    programId
  );
}

function proofPda(
  owner: PublicKey,
  mint: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proof"), owner.toBuffer(), mint.toBuffer()],
    programId
  );
}

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe("ghonsi_proof", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GhonsiProof as Program<GhonsiProof>;
  const connection = provider.connection;

  // Wallets
  const primaryAdmin = (provider.wallet as anchor.Wallet).payer;
  const secondaryAdmin = Keypair.generate();
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();
  const nonAdmin = Keypair.generate();

  // PDAs
  const [programAuthorityKey] = programAuthorityPda(program.programId);
  const [mintAuthorityKey] = mintAuthorityPda(program.programId);

  // Collection mint (mock — just a keypair on localnet)
  const collectionMint = Keypair.generate();

  // Reusable across tests
  let proofMint1: Keypair;
  let proofKey1: PublicKey;

  // ─── Setup ─────────────────────────────────────────────────────────────────
  // Fund all test wallets from the provider wallet (localnet validator funds it)
  before(async () => {
    const FUND_AMOUNT = 2 * anchor.web3.LAMPORTS_PER_SOL;
    const wallets = [secondaryAdmin, user1, user2, nonAdmin];

    await Promise.all(
      wallets.map(async (kp) => {
        const tx = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: primaryAdmin.publicKey,
            toPubkey: kp.publicKey,
            lamports: FUND_AMOUNT,
          })
        );
        await provider.sendAndConfirm(tx, [primaryAdmin]);
      })
    );
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════

  describe("initialize", () => {
    it("sets up program authority with primary admin and collection mint", async () => {
      await program.methods
        .initialize(collectionMint.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.ok(
        state.primaryAdmin.equals(primaryAdmin.publicKey),
        "primary admin mismatch"
      );
      assert.ok(
        state.collectionMint.equals(collectionMint.publicKey),
        "collection mint mismatch"
      );
      assert.equal(state.adminCount, 1);
      assert.isFalse(state.paused);
    });

    it("fails if called a second time (account already exists)", async () => {
      try {
        await program.methods
          .initialize(collectionMint.publicKey)
          .accounts({
            admin: primaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([primaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e) {
        assert.ok(e);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ADMIN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe("admin management", () => {
    it("primary admin can add a secondary admin", async () => {
      await program.methods
        .addAdmin(secondaryAdmin.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.equal(state.adminCount, 2);
      assert.ok(
        state.admins.some((a) => a.equals(secondaryAdmin.publicKey)),
        "secondary admin not found in list"
      );
    });

    it("fails if non-primary tries to add admin", async () => {
      try {
        await program.methods
          .addAdmin(nonAdmin.publicKey)
          .accounts({
            admin: secondaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([secondaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "Unauthorized");
      }
    });

    it("fails to add an already-existing admin", async () => {
      try {
        await program.methods
          .addAdmin(secondaryAdmin.publicKey)
          .accounts({
            admin: primaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([primaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "AlreadyAdmin");
      }
    });

    it("primary admin can remove a secondary admin", async () => {
      await program.methods
        .removeAdmin(secondaryAdmin.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.equal(state.adminCount, 1);
    });

    it("cannot remove the primary admin", async () => {
      try {
        await program.methods
          .removeAdmin(primaryAdmin.publicKey)
          .accounts({
            admin: primaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([primaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "CannotRemovePrimaryAdmin");
      }
    });

    it("re-adds secondary admin for subsequent tests", async () => {
      await program.methods
        .addAdmin(secondaryAdmin.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.equal(state.adminCount, 2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PRIMARY ADMIN CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("primary admin controls", () => {
    const newCollectionMint = Keypair.generate();

    it("primary admin can update the collection mint", async () => {
      await program.methods
        .setCollection(newCollectionMint.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.ok(state.collectionMint.equals(newCollectionMint.publicKey));

      // Restore original collection mint
      await program.methods
        .setCollection(collectionMint.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();
    });

    it("non-primary cannot call set_collection", async () => {
      try {
        await program.methods
          .setCollection(newCollectionMint.publicKey)
          .accounts({
            admin: secondaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
          })
          .signers([secondaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "Unauthorized");
      }
    });

    it("primary admin can pause the program", async () => {
      await program.methods
        .setPaused(true)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.isTrue(state.paused);
    });

    it("primary admin can unpause", async () => {
      await program.methods
        .setPaused(false)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(
        programAuthorityKey
      );
      assert.isFalse(state.paused);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. MINT PROOF
  // ═══════════════════════════════════════════════════════════════════════════

  describe("mint_proof", () => {
    async function mintProof(
      admin: Keypair,
      owner: Keypair,
      proofId = "proof-001",
      title = "Test Proof",
      uri = "https://arweave.net/test",
      description = "Test work description",
      proofType = "design"
    ) {
      const mint = Keypair.generate();
      const [proof] = proofPda(owner.publicKey, mint.publicKey, program.programId);
      const tokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        owner.publicKey
      );
      const metadata = metadataPda(mint.publicKey);

      await program.methods
        .mintProof(proofId, title, uri, description, proofType)
        .accounts({
          owner: owner.publicKey,
          proof,
          mint: mint.publicKey,
          tokenAccount,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: admin.publicKey,
          metadata,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, owner, mint])
        .rpc();

      return { mint, proof, tokenAccount };
    }

    it("primary admin can mint a proof NFT to a user", async () => {
      const result = await mintProof(primaryAdmin, user1);
      proofMint1 = result.mint;
      proofKey1 = result.proof;

      const proofData = await program.account.proof.fetch(proofKey1);
      assert.equal(proofData.proofId, "proof-001");
      assert.equal(proofData.title, "Test Proof");
      assert.ok(proofData.owner.equals(user1.publicKey));
      assert.deepEqual(proofData.status, { pending: {} });
      assert.equal(proofData.verificationDate.toNumber(), 0);
    });

    it("secondary admin can also mint a proof", async () => {
      await mintProof(secondaryAdmin, user2, "proof-002", "Secondary Proof");
    });

    it("non-admin cannot mint", async () => {
      try {
        await mintProof(nonAdmin, user1, "proof-bad");
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "Unauthorized");
      }
    });

    it("fails when proof_id exceeds 32 chars", async () => {
      try {
        await mintProof(
          primaryAdmin,
          user1,
          "a".repeat(33),
          "Title",
          "https://uri.com",
          "desc"
        );
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "IdTooLong");
      }
    });

    it("fails when title exceeds 64 chars", async () => {
      try {
        await mintProof(
          primaryAdmin,
          user1,
          "proof-long",
          "t".repeat(65),
          "https://uri.com",
          "desc"
        );
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "TitleTooLong");
      }
    });

    it("fails when URI exceeds 200 chars", async () => {
      try {
        await mintProof(
          primaryAdmin,
          user1,
          "proof-uri",
          "Title",
          "https://" + "u".repeat(200),
          "desc"
        );
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "UriTooLong");
      }
    });

    it("fails when program is paused", async () => {
      await program.methods
        .setPaused(true)
        .accounts({ admin: primaryAdmin.publicKey, programAuthority: programAuthorityKey })
        .signers([primaryAdmin])
        .rpc();

      try {
        await mintProof(primaryAdmin, user1, "proof-paused");
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "ProgramPaused");
      } finally {
        await program.methods
          .setPaused(false)
          .accounts({ admin: primaryAdmin.publicKey, programAuthority: programAuthorityKey })
          .signers([primaryAdmin])
          .rpc();
      }
    });

    it("fails with wrong collection mint", async () => {
      const wrongCollection = Keypair.generate();
      const mint = Keypair.generate();
      const [proof] = proofPda(user1.publicKey, mint.publicKey, program.programId);
      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, user1.publicKey);
      const metadata = metadataPda(mint.publicKey);

      try {
        await program.methods
          .mintProof("proof-wrong-col", "Title", "https://uri.com", "desc", "type")
          .accounts({
            owner: user1.publicKey,
            proof,
            mint: mint.publicKey,
            tokenAccount,
            mintAuthority: mintAuthorityKey,
            programAuthority: programAuthorityKey,
            collectionMint: wrongCollection.publicKey,
            admin: primaryAdmin.publicKey,
            metadata,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([primaryAdmin, user1, mint])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "InvalidCollectionMint");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. VERIFY PROOF
  // ═══════════════════════════════════════════════════════════════════════════

  describe("verify_proof", () => {
    it("admin can verify a pending proof", async () => {
      await program.methods
        .verifyProof()
        .accounts({
          proof: proofKey1,
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const proofData = await program.account.proof.fetch(proofKey1);
      assert.deepEqual(proofData.status, { verified: {} });
      assert.ok(proofData.verifiedBy.equals(primaryAdmin.publicKey));
      assert.isAbove(proofData.verificationDate.toNumber(), 0);
    });

    it("cannot verify an already-processed proof", async () => {
      try {
        await program.methods
          .verifyProof()
          .accounts({
            proof: proofKey1,
            admin: primaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
          })
          .signers([primaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "ProofAlreadyProcessed");
      }
    });

    it("non-admin cannot verify", async () => {
      const mint = Keypair.generate();
      const [proof] = proofPda(user2.publicKey, mint.publicKey, program.programId);
      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, user2.publicKey);
      const metadata = metadataPda(mint.publicKey);

      await program.methods
        .mintProof("proof-na", "NA Proof", "https://uri.com", "desc", "type")
        .accounts({
          owner: user2.publicKey,
          proof,
          mint: mint.publicKey,
          tokenAccount,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin.publicKey,
          metadata,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([primaryAdmin, user2, mint])
        .rpc();

      try {
        await program.methods
          .verifyProof()
          .accounts({
            proof,
            admin: nonAdmin.publicKey,
            programAuthority: programAuthorityKey,
          })
          .signers([nonAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "Unauthorized");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. REJECT PROOF
  // ═══════════════════════════════════════════════════════════════════════════

  describe("reject_proof", () => {
    let rejectProofKey: PublicKey;
    let rejectMint: Keypair;

    before(async () => {
      rejectMint = Keypair.generate();
      [rejectProofKey] = proofPda(user1.publicKey, rejectMint.publicKey, program.programId);
      const tokenAccount = await getAssociatedTokenAddress(rejectMint.publicKey, user1.publicKey);
      const metadata = metadataPda(rejectMint.publicKey);

      await program.methods
        .mintProof("proof-rej", "Reject Me", "https://uri.com", "desc", "type")
        .accounts({
          owner: user1.publicKey,
          proof: rejectProofKey,
          mint: rejectMint.publicKey,
          tokenAccount,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin.publicKey,
          metadata,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([primaryAdmin, user1, rejectMint])
        .rpc();
    });

    it("admin can reject a pending proof with a reason", async () => {
      await program.methods
        .rejectProof("Does not meet quality standards")
        .accounts({
          proof: rejectProofKey,
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const proofData = await program.account.proof.fetch(rejectProofKey);
      assert.deepEqual(proofData.status, { rejected: {} });
      assert.equal(proofData.rejectionReason, "Does not meet quality standards");
    });

    it("cannot reject an already-rejected proof", async () => {
      try {
        await program.methods
          .rejectProof("Again")
          .accounts({
            proof: rejectProofKey,
            admin: primaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
          })
          .signers([primaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "ProofAlreadyProcessed");
      }
    });

    it("fails when rejection reason exceeds 200 chars", async () => {
      const mint2 = Keypair.generate();
      const [proof2] = proofPda(user2.publicKey, mint2.publicKey, program.programId);
      const tokenAccount2 = await getAssociatedTokenAddress(mint2.publicKey, user2.publicKey);
      const metadata2 = metadataPda(mint2.publicKey);

      await program.methods
        .mintProof("proof-long-r", "LR", "https://uri.com", "desc", "type")
        .accounts({
          owner: user2.publicKey,
          proof: proof2,
          mint: mint2.publicKey,
          tokenAccount: tokenAccount2,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin.publicKey,
          metadata: metadata2,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([primaryAdmin, user2, mint2])
        .rpc();

      try {
        await program.methods
          .rejectProof("r".repeat(201))
          .accounts({
            proof: proof2,
            admin: primaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
          })
          .signers([primaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "ReasonTooLong");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. REVOKE PROOF
  // ═══════════════════════════════════════════════════════════════════════════

  describe("revoke_proof", () => {
    let revokeProofKey: PublicKey;
    let revokeMint: Keypair;
    let revokeTokenAccount: PublicKey;

    before(async () => {
      revokeMint = Keypair.generate();
      [revokeProofKey] = proofPda(user1.publicKey, revokeMint.publicKey, program.programId);
      revokeTokenAccount = await getAssociatedTokenAddress(revokeMint.publicKey, user1.publicKey);
      const metadata = metadataPda(revokeMint.publicKey);

      await program.methods
        .mintProof("proof-rev", "Revoke Me", "https://uri.com", "desc", "type")
        .accounts({
          owner: user1.publicKey,
          proof: revokeProofKey,
          mint: revokeMint.publicKey,
          tokenAccount: revokeTokenAccount,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin.publicKey,
          metadata,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([primaryAdmin, user1, revokeMint])
        .rpc();

      await program.methods
        .verifyProof()
        .accounts({
          proof: revokeProofKey,
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();
    });

    it("primary admin can revoke a verified proof and thaw the token", async () => {
      await program.methods
        .revokeProof()
        .accounts({
          proof: revokeProofKey,
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
          tokenAccount: revokeTokenAccount,
          mint: revokeMint.publicKey,
          mintAuthority: mintAuthorityKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([primaryAdmin])
        .rpc();

      const proofData = await program.account.proof.fetch(revokeProofKey);
      assert.deepEqual(proofData.status, { revoked: {} });
      assert.ok(proofData.verifiedBy.equals(primaryAdmin.publicKey));
    });

    it("secondary admin cannot revoke (primary only)", async () => {
      const mint2 = Keypair.generate();
      const [proof2] = proofPda(user2.publicKey, mint2.publicKey, program.programId);
      const ta2 = await getAssociatedTokenAddress(mint2.publicKey, user2.publicKey);
      const meta2 = metadataPda(mint2.publicKey);

      await program.methods
        .mintProof("proof-sec-rev", "Sec Rev", "https://uri.com", "desc", "type")
        .accounts({
          owner: user2.publicKey,
          proof: proof2,
          mint: mint2.publicKey,
          tokenAccount: ta2,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin.publicKey,
          metadata: meta2,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([primaryAdmin, user2, mint2])
        .rpc();

      await program.methods
        .verifyProof()
        .accounts({
          proof: proof2,
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      try {
        await program.methods
          .revokeProof()
          .accounts({
            proof: proof2,
            admin: secondaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
            tokenAccount: ta2,
            mint: mint2.publicKey,
            mintAuthority: mintAuthorityKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([secondaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "Unauthorized");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CLOSE PROOF
  // ═══════════════════════════════════════════════════════════════════════════

  describe("close_proof", () => {
    it("owner can close a rejected proof and reclaim rent", async () => {
      const mint = Keypair.generate();
      const [proof] = proofPda(user1.publicKey, mint.publicKey, program.programId);
      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, user1.publicKey);
      const metadata = metadataPda(mint.publicKey);

      await program.methods
        .mintProof("proof-close", "Close Me", "https://uri.com", "desc", "type")
        .accounts({
          owner: user1.publicKey,
          proof,
          mint: mint.publicKey,
          tokenAccount,
          mintAuthority: mintAuthorityKey,
          programAuthority: programAuthorityKey,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin.publicKey,
          metadata,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([primaryAdmin, user1, mint])
        .rpc();

      await program.methods
        .rejectProof("Closing test")
        .accounts({
          proof,
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const balBefore = await connection.getBalance(user1.publicKey);

      await program.methods
        .closeProof()
        .accounts({ proof, owner: user1.publicKey })
        .signers([user1])
        .rpc();

      const balAfter = await connection.getBalance(user1.publicKey);
      assert.isAbove(balAfter, balBefore, "owner should have received rent back");

      const closed = await connection.getAccountInfo(proof);
      assert.isNull(closed, "proof account should be closed");
    });

    it("cannot close a verified (active) proof", async () => {
      try {
        await program.methods
          .closeProof()
          .accounts({ proof: proofKey1, owner: user1.publicKey })
          .signers([user1])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "CannotCloseActiveProof");
      }
    });

    it("non-owner cannot close proof", async () => {
      try {
        await program.methods
          .closeProof()
          .accounts({ proof: proofKey1, owner: nonAdmin.publicKey })
          .signers([nonAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.ok(e);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. RESET AUTHORITY
  // ═══════════════════════════════════════════════════════════════════════════

  describe("reset_authority", () => {
    it("primary admin can transfer authority to a new address", async () => {
      const newAdmin = Keypair.generate();

      // Fund newAdmin from primaryAdmin instead of airdrop
      const fundTx = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: primaryAdmin.publicKey,
          toPubkey: newAdmin.publicKey,
          lamports: 2 * anchor.web3.LAMPORTS_PER_SOL,
        })
      );
      await provider.sendAndConfirm(fundTx, [primaryAdmin]);

      await program.methods
        .resetAuthority(newAdmin.publicKey)
        .accounts({
          admin: primaryAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([primaryAdmin])
        .rpc();

      const state = await program.account.programAuthority.fetch(programAuthorityKey);
      assert.ok(state.primaryAdmin.equals(newAdmin.publicKey));
      assert.equal(state.adminCount, 1, "admin list should reset to 1");

      // Transfer back so remaining tests aren't broken
      await program.methods
        .resetAuthority(primaryAdmin.publicKey)
        .accounts({
          admin: newAdmin.publicKey,
          programAuthority: programAuthorityKey,
        })
        .signers([newAdmin])
        .rpc();
    });

    it("non-primary cannot reset authority", async () => {
      try {
        await program.methods
          .resetAuthority(nonAdmin.publicKey)
          .accounts({
            admin: secondaryAdmin.publicKey,
            programAuthority: programAuthorityKey,
          })
          .signers([secondaryAdmin])
          .rpc();
        assert.fail("should have thrown");
      } catch (e: any) {
        assert.include(e.toString(), "Unauthorized");
      }
    });
  });
});