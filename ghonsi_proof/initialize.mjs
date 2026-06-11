import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";

const PROGRAM_ID = new PublicKey("CFerqKEGdrVfUrC1GDSRTsPpW9DjrQtqJnYycSNjQb3i");
const COLLECTION_MINT = new PublicKey("C3CYgA98HY2YTnmCqzrJRoTYWDjoVeFdY57FqxWTaXFW");
const RPC = "https://api.devnet.solana.com";

const adminKeypair = Keypair.fromSecretKey(
  Uint8Array.from([65,148,201,224,9,82,145,187,116,89,68,112,23,231,192,146,201,123,114,37,190,135,100,57,63,99,127,44,78,190,154,27,164,0,197,230,169,71,26,66,220,98,218,201,109,87,167,251,13,212,81,208,156,85,88,15,228,221,10,66,127,144,245,41])
);

const connection = new Connection(RPC, "confirmed");
const wallet = new anchor.Wallet(adminKeypair);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });

const idl = JSON.parse(readFileSync("./target/idl/ghonsi_proof.json", "utf8"));
const program = new anchor.Program(idl, provider);

const [programAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from("program_authority")],
  PROGRAM_ID
);

console.log("Program Authority PDA:", programAuthority.toBase58());
console.log("Admin:", adminKeypair.publicKey.toBase58());

try {
  const tx = await program.methods
    .initialize(COLLECTION_MINT)
    .accounts({
      admin: adminKeypair.publicKey,
      programAuthority,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Initialized! Tx:", tx);
} catch (e) {
  if (e.message?.includes("already in use") || e.message?.includes("0x0")) {
    console.log("⚠️  Already initialized under this program — you're good!");
  } else {
    console.error("❌ Error:", e.message);
  }
}
