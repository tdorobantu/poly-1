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
};

export default MarketData;
