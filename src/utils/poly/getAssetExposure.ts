import { Side } from "@polymarket/clob-client";
import { getClobClient } from "../../services/clobClientSingleton.ts";
import getPolymarketPositions from "./getPolymarketPositions.ts";

const getAssetExposure = async (market: string, assetId: string) => {
  const USER = process.env.WALLET_POLY_MARKET;
  let exposure = 0;
  let availableToClose = 0;
  let totalShares = 0;
  let totalSellShares = 0;

  try {
    console.log("⚖️ Fetching open positions!");
    const openPositions = await getPolymarketPositions(USER, market);
    // console.log(positions AsyncResource, )

    console.log("📔 Initializing clobClient!");
    const clobClient = await getClobClient();
    console.log("✅ ClobClient initialized successfully!");

    console.log(`📊 Fetching open orders for market: ${market}...`);
    const openOrders = await clobClient.getOpenOrders({ asset_id: assetId });
    console.log("📜 Open orders retrieved");

    console.log("The open orders are: ");
    console.log(openOrders);

    const totalOpenPositions = openPositions.reduce(
      (total, position) => total + position.initialValue,
      0
    );

    const totalOpenOrders = openOrders.reduce(
      (total, { original_size, size_matched, price }) =>
        total + (Number(original_size) - Number(size_matched)) * Number(price),
      0
    );

    const totalBuyOpenOrders = openOrders
      .filter((order) => order.side === Side.BUY)
      .reduce(
        (total, { original_size, size_matched, price }) =>
          total +
          (Number(original_size) - Number(size_matched)) * Number(price),
        0
      );

    const totalSellOpenOrders = openOrders
      .filter((order) => order.side === Side.SELL)
      .reduce(
        (total, { original_size, size_matched, price }) =>
          total +
          (Number(original_size) - Number(size_matched)) * Number(price),
        0
      );

    exposure = totalOpenPositions + totalBuyOpenOrders;

    totalShares = openPositions.reduce((total, { size }) => total + size, 0);

    totalSellShares = openOrders
      .filter((order) => order.side === Side.SELL)
      .reduce(
        (total, { original_size, size_matched, price }) =>
          total + (Number(original_size) - Number(size_matched)),
        0
      );

    availableToClose = totalShares - totalSellShares;

    console.log(
      `👺 💵 Exposure is ${exposure}  Current open Positions are ${totalOpenPositions}, BUY orders are ${totalBuyOpenOrders} and SELL orders ${totalSellOpenOrders}`
    );

    console.log("🤑 Available to close ", availableToClose);
    console.log("Current shares you own ", totalShares);
  } catch (error) {
    console.error("❌ An error occurred while fetching market data:");
    console.error(error);
    throw error; // Re-throw the error for higher-level handling if needed.
  }

  //   console.log(JSON.stringify(marketData));
  return { exposure, availableToClose, totalShares, totalSellShares };
};

export default getAssetExposure;
