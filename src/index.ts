import "dotenv/config";
import { createActor } from "xstate";
import bsTrader from "./xstate/machines/bsTrader.ts";
import { getClobClient } from "./services/clobClientSingleton.ts";
import { AssetType, OrderType, Side } from "@polymarket/clob-client";
import getBalance from "./utils/ethers/getBalance.ts";
import getPolymarketPositions from "./utils/poly/getPolymarketPositions.ts";
import buyLimit from "./buyLimit.ts";
import fetchMarket from "./fetchMarket.ts";
import cancelOrdersByAssetId from "./utils/poly/cancelOrdersByAssetId.ts";

// const clobClient = await getClobClient();

// const balance = await getBalance(process.env.WALLET_POLY_MARKET);

const MARKET =
  "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd";

const ASSET_ID =
  "70153859989212405649302660029170495449818146693944403467922191183238786687468";

// const currentPosition = await getPolymarketPositions(
//   process.env.WALLET_POLY_MARKET,
//   "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd"
// );

// const clobClient = await getClobClient();

// const order1 = await clobClient.createOrder({
//   tokenID: ASSET_ID,
//   price: 0.14,
//   side: Side.BUY,
//   size: 7,
//   feeRateBps: 0,
//   nonce: 0,
// });

// const resp = await clobClient.postOrder(order1, OrderType.GTC);
// console.log(resp);

// const order2 = await clobClient.createOrder({
//   tokenID: ASSET_ID,
//   price: 0.12,
//   side: Side.BUY,
//   size: 7,
//   feeRateBps: 0,
//   nonce: 0,
// });

// const resp2 = await clobClient.postOrder(order2, OrderType.GTC);
// console.log(resp2);

await cancelOrdersByAssetId(ASSET_ID, Side.BUY);

const input = {
  walletLimit: 300,
  tradeLimit: 10,
  market: MARKET,
  assetId: ASSET_ID,
};

const output = await buyLimit({ input });

// await fetchMarket();

// console.log("This is the currentPosition", currentPosition);

// Creating the actor, which implicitly creates an actor system with itself as the root actor
// Input parameters
// const inputValues = {
//   assetId:
//     "70153859989212405649302660029170495449818146693944403467922191183238786687468",
//   market: "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd",
//   tradeLimit: 30,
// };

// Create the actor and pass the input values to the context
// const actor = createActor(bsTrader, {
//   input: inputValues, // Pass input values here
// });

// actor.subscribe((snapshot) => {
//   console.log(snapshot.value);
// });

// Actors must be started by calling `actor.start()`, which will also start the actor system.
// actor.start();

// Send events to the machine

// const market = await clobClient.getMarket("0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd");
