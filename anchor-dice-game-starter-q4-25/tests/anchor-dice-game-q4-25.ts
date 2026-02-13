import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorDiceGameQ425 } from "../target/types/anchor_dice_game_q4_25";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { expect } from "chai";

describe("anchor_dice_game_q4_25", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .anchorDiceGameQ425 as Program<AnchorDiceGameQ425>;

  const house = provider.wallet;
  const player = Keypair.generate();

  let vaultPda: PublicKey;
  let betPda: PublicKey;

  const seed = new anchor.BN(999);
  const betAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
  const roll = 50; // must be between 2 and 96

  before(async () => {
    const sig = await provider.connection.requestAirdrop(
      player.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), house.publicKey.toBuffer()],
      program.programId
    );

    [betPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("bet"),
        vaultPda.toBuffer(),
        seed.toArrayLike(Buffer, "le", 16),
      ],
      program.programId
    );
  });

  it("Initializes vault", async () => {
    await program.methods
      .initialize(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accountsPartial({
        house: house.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const balance = await provider.connection.getBalance(vaultPda);
    expect(balance).to.be.greaterThan(0);
  });

  it("Places bet", async () => {
    await program.methods
      .placeBet(seed, roll, betAmount)
      .accountsPartial({
        player: player.publicKey,
        house: house.publicKey,
        vault: vaultPda,
        bet: betPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([player])
      .rpc();

    const betAccount = await program.account.bet.fetch(betPda);

    expect(betAccount.player.toString()).to.equal(
      player.publicKey.toString()
    );
    expect(betAccount.amount.toNumber()).to.equal(
      betAmount.toNumber()
    );
    expect(betAccount.roll).to.equal(roll);
  });

  it("Resolves bet", async () => {
    const betAccount = await program.account.bet.fetch(betPda);

    const message = Buffer.concat([
      betAccount.player.toBuffer(),
      seed.toArrayLike(Buffer, "le", 16),
      new anchor.BN(betAccount.slot).toArrayLike(Buffer, "le", 8),
      betAmount.toArrayLike(Buffer, "le", 8),
      Buffer.from([roll, betAccount.bump]),
    ]);

    const signature = nacl.sign.detached(
      message,
      house.payer.secretKey
    );

    const edIx =
      anchor.web3.Ed25519Program.createInstructionWithPublicKey({
        publicKey: house.publicKey.toBytes(),
        message,
        signature,
      });

    const tx = new anchor.web3.Transaction();
    tx.add(edIx);

    const resolveIx = await program.methods
      .resolveBet(Buffer.from(signature))
      .accountsPartial({
        house: house.publicKey,
        player: player.publicKey,
        vault: vaultPda,
        bet: betPda,
        instructionSysvar:
          anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(resolveIx);

    await provider.sendAndConfirm(tx);

    const betClosed =
      await provider.connection.getAccountInfo(betPda);

    expect(betClosed).to.be.null;
  });


  it("Refund fails before timeout", async () => {
    const newSeed = new anchor.BN(12345);

    const [newBetPda] =
      PublicKey.findProgramAddressSync(
        [
          Buffer.from("bet"),
          vaultPda.toBuffer(),
          newSeed.toArrayLike(Buffer, "le", 16),
        ],
        program.programId
      );

    await program.methods
      .placeBet(newSeed, roll, betAmount)
      .accountsPartial({
        player: player.publicKey,
        house: house.publicKey,
        vault: vaultPda,
        bet: newBetPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([player])
      .rpc();

    try {
      await program.methods
        .refundBet()
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault: vaultPda,
          bet: newBetPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      expect.fail("Refund should not succeed");
    } catch (err) {
      expect(err).to.exist;
    }
  });
});