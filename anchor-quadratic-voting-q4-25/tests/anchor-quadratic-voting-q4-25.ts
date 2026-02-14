import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorQuadraticVotingQ425 } from "../target/types/anchor_quadratic_voting_q4_25";

describe("anchor-quadratic-voting-q4-25", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorQuadraticVotingQ425 as Program<AnchorQuadraticVotingQ425>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
