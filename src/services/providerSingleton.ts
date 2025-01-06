import { ethers } from "ethers";

// Singleton provider instance
let providerInstance: ethers.providers.JsonRpcProvider | null = null;

// Function to get the provider instance
const getProvider = (rpcUrl: string): ethers.providers.JsonRpcProvider => {
  if (!providerInstance) {
    console.log("🚀 Initializing JsonRpcProvider...");
    providerInstance = new ethers.providers.JsonRpcProvider(rpcUrl);
  } else {
    console.log("ℹ️ Reusing existing JsonRpcProvider instance.");
  }

  return providerInstance;
};

export default getProvider;
