import wallet from "./wallet/turbine-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("HDECQTLc6FdR5VwzTgSujfWgtdmnsFnpJq8ctJQirW1T")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint,
            mintAuthority: signer
        }

        let data: DataV2Args = {
            name: "parthesh's spl token",
            symbol: "PARTH",
            sellerFeeBasisPoints: 500,
            uri: "",
            collection: null,
            creators: null,
            uses: null,
        };

        let args: CreateMetadataAccountV3InstructionArgs = {
            isMutable: true,
            collectionDetails: null,
            data,
        };


        let tx = createMetadataAccountV3(umi, {
            ...accounts,
            ...args,
        });

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
