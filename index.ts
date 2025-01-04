import "dotenv/config";
import { ethers, Wallet } from "ethers";
import {  AssetType, ClobClient, OrderType, Side } from "@polymarket/clob-client";
// import { Side, SignatureType } from "@polymarket/order-utils";
import ApiKeyCreds from "./types/ApiKeyCreds";

import getWallet from "./getWallet.ts";
import usdcAbi from "./abi/usdcAbi.ts";
import getUsdcContract from "./getUsdcContract.ts";
import getCtfContract from "./getCtfContract.ts";
import approveAllowances from "./approveAllowances.ts";
import { SignatureType } from "@polymarket/order-utils";



// console.log("usdcAbi is", usdcAbi)

const rpcUrl = "https://polygon-rpc.com";
const privateKey = process.env.WALLET_PK || ""; // Private key from environment variables
const host = process.env.CLOB_API_URL || "http://localhost:8080";
const chainId = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 137; // Polygon Mainnet Chain ID
const usdcAddress = process.env.USDC_ADDRESS || ""
const polymarketAddress = process.env.WALLET_POLY_MARKET

const wallet = getWallet(rpcUrl, privateKey)

console.log("______________________________")

// const signer = new ethers.Wallet(`${process.env.PK}`);

const creds: ApiKeyCreds = {
    key: `${process.env.CLOB_API_KEY}`,
    secret: `${process.env.CLOB_SECRET}`,
    passphrase: `${process.env.CLOB_PASS_PHRASE}`,
};

// Initialize the clob client
// NOTE: the signer must be approved on the CTFExchange contract

// Initialization of a client using a Polymarket Proxy Wallet associated with a Browser Wallet(Metamask, Coinbase Wallet)
const clobClient = new ClobClient(
  host as string,
  (await wallet.getChainId()) as number,
  wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
  creds, // creds
  SignatureType.POLY_GNOSIS_SAFE,
  polymarketAddress
);

const collateral = await clobClient.getBalanceAllowance({ asset_type: AssetType.COLLATERAL });
console.log(collateral);

// const no = await clobClient.getBalanceAllowance({
//   asset_type: AssetType.CONDITIONAL,
//   token_id: '70153859989212405649302660029170495449818146693944403467922191183238786687468',
// });

// console.log("allowance", no);
// const market = await clobClient.getMarket("0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd");
// console.log(`market: `);
// console.log(market);

// Create a buy order for 100 NO for 0.50c
    const NO = '70153859989212405649302660029170495449818146693944403467922191183238786687468';
    // const oneMinute = parseInt(((new Date().getTime() + 60 * 1000 + 10 * 1000) / 1000).toString());

    const order = await clobClient.createOrder({
        tokenID: NO,
        price: 0.23,
        side: Side.SELL,
        size: 5,
    });
    // console.log("Created Order", order);

    // Send it to the server
    const responseOne = await clobClient.postOrder(order, OrderType.GTC);
    console.log(responseOne);
    



    // const cancelOrder = await clobClient.cancelOrder({
    //   orderID:
    //     "0x743c30420927c5c6f230b17d7e4b81a3acdec3d260dbfe0f98f68fd23266d398",
    // });

    const resp = await clobClient.getOpenOrders({
      market:
        "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd",
    });

    console.log(resp);
    console.log(`Done!`);

    // console.log(cancelOrder);
    // console.log(`Done!`);
 
    