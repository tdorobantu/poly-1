import "dotenv/config";
import { ethers } from "ethers";
import { Chain, ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";

const rpcUrl = "https://polygon-rpc.com";
const privateKey = process.env.WALLET_PK || ""; // Private key from environment variables
const host = process.env.CLOB_API_URL || "http://localhost:8080";
const proxyAddress = process.env.WALLET_PROXY_ADDRESS
const chainId = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 137; // Polygon Mainnet Chain ID

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

console.log("the wallet is ", wallet)

async function createL1Header() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = "101";
  const signingAddress = await wallet.getAddress();

  const domain = {
    name: "ClobAuthDomain",
    version: "1",
    chainId: chainId,
  };

  const types = {
    ClobAuth: [
      { name: "address", type: "address" },
      { name: "timestamp", type: "string" },
      { name: "nonce", type: "uint256" },
      { name: "message", type: "string" },
    ],
  };

  const value = {
    address: signingAddress,
    timestamp: timestamp,
    nonce: nonce,
    message: "This message attests that I control the given wallet",
  };

  const signature = await wallet._signTypedData(domain, types, value);

  const isValidSignature = ethers.utils.verifyTypedData(domain, types, value, signature) === await wallet.getAddress();
  console.log("Is the signature valid?", isValidSignature);

  return {
    POLY_ADDRESS: signingAddress,
    POLY_SIGNATURE: signature,
    POLY_TIMESTAMP: timestamp,
    POLY_NONCE: nonce,
  };
}



(async () => {
  try {
    const l1Header = await createL1Header();
    console.log("L1 Header:", l1Header);
    console.log("wallet.getChainId():", await wallet.getChainId());

    const clobClient = new ClobClient(
        host as string,
        (await wallet.getChainId()) as number,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
        undefined, 
        SignatureType.POLY_PROXY,
        proxyAddress
      );
      
    console.log("CLOB CLIENT: ", clobClient)  

    console.log(`Server time: ${(await clobClient.getServerTime()).toLocaleString()}`);

    const response = await clobClient.createApiKey(101);
    console.log("API Key Created:", response);
  } catch (error) {
    console.error("Error:", error);
  }
})();