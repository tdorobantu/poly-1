import { ethers } from "ethers";
import getProvider from "./../../services/providerSingleton.ts";

// USDC Contract ABI (minimal ABI for balanceOf)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// USDC Contract Address on Polygon

const getUSDCBalance = async (walletAddress: string) => {
  try {
    // Get the provider instance
    const provider = getProvider();

    // Instantiate the USDC contract
    const usdcContract = new ethers.Contract(
      process.env.USDC_ADDRESS,
      ERC20_ABI,
      provider
    );

    // Fetch the balance
    const rawBalance = await usdcContract.balanceOf(walletAddress);

    // Get the number of decimals for USDC (usually 6 for USDC)
    const decimals = await usdcContract.decimals();

    // Format the balance
    const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);

    console.log(`💵 USDC Balance of ${walletAddress}:`, formattedBalance);
    return formattedBalance;
  } catch (error) {
    console.error("❌ Error fetching USDC balance:", error);
    throw error;
  }
};

export default getUSDCBalance;
