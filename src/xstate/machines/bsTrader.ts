import { createMachine, fromPromise, setup, assign, raise } from "xstate";
import { getClobClient } from "../../services/clobClientSingleton.ts";
import fetchMarkeData from "../promiseActors/fetchMarketData.ts";
import MarketData from "../../types/MarketData";
import { json } from "stream/consumers";
import placeOrders from "../promiseActors/placeOrders.ts";

// Define a simple XState machine
const bsTrader = setup({
  types: {
    context: {} as {
      marketData: null | MarketData;
      assetId: string;
      market: string;
      walletLimit: number;
      tradeLimit: number;
      timeLimit: number;
    },
    input: {} as {
      assetId: string;
      market: string;
      walletLimit: number;
      tradeLimit: number;
      timeLimit: number;
    },
    events: {} as
      | { type: "GO_CLOB_ERROR"; value: string }
      | { type: "EVENT_OVER" }
      | { type: "FUNDS_AVAILABLE"; value: string }
      | { type: "GO_POSITIONS" }
      | { type: "CYCLE_DONE" }
      | { type: "ORDER_PLACEMENT_FAILED" }
      | { type: "NO_FUNDS" }
      | { type: "NO_OPPORTUNITIES" }
      | { type: "EVALUATE" }
      | { type: "END_MARKET" }
      | { type: "xstate.done.actor.fetchMarket"; output: null | MarketData }
      | { type: "GO_PLACE_ORDERS" },
  },

  actions: {
    assignMarketData: assign({
      marketData: ({ context, event }) =>
        // @ts-ignore
        event.type === "xstate.done.actor.fetchMarket"
          ? event.output
          : context.marketData,
    }),
  },
  actors: {
    getClobClient: fromPromise(getClobClient),
    fetchMarkeData: fromPromise(fetchMarkeData),
    placeOrders: fromPromise(placeOrders),
  },
  guards: {},
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCNYBUBOBDCYMDoBLAO0IBdCsAbQgLzAGIIB7YsI4gN2YGt2YyAYSrNkwwmGJkA2gAYAuolAAHZrHKFWSkAA9EAZgCsAFnwAOAExmAjIesA2AOz79F2cfsAaEAE9EFgPxHYwBOELN9UP0zWUdrMwBfBO9UTBw8Dg1qOkY8DGYCZSosMgAzAoBbfAFhUXFJGQVtVXUKLSRdAxNzK1sHZ1d3L19EYzd8WQiLEKs4uwsklPRsXAJSsDIAYwALAFksDD4yJlZ2Em4+fHWtvYOjuUUOlo120D0EMziJjwj7Mz+QsYPN4-Ag3BZ8IYLJFrCFZIYTI5ZCFFiBUisMtcdvtDhsGHkCvgiiVyhgqljbrjGo8VGoXsRtO9PtZvn99H8AUDhqD9LJZOYXPpYfZ4eFDPpUej0oVipswAB5DCrWAnNgcC7sYlyxXKh7NOltBkdd7WIwsvl8xxmT6OJGybn+CyGfAWULhSIhaKxawLZJo5bS-CwMhYYgQABCPgYOmDJXYWFKZDwAApeRaAJQMKWrIMhsORvVPA2aI1vRDWYyyfRBeyGewhayOAKAkIgxA2fBusKmuym6ISv3ZjKbETIACiGHyGAYhdprRLjPL+i+y7+cWiJiFhjbCGijnwDYbNkccKr4qSfuIzFw8A6Q4w+vnr06CAAtA63-YJhbrPbwvWAibSUAxzEgshoehH3pRcEDGHcLB9TswhCesG2MBwzEMYC0hzEdRAnKcoMNGDTyCQxbTMMYfQiVsRlg6FzEcexjCMa17DXCJsIxNYNmxO4NiIhdjUQEwzEhK1bCBWJIm3OjYTE10wmY+wHHY+FEkHECMi1BUlTwW852g4SEF-Ot8CMT0mziEVDE+eC+SCN1rXZWtrFMrjA1jfNQUM4jjNsIxxOPFjjBiWTQWtSEIlcCJGxiZiUQvIA */
  context: ({ input }) => ({
    walletLimit: input.walletLimit,
    marketData: null,
    assetId: input.assetId,
    market: input.market,
    tradeLimit: input.tradeLimit,
    timeLimit: input.timeLimit,
  }),
  id: "bsTrader",
  initial: "initialize",
  states: {
    initialize: {
      invoke: {
        id: "getClobClient",
        systemId: "getClobClient",
        src: "getClobClient",

        onDone: {
          target: "fetchMarket",
          reenter: true,
        },

        onError: {
          target: "clobError",
          reenter: true,
        },
      },
    },

    clobError: {
      always: {
        target: "standBy",
        reenter: true,
      },
    },

    fetchMarket: {
      invoke: {
        id: "fetchMarket",
        systemId: "fetchMarket",
        src: "fetchMarkeData",
        input: ({ context: { market, assetId } }) => ({ market, assetId }),
        onDone: {
          target: "placeOrders",
          reenter: true,
          actions: [{ type: "assignMarketData" }],
        },

        onError: {
          target: "clobError",
          reenter: true,
        },
      },
    },

    placeOrders: {
      invoke: {
        src: "placeOrders",
        id: "placeOrders",

        input: ({
          context: { tradeLimit, walletLimit, marketData, assetId },
        }) => ({ tradeLimit, walletLimit, marketData, assetId }),

        onDone: {
          target: "standBy",
          reenter: true,
        },
      },
    },

    standBy: {
      after: {
        "120000": "fetchMarket",
      },
    },
  },
});

export default bsTrader;
