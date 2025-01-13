import { getClobClient } from "./services/clobClientSingleton.ts";
import MarketData from "./types/MarketData";
import getAssetExposure from "./utils/poly/getAssetExposure.ts";
import getUSDCBalance from "./utils/ethers/getBalance.ts";

const fetchMarketData = async ({
  input,
}: {
  input: { market: string; assetId: string };
}) => {
  let marketData: MarketData;

  const { market, assetId } = input;

  try {
    console.log("🚀 Starting market data fetch...");

    const exposure = await getAssetExposure(market, assetId);
    const walletBalance = await getUSDCBalance(process.env.WALLET_POLY_MARKET);

    console.log("🔗 Fetching ClobClient...");
    const clobClient = await getClobClient();
    console.log("✅ ClobClient initialized successfully!");

    console.log(`📊 Fetching open orders for market: ${market}...`);
    const openOrders = await clobClient.getOpenOrders({ asset_id: assetId });
    console.log("📜 Open orders retrieved");

    console.log(`📖 Fetching order book for asset ID: ${assetId}...`);
    const orderBook = await clobClient.getOrderBook(assetId);
    console.log("📚 Order book retrieved");

    console.log("🎉 Market data fetch completed successfully!");

    marketData = {
      orderBook,
      openOrders,
      exposure,
      walletBalance: Number(walletBalance),
    };
  } catch (error) {
    console.error("❌ An error occurred while fetching market data:");
    console.error(error);
    throw error; // Re-throw the error for higher-level handling if needed.
  }

  console.log(JSON.stringify(marketData));
  return marketData;
};

export default fetchMarketData;
