import { createMachine, fromPromise, setup } from 'xstate';
import { getClobClient } from '../../services/clobClientSingleton';
import fetchMarket from '../../fetchMarket';

// Define a simple XState machine
const marketMaker = setup({
    types: {
      context: {
      } as {},
      input: {} as {},
      events: {} as
        | { type: "GO_CLOB_ERROR"; value: string }
        | { type: "EVENT_OVER" }
        | { type: "GO_ORDER_BOOK"; value: string }
        | { type: "GO_POSITIONS" }
        | { type: "CYCLE_DONE" }
        | { type: "ORDER_PLACEMENT_FAILED" }
        | {type: "NO_POSITIONS"}
        | {type: "NO_OPPORTUNITIES"}
        | {type: "SEND_TELEGRAM"}
        | {type: "END_MARKET"}
        | { type: "GO_PLACE_ORDERS" },
    },
    actions: {},
    actors: {
        getClobClient: fromPromise(getClobClient),
        fetchMarket: fromPromise(fetchMarket)
    },
    guards: {
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCGAnA1mALgWVW3QDoBLAO1J1NQBtSAvMAYggHtywzyA3N7YjBwBhWmwBGo0mHI4A2gAYAuolAAHNrCqkOqkAA9EARgBsC4gE4AzEYVWFAJgDsVgCxWnAVgA0IAJ6IDlYAHMSeribBXgC+0b5oWLgERNzadIwsYOjobCRqtKg4AGa5yIK4ohJSMvLKehpa1LpIBogAtEaeTsRODg4mVp4WCq4Wrk7Bwb4BCDYOPQ4WpiYrqytWsfEY2PiEWcRFuADGABYEiTisHFwUfAKHOKfnO4oqLQ3azaCGCArTiApNiAEjtkvsHk9trhmFkcnkCsVSgdjmcobU3upNJ9yHofn9-ACgSCknsSGAeHQAK6FMAABSxTXIzAAogA1ZkAOQAKgB9ADy7IASq96gydDiWj8nK4jMQBg5gkYHD4CQgjDLiBEop4iWiwWSKbRqTg6WKOMwAOJ8-mCgAizMFPIAQny+QBpEXvM0S76IYIWUKdEzK-4IBwKUJzHVxYF60nEclUmn0xri5gc620vkAZQAklzc3yOdnPZjU19WgheqEFZ4gyHVYMLHKFI4zDK1gNdRd9QnDcawHz0BAsk62PxLZmADIAQWEzJt9sFJbqXvLPsrRjc808g3rKpm4cjSujWx78cTRppQ5H6DHE4z-NpWcFXIAqhz87nmSuMSAPoyuLGAoYzEP6wTuF4oZWGYPRGNK4xLJ2GwxsSuwpPkqBHIOw5ZLAzB8naDo8rSs7zngnK8gAYjOuZTsytqlv+3pAWqXTmFYTYeAeiCcZ4YEOK4DhGNq3agvGmHYTeeHMNmnK2jyXLMvRFqCjOeBMQB4qsfBu5yk4FiRFBqrhs2njBqesbnikRxiLAprrvh8k8ngM6Cm6zJcppLGSognhdMQ6oKBZobmZY8GGaJqFxiksA4Kg5AQE6fjMPocU0sQqBFCa6AABSeK2ACUzBob26WJcl3nrjpQVgZBPEILuspRmJJIpCatBgFA6CoMgzDCAAmsI9E8raRbMlV2I6YZ3QWOxUahs45iKsqsQxuQbAjvALSlaSorVb5CBtH0VjEDBEH+p4wScTdRihm0URhK16H7BQaT0Ew+1TYdHReGdkSuJd103TYoYRcQgmIcsyHPb2tkSMy2S5F9gE-cEJiWJdwYBsECpKg4oauAo3TmUYRgWAZ0MmE4sPxhCqIXCj2mHR4oQmOZDYzOT3SA3NwMg5xRi0ykl4Dim31lhLla9Pxwb+sFnOBBGZ0nsL+yi9euF3uOmBMxWPxkwosoQdxi3Ky10XWfskk4be22S6jvpqmYGMRCBpsmebquW+JNl2Q52L28xB1Oy4p1G3NC2qmFSwGUZlm7SkRRvbAJyQHrG4-FYc1gSerZXYJMEmKGKyY3ziyGSBiwoWevv7OVSUzA7zNO2TQnEEb8EicZMxarnq0+21+wdV1PXIBn02l9T3cNUeKsD7EQA */
    id: 'marketMaker',
    initial: "initialize",
    states: {
        initialize: {
            invoke: {
                id: "getClobClient",
                systemId: "getClobClient",
                src: "getClobClient",

                onDone: {
                    target: "fetchMarket",
                    reenter: true
                },

                onError: {
                    target: "clobError",
                    reenter: true
                }
            }
        },

        clobError: {
            type: "final"
        },

        fetchMarket: {
            invoke: {
                id: "fetchMarket",
                systemId: "fetchMarket",
                src: "fetchMarket",

                onDone: {
                    target: "evaluatePosition",
                    reenter: true
                },

                onError: {
                    target: "clobError",
                    reenter: true
                }
            }
        },

        evaluatePosition: {
            on: {
                EVENT_OVER: {
                    target: "closePositions",
                    reenter: true
                },

                GO_ORDER_BOOK: "evaluateOrderBook",

                NO_POSITIONS: {
                    target: "standBy",
                    reenter: true
                }
            }
        },

        evaluateOrderBook: {
            on: {
                GO_PLACE_ORDERS: "placeOrders",
                NO_OPPORTUNITIES: {
                    target: "standBy",
                    reenter: true
                }
            }
        },

        placeOrders: {
            on: {
                ORDER_PLACEMENT_FAILED: "standBy",
                SEND_TELEGRAM: "telegram"
            }
        },

        closePositions: {
            on: {
                END_MARKET: "finished"
            }
        },

        finished: {
            type: "final"
        },

        standBy: {
            after: {
                "500": {
                    target: "fetchMarket",
                    reenter: true
                }
            }
        },

        telegram: {
            on: {
                CYCLE_DONE: {
                    target: "standBy",
                    reenter: true
                }
            }
        }
    }
});

export default marketMaker;