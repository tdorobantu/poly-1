import { OrderType, Side } from "@polymarket/clob-client";
import { getClobClient } from "../../services/clobClientSingleton.ts";
import MarketData from "../../types/MarketData";
import logToFile from "../../utils/logToFile.ts";

const placeOrders = async ({
  input,
}: {
  input: {
    tradeLimit: number;
    walletLimit: number;
    marketData: MarketData;
    assetId: string;
    bidLimit: number;
    askLimit: number;
  };
}) => {
  const { tradeLimit, walletLimit, marketData, assetId, bidLimit } = input;

  const { availableToClose, walletBalance, exposure, orderBook, totalShares } =
    marketData;

  if (walletLimit >= walletBalance) {
    console.log("💳 ⛔️ Wallet Limit Reached. No Bets being placed!");
  }

  const availableToBid = tradeLimit - exposure;
  const isAboveWalletLimit = walletLimit <= walletBalance;
  // GET BID and ASK Prices
  const bid = Math.max(...orderBook.bids.map((bid) => Number(bid.price)));
  const ask = Math.min(...orderBook.asks.map((ask) => Number(ask.price)));

  // GET Shares
  console.log("availableToClose / bid: ", Math.floor(availableToClose / bid));
  console.log("totalShares: ", totalShares);
  const sharesToBuy = Math.floor(availableToBid / bid);
  const sharesToSell = totalShares;

  const placeOrderData = {
    availableToBid,
    availableToClose,
    bid,
    ask,
    sharesToBuy,
    sharesToSell,
  };

  console.log("🚀 place order data ", placeOrderData);

  const belowBidLimit = bid <= bidLimit;

  if (!belowBidLimit) {
    console.log("💳 ⛔️ Bid Limit Reached. No Bets being placed!");
    logToFile(
      "/Users/tudor/Documents/codebase-apple/polymarket/poly-1/logs/traderLogs.txt",
      "💳 ⛔️ Bid Limit Reached. No Bets being placed!"
    );
  }

  // * Cannot place an order size smaller than 5!
  const isBuying = sharesToBuy > 5 && isAboveWalletLimit && belowBidLimit;
  const isSelling = availableToClose > 5;

  try {
    const clobClient = await getClobClient();
    if (isBuying) {
      const buyLog = `💸 Buying ${sharesToBuy} at $${bid}`;
      console.log(buyLog);

      logToFile(
        "/Users/tudor/Documents/codebase-apple/polymarket/poly-1/logs/traderLogs.txt",
        buyLog
      );
      const buyOrder = await clobClient.createOrder({
        tokenID: assetId,
        price: bid,
        side: Side.BUY,
        size: sharesToBuy,
        feeRateBps: 0,
        nonce: 0,
        expiration: Math.ceil(Date.now() / 1000) + 600,
      });

      const responseBuyOrder = await clobClient.postOrder(
        buyOrder,
        OrderType.GTD
      );

      console.log(responseBuyOrder);
    }
    if (isSelling) {
      const sellLog = `💰 Selling ${sharesToSell} at $${ask}`;
      console.log(sellLog);

      logToFile(
        "/Users/tudor/Documents/codebase-apple/polymarket/poly-1/logs/traderLogs.txt",
        sellLog
      );

      const sellOrder = await clobClient.createOrder({
        tokenID: assetId,
        price: Math.max(ask, input.askLimit),
        side: Side.SELL,
        size: availableToClose,
        feeRateBps: 0,
        nonce: 0,
      });

      const responseSellOrder = await clobClient.postOrder(
        sellOrder,
        OrderType.GTC
      );

      console.log(responseSellOrder);
    }
  } catch (error) {
    console.error("❌ An error occurred while placingOrders");
    console.error(error);
    throw error; // Re-throw the error for higher-level handling if needed.
  }

  logToFile(
    "/Users/tudor/Documents/codebase-apple/polymarket/poly-1/logs/traderLogs.txt",
    JSON.stringify(marketData.openOrders)
  );

  logToFile(
    "/Users/tudor/Documents/codebase-apple/polymarket/poly-1/logs/traderLogs.txt",
    JSON.stringify(placeOrderData)
  );
};

export default placeOrders;
