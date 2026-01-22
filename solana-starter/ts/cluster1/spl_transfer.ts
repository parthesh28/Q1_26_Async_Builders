import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "./wallet/turbine-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("AgapPgUumbnxK1oPPL2C4MdRLM1xkSGxxut6GET4UB3m");

// Recipient address
const to = new PublicKey("PaRthHNJza6pPFnz4iX7T1YFQfJrnodKTNMjacVcaQq");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it

        let fromAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
        );

        // Get the token account of the toWallet address, and if it does not exist, create it

        let toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to,
        );

        // Transfer the new token to the "toTokenAccount" we just created
        let signature = await transfer(
            connection,
            keypair,
            fromAta.address,
            toAta.address,
            keypair.publicKey,
            50_000_000,
        );

        console.log("Transaction signature" + signature);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();