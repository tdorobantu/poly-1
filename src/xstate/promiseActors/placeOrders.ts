import { OrderType, Side } from "@polymarket/clob-client";
import { getClobClient } from "../../services/clobClientSingleton.ts";
import MarketData from "../../types/MarketData";

const placeOrders = async ({
  input,
}: {
  input: {
    tradeLimit: number;
    walletLimit: number;
    marketData: MarketData;
    assetId: string;
  };
}) => {
  const { tradeLimit, walletLimit, marketData, assetId } = input;

  const { availableToClose, walletBalance, exposure, orderBook, totalShares } =
    marketData;

  if (walletLimit >= walletBalance) {
    console.log("💳 ⛔️ Wallet Limit Reached. No Bets being placed!");
    return;
  }

  const availableToBid = tradeLimit - exposure;

  // GET BID and ASK Prices
  const bid = Math.max(...orderBook.bids.map((bid) => Number(bid.price)));
  const ask = Math.min(...orderBook.asks.map((ask) => Number(ask.price)));

  // GET Shares
  console.log("availableToClose / bid: ", Math.floor(availableToClose / bid));
  console.log("totalShares: ", totalShares);
  const sharesToBuy = Math.floor(availableToBid / bid);
  const sharesToSell = totalShares;

  console.log("your data thus far ", {
    availableToBid,
    availableToClose,
    bid,
    ask,
    sharesToBuy,
    sharesToSell,
  });

  // * Cannot place an order size smaller than 6!
  const isBuying = sharesToBuy > 5;
  const isSelling = sharesToSell > 5;

  const buyOrder = {
    tokenID: assetId,
    price: bid,
    side: Side.BUY,
    size: 7,
    feeRateBps: 0,
    nonce: 0,
  };

  try {
    const clobClient = await getClobClient();
    if (isBuying) {
      const buyOrder = await clobClient.createOrder({
        tokenID: assetId,
        price: bid,
        side: Side.BUY,
        size: sharesToBuy,
        feeRateBps: 0,
        nonce: 0,
      });

      const responseBuyOrder = await clobClient.postOrder(
        buyOrder,
        OrderType.GTC
      );

      console.log(responseBuyOrder);
    }
    if (isSelling) {
      const sellOrder = await clobClient.createOrder({
        tokenID: assetId,
        price: ask,
        side: Side.SELL,
        size: sharesToSell,
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
};

export default placeOrders;
