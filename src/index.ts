import "dotenv/config";
import { ethers } from "ethers";
import {  ClobClient } from "@polymarket/clob-client";
import getWallet from "./utils/poly/getWallet.ts";
import { SignatureType } from "@polymarket/order-utils";
import getCredentials from "./utils/poly/getCredentials.ts";
import { createActor } from "xstate";
import simpleMachine from "./xstate/machines/marketMaker.ts";


const rpcUrl = "https://polygon-rpc.com";
const privateKey = process.env.WALLET_PK || "";
const host = process.env.CLOB_API_URL || "http://localhost:8080";
const polymarketAddress = process.env.WALLET_POLY_MARKET

const wallet = getWallet(rpcUrl, privateKey)

const creds = getCredentials()

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



const NO = '70153859989212405649302660029170495449818146693944403467922191183238786687468';


const openOrders = await clobClient.getOpenOrders({
  market:
    "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd",
});

console.log("The openOrders are ", openOrders)

const orderBook = await clobClient.getOrderBook(NO)


console.log("The order book is ", orderBook)

// Creating the actor, which implicitly creates an actor system with itself as the root actor
const actor = createActor(simpleMachine);

actor.subscribe((snapshot) => {
  console.log(snapshot.value);
});

// Actors must be started by calling `actor.start()`, which will also start the actor system.
actor.start();


// Send events to the machine


// const market = await clobClient.getMarket("0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd");
