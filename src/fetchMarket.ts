import { OpenOrdersResponse, OrderBookSummary } from "@polymarket/clob-client";
import { getClobClient } from "./services/clobClientSingleton";

type MarketData = null | {orderBook: OrderBookSummary, openOrders: OpenOrdersResponse}

const fetchMarket = async () => {

    let marketData: MarketData 

    try {
        console.log("🚀 Starting market data fetch...");

        const NO = "70153859989212405649302660029170495449818146693944403467922191183238786687468";
        const MARKET = "0xb7faecd2db357e4634fe87ef9bb48b4e1305cd618276d730b73190662fe6bafd";

        console.log("🔗 Fetching ClobClient...");
        const clobClient = await getClobClient();
        console.log("✅ ClobClient initialized successfully!");

        console.log(`📊 Fetching open orders for market: ${MARKET}...`);
        const openOrders = await clobClient.getOpenOrders({ market: MARKET });
        console.log("📜 Open orders retrieved:");
        console.log(openOrders);

        console.log(`📖 Fetching order book for asset ID: ${NO}...`);
        const orderBook = await clobClient.getOrderBook(NO);
        console.log("📚 Order book retrieved:");
        console.log(orderBook);

        console.log("🎉 Market data fetch completed successfully!");

        marketData = {orderBook, openOrders}
    } catch (error) {
        console.error("❌ An error occurred while fetching market data:");
        console.error(error);
        throw error; // Re-throw the error for higher-level handling if needed.
    }

    return marketData 
};

export default fetchMarket;