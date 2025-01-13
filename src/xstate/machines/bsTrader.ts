import { createMachine, fromPromise, setup, assign, raise } from "xstate";
import { getClobClient } from "../../services/clobClientSingleton.ts";
import fetchMarkeData from "../../fetchMarketData.ts";
import MarketData from "../../types/MarketData";
import { json } from "stream/consumers";

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
    sayMarketData: ({ context }) =>
      console.log("the context is now ", JSON.stringify(context)),
    evaluateFundsAndEvent: ({ context }) => {
      if (!context.marketData) {
        raise({ type: "NO_FUNDS" });
      }
      const { exposure, walletBalance } = context.marketData;

      if (walletBalance <= context.walletLimit) {
        raise({ type: "NO_FUNDS" });
      }

      if (exposure >= context.tradeLimit) {
        raise({ type: "NO_FUNDS" });
      }
      if (context.timeLimit > Date.now()) {
        raise({ type: "EVENT_OVER" });
      }

      raise({ type: "FUNDS_AVAILABLE" });
    },

    //   sayEvent: ({event}) => console.log("the event is now ", JSON.stringify(event))
  },
  actors: {
    getClobClient: fromPromise(getClobClient),
    fetchMarkeData: fromPromise(fetchMarkeData),
  },
  guards: {},
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCNYBUBOBDCYMDoBLAO0IBdCsAbQgLzAGIIB7YsI4gN2YGt2YyAYSrNkwwmGJkA2gAYAuolAAHZrHKFWSkAA9EAZgCsAFnwAOAExmAjCaP6L1gJzGANCACeiaxYBs5w1sAdgtjJ19jQ1kLIIBfWPdUTBw8Dg1qOkY8DGYCZSosMgAzXIBbfAFhUXFJGQVtVXUKLSRdAxNzK1tje0cXdy8EIMN9fAiHILN9a2MLB194xPRsXAIisDIAYwALAFksDD4yJlZ2Em4+fHWtvYOjuUVWxo0W0D0EMxt8WWNfJzNZNZ9IDrFMBogvlFZNDfEEnIYnEEjBZFiAkitUtcdvtDhsGNlcvh8oUShhyljbri6o8VGoXsRtO9PtZvr9-oDgdZQfpwQhfPpTPonPMgqDZL5DKFUeiUgQwJxqABXQpgABiiuIEFgAEFNQBRTi1Bh6gBqeoAcmgAPoAeTNACUHg06c0Ga13tZhv5ZNNjLJPr5fNZZIZecGWWZhaETDFJZGzNLlrL8PKlSr1ZqdfrDVIGKqAKrmgAiAGUrdqTdqAJIAGW1ACEa3qnU8XZo3W9vDEzPhpn5ooFQiEwyN8BY-IYgkF-aDwoZE8lVimFVRlWQ1RqtbqIAajeabVaC8WSy3aU124zvF7vr7-WZA8HQ55vJLe1GekFjGZDPzQQuMXKK5rmANoYKs9bMLwDAAOIHgACnWgh6ra9pFnq9onvUrbnq8bQID4069gikQ+LYwrwryQqmJGDg9GE3TGHECRokmS6pquKqgeBkE8Aw+62nBcE2vaaCFlWaBVnqmE0iAzyupe+ExLIREuIOZFCk+gwxKYMy0T00zREECzMTKS7EpsYD1oqHhcXgsAMMJaH2laCHakhuwWtaqrVk2RanrJba4R614+jMd4PiGlHCuY74WOK8KIvoxlLIuqSbCIsBgHBgXEPZFpFlauzavaADSepoP5ckXu6iB9P4lhTACnqGDYYaAjFtExsMFhOP+yawGQWCavWHgMDoA0qvgWBFOuGAABRQgAlAwpmpBNw0eJVOUKbOLKyJMfgCqEFiTjyz4IIEhj4LpJ2+D804hCiJmsak5lgCWYBUFQtkYHllY1vm2poM2WFnvSO1KSpJGOAiGltRY+AhBKkxGf6vhzE9zHEMwuDwK0q0YM6OEdnhAC0vi8qTV1ODTNMhMC04+vowx9UuJDpDQ9BE+DNUILMYbWP4d22ACIQ-E4Pys2lIjIHqGA5IT2E852+Hiv4RguD1YRWJOvL8k45iyDTxg9IYZv-POz2pWsGzYncGzc-JvMmD2k42JYorTujFPncGCNGME44EVY0xS4BabrhmW7ZrUjvVSrMxfCdgJ+sYQLhLy0U3WnsLfiGNNh8uEcgWBeAQbwcdBd44oshrswuE4OtBGG6PXYCLWAgGgT7YXb1WTZpe-ZXJMeiMymip8NP7eK4pmFFgpRtOXQ-mbhfpWoWU5XjYNOyrcXM234RzH8oqRM3vvRG+nWzN1vVWwBVzs7A2yQMPCnH+PAq-oifi-G1LI3SSgiUU0QzBMRSg-daEARpv15vvIIh90ZJURDMXW51Yz4Bpg4X0P4hQRF7gUCyH0vo-W3gFYmO19remmDQ+8d0QxzwvqMccyMwF3XvBjeI8QgA */
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
      type: "final",
    },

    fetchMarket: {
      invoke: {
        id: "fetchMarket",
        systemId: "fetchMarket",
        src: "fetchMarkeData",
        onDone: {
          target: "placeSellOrders",
          reenter: true,
          actions: [{ type: "assignMarketData" }],
        },

        onError: {
          target: "clobError",
          reenter: true,
        },
      },
    },

    evaluateFundsAndEvent: {
      entry: [{ type: "evaluateFundsAndEvent" }],
      on: {
        EVENT_OVER: {
          target: "closePositions",
          reenter: true,
        },

        FUNDS_AVAILABLE: "evaluateOrderBook",

        NO_FUNDS: {
          target: "standBy",
          reenter: true,
        },
      },
    },

    evaluateOrderBook: {
      on: {
        GO_PLACE_ORDERS: "placeBuyOrders",
        NO_OPPORTUNITIES: {
          target: "standBy",
          reenter: true,
        },
      },
    },

    placeBuyOrders: {
      on: {
        ORDER_PLACEMENT_FAILED: {
          target: "standBy",
          reenter: true,
        },
      },
    },

    closePositions: {
      on: {
        END_MARKET: "finished",
      },
    },

    finished: {
      type: "final",
    },

    standBy: {
      after: {
        "500": {
          target: "fetchMarket",
          reenter: true,
        },
      },
    },

    placeSellOrders: {
      on: {
        EVALUATE: {
          target: "evaluateFundsAndEvent",
          reenter: true,
        },
      },
    },
  },
});

export default bsTrader;
