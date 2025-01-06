import {
  OrderBookSummary,
  OpenOrdersResponse,
  Trade,
} from "@polymarket/clob-client";

type MarketData = null | {
  orderBook: OrderBookSummary;
  openOrders: OpenOrdersResponse;
  positions: Trade[];
};

export default MarketData;
