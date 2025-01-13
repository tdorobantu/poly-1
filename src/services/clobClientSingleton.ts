import { ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import getCredentials from "../utils/poly/getCredentials.ts";
import getWallet from "../utils/poly/getWallet.ts";

let clobClientInstance: ClobClient | null = null;

export const getClobClient = async (): Promise<ClobClient> => {
  if (!clobClientInstance) {
    console.log("🚀 Initializing ClobClient...");

    const privateKey = process.env.WALLET_PK || "";
    const host = process.env.CLOB_API_URL || "http://localhost:8080";
    const polymarketAddress = process.env.WALLET_POLY_MARKET;

    const wallet = getWallet(privateKey);
    const creds = getCredentials();

    clobClientInstance = new ClobClient(
      host,
      await wallet.getChainId(),
      wallet,
      creds,
      SignatureType.POLY_GNOSIS_SAFE,
      polymarketAddress
    );

    console.log("✅ ClobClient initialized!");
  } else {
    console.log("ℹ️ Returning existing ClobClient instance.");
  }

  return clobClientInstance;
};
