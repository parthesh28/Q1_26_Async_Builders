import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorDiceGameQ425 } from "../target/types/anchor_dice_game_q4_25";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { randomBytes } from "crypto";

describe("anchor-dice-game-q4-25", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorDiceGameQ425 as Program<AnchorDiceGameQ425>;

  let house = new Keypair();
  let player = new Keypair();
  let seed = new BN(randomBytes(16));
  let vault = PublicKey.findProgramAddressSync([Buffer.from("vault"), house.publicKey.toBuffer()], program.programId);
  let bet = PublicKey.findProgramAddressSync([Buffer.from("bet"), seed.toBuffer("le", 16)], program.programId);
  let signature: Uint8Array; 
    
  it("Airdrop", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
