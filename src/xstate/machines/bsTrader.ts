import { createMachine, fromPromise, setup, assign } from "xstate";
import { getClobClient } from "../../services/clobClientSingleton.ts";
import fetchMarket from "../../fetchMarket.ts";
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
    },
    input: {} as {
      assetId: string;
      market: string;
      walletLimit: number;
      tradeLimit: number;
    },
    events: {} as
      | { type: "GO_CLOB_ERROR"; value: string }
      | { type: "EVENT_OVER" }
      | { type: "GO_ORDER_BOOK"; value: string }
      | { type: "GO_POSITIONS" }
      | { type: "CYCLE_DONE" }
      | { type: "ORDER_PLACEMENT_FAILED" }
      | { type: "NO_POSITIONS" }
      | { type: "NO_OPPORTUNITIES" }
      | { type: "SEND_TELEGRAM" }
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
    evaluatePosition: ({ context }) => {
      if (context.marketData) {
        const { positions, openOrders } = context.marketData;
        const totalExposurPositions = positions;
        // .filter(
        //   (trade) =>
        //     trade.asset_id === context.assetId &&
        //     trade.market === context.market
        // );

        //   .reduce(
        //     (total, trade) =>
        //       total + parseFloat(trade.size) * parseFloat(trade.price),
        //     0
        //   );
        const totalExposureOpenBuyOrders = openOrders;
        // .filter(
        //   (openOrder) =>
        //     openOrder.asset_id === context.assetId &&
        //     openOrder.market === context.market &&
        //     openOrder.side === "BUY"
        // );
        //   .reduce(
        //     (total, openOrders) =>
        //       total +
        //       (parseFloat(openOrders.original_size) -
        //         parseFloat(openOrders.size_matched)) *
        //         parseFloat(openOrders.price),
        //     0
        //   );
        console.log({
          totalExposurPositions: JSON.stringify(totalExposurPositions),
          //   totalExposureOpenBuyOrders,
        });
      }
    },
    //   sayEvent: ({event}) => console.log("the event is now ", JSON.stringify(event))
  },
  actors: {
    getClobClient: fromPromise(getClobClient),
    fetchMarket: fromPromise(fetchMarket),
  },
  guards: {},
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCNYBUBOBDCYMDoBLAO0IBdCsAbQgLzAGIIB7YsI4gN2YGt2YyAYSrNkwwmGJkA2gAYAuolAAHZrHKFWSkAA9EARgAcANln5ZAVgAsFi8YDs9q1cP6ANCACeiC0fMBOQKsAZnt9Yyt-ewBfaI9UTBw8Dg1qOkY8DGYCZSosMgAzbIBbfAFhUXFJGQVtVXUKLSRdAxMzSxs7R2dXD28EC38LfFNZWX19eyirY1DY+PRsXAICsDIAYwALAFksDD4yJlZ2Em4+fFWNnb2DuUVm+o0m0D0EI2N-fENZTuN9YMmVgATMY+oggT98BYxuN9LIhpMHPMQAklslLltdvs1gxMtl8Ll8kUMKUMddsTV7io1E9iNpXkDglZ7PggcCfv5ZCYQaEwQgbECvpFAl1DJzDIYrMjUUkCGBONQAK75MAABRpjWIDAAogA1bUAOTQAH0APL6gBKdzqGs0dOaDKs+nwwv8hiBbNkwUM0KsfPdrOFYvs3sC9kl0sWsvw8qVKvVDTtDAA4qazRaACLai3GgBCptNAGlrQ9bc8Wgg2c7Xe7Pd7fXybCzgi3QsF-A4foyLJHEssYwqqMqyGqy1qDWnVaaAMoASTQs9NBunJepifLjurgTdHqsXp9Pz5wUZ+Hs0PGTjDkSlcRRUf7saHKtNGGWueYvBTk4AMgBBQTaumWYWiutSluu9ovIgxhAoYIxDACLYfBYkoWI20L4P44TGB8kpBMyPa3jKD6DsOYAvm+H48AwE5mqqU4WmgACqBrzrO2qgVSICPJq9LQbB8EWIhwTIahfLGD6mHbv4TIyYMhgxER97JIS6zka+eCwAwpqZtmxqqn+AHbIaJoAGK-rO37ahmq7cWOfEIG6nxuiEbIKe63zuF4PjGMMbJBA4YooTeCx9ipeRqRRmkMNOhoZsaaDalZyYWr+2y2TxdoOU5mGSseLjhrB4yNs4UIwohnlAr4imhWiBDrCIsCjhBWlxca2y-hahbamgGX2Q6-FwchwmiTY-qClVYwenYPIOP4vZ1fgsBkFgxAQLmngMDoy0qvgWAFCOGAABTngAlAwxHJDta0bX1EEOe87TWLYDhOC4Xn9DYZiyR2sG2ECNV3mFBAjlQYBQNgxQMIIACaghWcaGZLtqd20g9oSfLMIJRIY7a45MJVWGVYwRBCoQRJMsS3sQzC4PAzSXRgNr3QNCAALQQlJoT6M49imMEKGWHybPGOYMJjN8YRAjzOHGAt0YkKkND0MzaOs-o1gsv5CnAuE3OGHy0IsnhQxeuEFhTIRtXRg1ojahgWRM+BatQZWFhAp8YqWLIZ5ROE-joXBIKyzBqFCSFQOLWSWIHKrvGsxCQmnhKMkOMye4A42AkCzCjJ804MFy0pwMDnGI4Ji7dks67ANi6H-3thTQx8oirKTB6Hw-DBZ5AvLJFl+plG8HHWWsyERPDflMu+8E6HG62To80yXoC334VYJFGkYPTa6V68eX4KEjIRP47IWx9iA2NW2G4cKvNW5HNuNc1tI71Xe+X5Eh8C3J-wKQL9hxqniDFEUMUR5rFyjorWAmxIAjw3IgSUzoUIoSiCCAGTl-Rbmkv4CEboeZrwINdda-Rd7x1dhrTk5hHCBDFDyF6JVPg50sPWfcIlgiEPwKDcGkN4GQQrPoEEzpZAwWBN6ewjJvh+m8vyUqOCfR2BcH8IusQgA */
  context: ({ input }) => ({
    walletLimit: input.walletLimit,
    marketData: null,
    assetId: input.assetId,
    market: input.market,
    tradeLimit: input.tradeLimit,
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
        src: "fetchMarket",
        onDone: {
          target: "evaluatePosition",
          reenter: true,
          actions: [{ type: "assignMarketData" }],
        },

        onError: {
          target: "clobError",
          reenter: true,
        },
      },
    },

    evaluatePosition: {
      entry: [{ type: "evaluatePosition" }],
      on: {
        EVENT_OVER: {
          target: "closePositions",
          reenter: true,
        },

        GO_ORDER_BOOK: "evaluateOrderBook",

        NO_POSITIONS: {
          target: "standBy",
          reenter: true,
        },
      },
    },

    evaluateOrderBook: {
      on: {
        GO_PLACE_ORDERS: "placeOrders",
        NO_OPPORTUNITIES: {
          target: "standBy",
          reenter: true,
        },
      },
    },

    placeOrders: {
      on: {
        ORDER_PLACEMENT_FAILED: "standBy",
        SEND_TELEGRAM: "telegram",
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

    telegram: {
      on: {
        CYCLE_DONE: {
          target: "standBy",
          reenter: true,
        },
      },
    },
  },
});

export default bsTrader;
