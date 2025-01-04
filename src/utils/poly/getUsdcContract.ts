import { ethers } from "ethers";
import { getContractConfig } from "../../config/config.ts";
import usdcAbi from "../../abi/usdcAbi.ts";


const getUsdcContract = async (wallet: ethers.Wallet): Promise<ethers.Contract> => {
    console.log("🚀 Initializing USDC Contract...");

    const chainId = await wallet.getChainId()

    console.log("⛓ Chain Id is ", chainId)
    // Step 1: Fetch contract configuration for the given chain ID
    const contractConfig = getContractConfig(chainId);
    console.log("🌐 Contract Configuration:");
    console.log(`   ➡️ Chain ID: ${chainId}`);
    console.log(`   ➡️ Collateral Address (USDC): ${contractConfig.collateral}`);

    // Step 2: Create a new contract instance
    const usdcContract = new ethers.Contract(contractConfig.collateral, usdcAbi, wallet);
    console.log("✅ USDC Contract Initialized:");
    console.log(`   ➡️ Contract Address: ${usdcContract.address}`);
    console.log(`   ➡️ Wallet Address: ${wallet.address}`);

    // Step 3: Test the contract connection
    usdcContract.name()
        .then((name: string) => {
            console.log(`🔍 USDC Contract Name: ${name}`);
        })
        .catch((error: any) => {
            console.error("❌ Error Fetching Contract Name:", error);
        });

    return usdcContract;
}

export default getUsdcContract