import { ethers } from "ethers";
import { getContractConfig } from "./config.ts";
import ctfAbi from "./abi/ctfAbi.ts";

const getCtfContract = async (wallet: ethers.Wallet): Promise<ethers.Contract> => {
    console.log("🚀 Initializing CTF (Conditional Tokens Framework) Contract...");

    // Step 1: Get the Chain ID from the wallet
    const chainId = await wallet.getChainId();
    console.log("⛓ Chain ID is", chainId);

    // Step 2: Fetch contract configuration for the given chain ID
    const contractConfig = getContractConfig(chainId);
    console.log("🌐 Contract Configuration:");
    console.log(`   ➡️ Chain ID: ${chainId}`);
    console.log(`   ➡️ Conditional Tokens Address: ${contractConfig.conditionalTokens}`);

    // Step 3: Create a new contract instance
    const ctfContract = new ethers.Contract(contractConfig.conditionalTokens, ctfAbi, wallet);
    console.log("✅ CTF Contract Initialized:");
    console.log(`   ➡️ Contract Address: ${ctfContract.address}`);
    console.log(`   ➡️ Wallet Address: ${wallet.address}`);


 // Step 4: Test the contract connection using a valid method
    try {
        const isSupported = await ctfContract.supportsInterface("0x01ffc9a7"); // ERC-165 interface ID
        console.log(`🔍 Does CTF Contract Support ERC-165? ${isSupported}`);
    } catch (error) {
        console.error("❌ Error Testing Contract Interaction:", error.message);
    }


    return ctfContract;
};

export default getCtfContract;