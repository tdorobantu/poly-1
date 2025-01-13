import { ethers } from "ethers";
import getProvider from "../../services/providerSingleton.ts";

export function getWallet(walletPrivateKey: string): ethers.Wallet {
  console.log("🚀 Initializing Wallet and Provider...");

  // Step 1: Set up the provider
  const provider = getProvider();
  console.log("🌐 Connected to RPC Provider:");
  console.log(`   ➡️ RPC URL: ${provider.connection.url}`);

  // Step 2: Initialize the wallet with the private key
  let wallet = new ethers.Wallet(walletPrivateKey);
  console.log("🔑 Wallet Initialized:");
  console.log(`   ➡️ Wallet Address: ${wallet.address}`);

  // Step 3: Connect the wallet to the provider
  wallet = wallet.connect(provider);
  console.log("🔗 Wallet Connected to Provider:");
  console.log(`   ➡️ Connected Network: ${provider.connection.url}`);

  // Step 4: Test the provider connection
  provider
    .getNetwork()
    .then((network) => {
      console.log("🌍 Network Details:");
      console.log(`   ➡️ Name: ${network.name}`);
      console.log(`   ➡️ Chain ID: ${network.chainId}`);
    })
    .catch((error) => {
      console.error("❌ Error Fetching Network Details:", error);
    });

  return wallet;
}

export default getWallet;
