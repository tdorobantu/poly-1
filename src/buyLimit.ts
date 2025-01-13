import { OpenOrdersResponse, OrderBookSummary } from "@polymarket/clob-client";
import { getClobClient } from "./services/clobClientSingleton.ts";
import getUSDCBalance from "./utils/ethers/getBalance.ts";
import getPolymarketPositions from "./utils/poly/getPolymarketPositions.ts";

type MarketData = null | {
  orderBook: OrderBookSummary;
  openOrders: OpenOrdersResponse;
};

const buyLimit = async ({
  input,
}: {
  input: {
    walletLimit: number;
    tradeLimit: number;
    market: string;
    assetId: string;
  };
}) => {
  const { walletLimit, tradeLimit, market, assetId } = input;
  const USER = process.env.WALLET_POLY_MARKET;
  let exposure = 0;

  try {
    console.log("⚖️ Fetching Fetching current wallet balance.");
    const balance = await getUSDCBalance(process.env.WALLET_POLY_MARKET);
    console.log(
      `The USDC balance for wallet ${process.env.WALLET_POLY_MARKET} is ${balance}`
    );
    const isBelowWalletLimit = Number(balance) <= walletLimit;

    if (isBelowWalletLimit) {
      console.log(
        `Current wallet value of ${balance} is BELOW the wallet limit of ${walletLimit} ❌ 💳`
      );
    }
    if (!isBelowWalletLimit) {
      console.log(
        `Current wallet value of ${balance} is ABOVE the wallet limit of ${walletLimit} ✅ 💳`
      );
    }

    console.log("⚖️ Fetching open positions!");
    const openPositions = await getPolymarketPositions(USER, market);

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

    const isAboveTradeLimit =
      totalOpenOrders + totalOpenPositions >= tradeLimit;

    if (isAboveTradeLimit) {
      console.log(
        `Exposed positions of ${
          totalOpenOrders + totalOpenPositions
        } is ABOVE the TRADE limit of ${tradeLimit} ❌ 💳. Current open Positions are ${totalOpenPositions} and open BUY orders are ${totalOpenOrders}`
      );
    }
    if (!isAboveTradeLimit) {
      console.log(
        `Exposed positions of ${
          totalOpenOrders + totalOpenPositions
        } is BELOW the TRADE limit of ${tradeLimit} ✅ 💳. Current open Positions are ${totalOpenPositions} and open BUY orders are ${totalOpenOrders}`
      );
    }
    exposure = tradeLimit - (totalOpenOrders + totalOpenPositions);
  } catch (error) {
    console.error("❌ An error occurred while fetching market data:");
    console.error(error);
    throw error; // Re-throw the error for higher-level handling if needed.
  }

  //   console.log(JSON.stringify(marketData));
  return exposure;
};

export default buyLimit;
