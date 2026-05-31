import 'dotenv/config';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GhonsiProof } from "./target/types/ghonsi_proof";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.GhonsiProof as Program<GhonsiProof>;

  console.log("\n🔍 Fetching all your proofs...\n");

  // Fetch all proof accounts owned by your wallet
  const proofs = await program.account.proof.all([
    {
      memcmp: {
        offset: 8 + 32, // Skip discriminator (8) + mint pubkey (32)
        bytes: provider.wallet.publicKey.toBase58(),
      }
    }
  ]);

  if (proofs.length === 0) {
    console.log("❌ No proofs found for your wallet.");
    return;
  }

  console.log(`📊 Found ${proofs.length} proof(s):\n`);
  console.log("═".repeat(80));

  proofs.forEach((proof, index) => {
    const data = proof.account;
    const status = Object.keys(data.status)[0];
    
    console.log(`\n${index + 1}. ${data.title}`);
    console.log("─".repeat(80));
    console.log(`   Proof ID: ${data.proofId}`);
    console.log(`   Type: ${data.proofType}`);
    console.log(`   Status: ${status.toUpperCase()}`);
    console.log(`   Owner: ${data.owner.toBase58()}`);
    console.log(`   NFT Mint: ${data.mint.toBase58()}`);
    console.log(`   Submitted: ${new Date(data.submissionDate.toNumber() * 1000).toLocaleString()}`);
    console.log(`   Description: ${data.workDescription.substring(0, 100)}...`);
    console.log(`   PDA Address: ${proof.publicKey.toBase58()}`);
    
    if (status === 'verified' || status === 'rejected') {
      console.log(`   Verified By: ${data.verifiedBy.toBase58()}`);
      console.log(`   Verification Date: ${new Date(data.verificationDate.toNumber() * 1000).toLocaleString()}`);
      if (status === 'rejected') {
        console.log(`   Rejection Reason: ${data.rejectionReason}`);
      }
    }
    
    console.log(`\n   🔍 View on Explorer:`);
    console.log(`   https://explorer.solana.com/address/${proof.publicKey.toBase58()}?cluster=devnet`);
  });

  console.log("\n" + "═".repeat(80) + "\n");
}

main();
