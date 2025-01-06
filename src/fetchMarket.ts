import {
  OpenOrdersResponse,
  OrderBookSummary,
  Trade,
} from "@polymarket/clob-client";
import { getClobClient } from "./services/clobClientSingleton.ts";
import MarketData from "./types/MarketData";

const fetchMarket = async () => {
  let marketData: MarketData;

  try {
    console.log("🚀 Starting market data fetch...");

    const NO =
      "70153859989212405649302660029170495449818146693944403467922191183238786687468";
    const MARKET =
      "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd";

    console.log("🔗 Fetching ClobClient...");
    const clobClient = await getClobClient();
    console.log("✅ ClobClient initialized successfully!");

    console.log(`📊 Fetching open orders for market: ${MARKET}...`);
    const openOrders = await clobClient.getOpenOrders({ asset_id: NO });
    console.log("📜 Open orders retrieved");

    console.log(`🪙 Fetching positions: ${MARKET}...`);
    const positions = await clobClient.getTrades({
      asset_id: NO,
      //   maker: process.env.WALLET_POLY_MARKET,
    });
    console.log("📜 Positions retrieved");

    console.log(`📖 Fetching order book for asset ID: ${NO}...`);
    const orderBook = await clobClient.getOrderBook(NO);
    console.log("📚 Order book retrieved");

    console.log("🎉 Market data fetch completed successfully!");

    marketData = {
      orderBook,
      openOrders,
      positions,
    };
  } catch (error) {
    console.error("❌ An error occurred while fetching market data:");
    console.error(error);
    throw error; // Re-throw the error for higher-level handling if needed.
  }

  console.log(JSON.stringify(marketData));
  return marketData;
};

export default fetchMarket;
