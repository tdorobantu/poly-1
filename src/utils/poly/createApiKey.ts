import { ethers } from "ethers";
import { ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import createL1Header from "./createL1Header"; // Import the previously created createL1Header function


// ! Not tested!
const createApiKey = async (
  nonce: string,
  wallet: ethers.Wallet,
  proxyAddress: string,
  host: string
) => {
  try {
    // Generate L1 Header
    const l1Header = await createL1Header(nonce, wallet);
    console.log("L1 Header:", l1Header);

    // Fetch Chain ID from the wallet's provider
    const chainId = await wallet.getChainId();
    console.log("wallet.getChainId():", chainId);

    // Initialize ClobClient
    const clobClient = new ClobClient(
      host,
      chainId,
      wallet,
      undefined, // No additional credentials
      SignatureType.POLY_GNOSIS_SAFE,
      proxyAddress
    );

    console.log("CLOB CLIENT:", clobClient);

    // Fetch Server Time
    const serverTime = await clobClient.getServerTime();
    console.log("Server time:", serverTime.toLocaleString());

    // Create API Key
    const response = await clobClient.createApiKey(Number(nonce));
    console.log("API Key Created:", response);

    return response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default createApiKey;