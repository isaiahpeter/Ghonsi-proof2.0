import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";

const PROGRAM_ID = new PublicKey("R5w9rgUewEGau8vpnSj4YuS5zMLHsN28hTz4rKca5hQ");
const CORRECT_COLLECTION = new PublicKey("8QKKVTntxsEJjsk1M59tLuvCwGR9NwMgJwDGfZEGrR5");

const adminKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync("/home/ome/.config/solana/id.json", "utf8")))
);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(adminKeypair);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
const idl = JSON.parse(readFileSync("./target/idl/ghonsi_proof.json", "utf8"));
const program = new anchor.Program(idl, provider);

const [programAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from("program_authority")], PROGRAM_ID
);

const tx = await program.methods
  .setCollection(CORRECT_COLLECTION)
  .accounts({ admin: adminKeypair.publicKey, programAuthority })
  .rpc();

console.log("✅ Collection mint fixed:", tx);
