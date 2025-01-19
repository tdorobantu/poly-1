import {
  OrderBookSummary,
  OpenOrdersResponse,
  Trade,
} from "@polymarket/clob-client";

type MarketData = null | {
  orderBook: OrderBookSummary;
  openOrders: OpenOrdersResponse;
  exposure: number;
  walletBalance: number;
  availableToClose: number;
  totalShares: number;
};

export default MarketData;
