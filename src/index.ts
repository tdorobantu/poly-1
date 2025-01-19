import "dotenv/config";
import { createActor } from "xstate";
import bsTrader from "./xstate/machines/bsTrader.ts";
import { getClobClient } from "./services/clobClientSingleton.ts";
import { AssetType, OrderType, Side } from "@polymarket/clob-client";
import getBalance from "./utils/ethers/getBalance.ts";
import getPolymarketPositions from "./utils/poly/getPolymarketPositions.ts";
import getAssetExposure from "./utils/poly/getAssetExposure.ts";
import fetchMarket from "./xstate/promiseActors/fetchMarketData.ts";
import cancelOrdersByAssetId from "./utils/poly/cancelOrdersByAssetId.ts";
import isBelowWalletLimit from "./utils/ethers/isBelowWalletLimit.ts";

const PERFORM_TEST_TRADES = false;

const MARKET =
  "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd";

const ASSET_ID =
  "70153859989212405649302660029170495449818146693944403467922191183238786687468";

const UNTIL_MAY_OF_THIS_YEAR = 1746046800;

const clobClient = await getClobClient();

// const openPositions = await getPolymarketPositions(
//   process.env.WALLET_POLY_MARKET,
//   MARKET
// );
// console.log("open Positions are", openPositions);

// ! ORDER CANCELING LOGIC
// const cancelOrder = await clobClient.cancelOrders([
//   "0x269b3a321bba03412a948b2067b8520fac77e88992371ada17d3708cfa3c33a3",
// ]);

// console.log("the response to cancel order was", cancelOrder);

await cancelOrdersByAssetId(ASSET_ID, Side.SELL);
// ! ORDER CANCELING LOGIC ENDS

const input = {
  assetId: ASSET_ID,
  market: MARKET,
  walletLimit: 290,
  tradeLimit: 30,
  timeLimit: UNTIL_MAY_OF_THIS_YEAR,
};

// Create the actor and pass the input values to the context
const actor = createActor(bsTrader, {
  input: input, // Pass input values here
});

actor.subscribe((snapshot) => {
  console.log(snapshot.value);
});

// Actors must be started by calling `actor.start()`, which will also start the actor system.
// actor.start();

if (PERFORM_TEST_TRADES) {
  console.log("⛔️ PERFORMING TEST TRADES ⛔️");

  const order1 = await clobClient.createOrder({
    tokenID: ASSET_ID,
    price: 0.4,
    side: Side.SELL,
    size: 7,
    feeRateBps: 0,
    nonce: 0,
  });

  const resp = await clobClient.postOrder(order1, OrderType.GTC);
  console.log(resp);

  // const order2 = await clobClient.createOrder({
  //   tokenID: ASSET_ID,
  //   price: 0.32,
  //   side: Side.SELL,
  //   size: 7,
  //   feeRateBps: 0,
  //   nonce: 0,
  // });

  // const resp2 = await clobClient.postOrder(order2, OrderType.GTC);
  // console.log(resp2);

  // const order3 = await clobClient.createOrder({
  //   tokenID: ASSET_ID,
  //   price: 0.6,
  //   side: Side.SELL,
  //   size: 7,
  //   feeRateBps: 0,
  //   nonce: 0,
  // });

  // const resp3 = await clobClient.postOrder(order3, OrderType.GTC);
  // console.log(resp3);

  // const order4 = await clobClient.createOrder({
  //   tokenID: ASSET_ID,
  //   price: 0.35,
  //   side: Side.SELL,
  //   size: 7,
  //   feeRateBps: 0,
  //   nonce: 0,
  // });
  // const start = Date.now();
  // const resp4 = await clobClient.postOrder(order4, OrderType.GTC);
  // const total = Date.now() - start;

  // console.log(resp4);

  // console.log("last trade took " + total + " (ms)");
} else {
  console.log("TEST TRADES ARE OFF 🎚️");
}

// Send events to the machine
