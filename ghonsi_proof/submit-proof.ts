import 'dotenv/config';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GhonsiProof } from "./target/types/ghonsi_proof";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "fs";
import fetch from "node-fetch";

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNDBhYTQ4Yy1kZmNmLTQyODktODhlYi0zZDFjOTU5YzEzNGQiLCJlbWFpbCI6ImdqMDkwNDIwMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBkZDM4YzhmZTQyMWU0ZTc2Mjk1Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTdlNTZmOTE4ZjdjZTQzZmJlNWUwNmRjZmI1Y2RiYzkyZWE0Zjc5ZDI5OTA1MGM1NmY0ZTZmYmIwZjM3NzIzZSIsImV4cCI6MTc5OTMxNDg1MH0.zAc38ctn290vS1OrsEVuVEOeNTUafCEi88bhqcNXiU8';

async function uploadToPinata(metadata: any, proofId: string): Promise<string> {
  console.log('📤 Uploading metadata to Pinata...');

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${proofId}-metadata.json`
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  console.log('✅ Uploaded to IPFS:', uri);
  return uri;
}

async function submitProofToBlockchain(
  proofId: string,
  title: string,
  description: string,
  proofType: string,
  uri: string
) {
  // Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.GhonsiProof as Program<GhonsiProof>;

  console.log('\n🔐 Submitting to Solana Blockchain');
  console.log('==================================');
  console.log('Program ID:', program.programId.toBase58());
  console.log('Wallet:', provider.wallet.publicKey.toBase58());
  console.log('Cluster:', provider.connection.rpcEndpoint);

  // Check balance
  const balance = await provider.connection.getBalance(provider.wallet.publicKey);
  console.log('Balance:', (balance / LAMPORTS_PER_SOL).toFixed(4), 'SOL\n');

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    throw new Error('Insufficient balance! Need at least 0.1 SOL. Run: solana airdrop 1');
  }

  // Generate keypairs
  const mint = Keypair.generate();
  const collectionMint = Keypair.generate();

  // Derive PDAs
  const [programAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_authority")],
    program.programId
  );

  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    program.programId
  );

  const [proofPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("proof"),
      provider.wallet.publicKey.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
  );

  const [tokenAccount] = PublicKey.findProgramAddressSync(
    [
      provider.wallet.publicKey.toBuffer(),
      anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    anchor.utils.token.ASSOCIATED_PROGRAM_ID
  );

  console.log('📝 Submitting transaction...');

  try {
    // Fetch admin
    const authorityAccount = await program.account.programAuthority.fetch(programAuthority);

    // Submit transaction
    const tx = await program.methods
      .mintProof(proofId, title, uri, description, proofType)
      .accountsPartial({
        owner: provider.wallet.publicKey,
        proof: proofPda,
        mint: mint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: collectionMint.publicKey,
        admin: authorityAccount.primaryAdmin,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    console.log('\n✅ SUCCESS! Proof submitted on-chain!');
    console.log('\n📋 Transaction Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Transaction ID:', tx);
    console.log('Proof PDA:', proofPda.toBase58());
    console.log('NFT Mint:', mint.publicKey.toBase58());
    console.log('Metadata URI:', uri);
    console.log('\n🔍 View on Explorer:');
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log(`https://explorer.solana.com/address/${proofPda.toBase58()}?cluster=devnet`);

    // Fetch and display on-chain data
    console.log('\n📊 On-Chain Proof Data:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const proofAccount = await program.account.proof.fetch(proofPda);
    console.log('Owner:', proofAccount.owner.toBase58());
    console.log('Proof ID:', proofAccount.proofId);
    console.log('Title:', proofAccount.title);
    console.log('Type:', proofAccount.proofType);
    console.log('Status:', Object.keys(proofAccount.status)[0].toUpperCase());
    console.log('Submission:', new Date(proofAccount.submissionDate.toNumber() * 1000).toLocaleString());
    console.log('\n💡 The NFT is now frozen in your wallet (soulbound)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { tx, proofPda: proofPda.toBase58(), mint: mint.publicKey.toBase58(), uri };
  } catch (error: any) {
    console.error('\n❌ Blockchain Error:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log(`
🔐 Ghonsi Proof - Submit Proof to Blockchain

Usage:
  npm run submit -- "<proof_id>" "<title>" "<description>" "<proof_type>"

Example:
  npm run submit -- "PROOF-2025-001" "My E-commerce App" "Built a full-stack e-commerce platform with React and Node.js" "Software Development"

Proof Types:
  - Software Development
  - Design
  - Writing
  - Research
  - Marketing
  - Other

The script will:
  1. Upload metadata to Pinata (IPFS)
  2. Submit proof to Solana blockchain
  3. Mint a soulbound NFT
  4. Return transaction ID for verification
    `);
    process.exit(1);
  }

  const [proofId, title, description, proofType] = args;

  console.log('🚀 Starting Proof Submission');
  console.log('============================\n');
  console.log('Proof ID:', proofId);
  console.log('Title:', title);
  console.log('Type:', proofType);
  console.log();

  try {
    // Step 1: Upload to Pinata
    const metadata = {
      name: title,
      description: description,
      image: 'https://via.placeholder.com/500',
      attributes: [
        { trait_type: "Proof ID", value: proofId },
        { trait_type: "Proof Type", value: proofType },
        { trait_type: "Status", value: "Pending" },
        { trait_type: "Submission Date", value: new Date().toISOString() }
      ]
    };

    const uri = await uploadToPinata(metadata, proofId);

    // Step 2: Submit to blockchain
    const result = await submitProofToBlockchain(proofId, title, description, proofType, uri);

    console.log('🎉 All done! Your proof is now on-chain and backed by IPFS.');
  } catch (error: any) {
    console.error('\n💥 Fatal Error:', error.message);
    process.exit(1);
  }
}

main();

