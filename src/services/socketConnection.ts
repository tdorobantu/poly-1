import WebSocket from "ws";
import { ApiKeyCreds } from "@polymarket/clob-client";
import getCredentials from "../utils/poly/getCredentials.ts";
import PRESIDENTIAL_ROMANIA from "../constants/PRESIDENTIAL_ROMANIA.ts";
import logToFile from "../utils/logToFile.ts";

interface subscriptionMessage {
  // only necessary for 'user' subscriptions
  auth?: { apiKey: string; secret: string; passphrase: string };
  type: string;
  markets: string[];
  assets_ids: string[];
}

/**
 *
 * @param type user | market
 */
const socketConnection = async (
  type: "user" | "market" | "live-activity",
  onMessage?: (msg: string) => void,
  onClose?: (msg: string) => void,
  onError?: (msg: string) => void,
  onOpen?: (msg: string) => void
) => {
  const host = process.env.WS_URL || "ws://localhost:8081";
  console.log(`${host}${type}`);
  const ws = new WebSocket(`${host}${type}`); // change to market for market, user for user

  let subscriptionMessage: subscriptionMessage = {} as subscriptionMessage;

  if (type !== "live-activity") {
    let creds: ApiKeyCreds | undefined;
    if (type == "user") {
      creds = getCredentials();
    }

    subscriptionMessage = {
      auth:
        type == "user" && creds
          ? {
              apiKey: creds.key,
              secret: creds.secret,
              passphrase: creds.passphrase,
            }
          : undefined,
      type, // change to market for market, user for user
      markets: [] as string[],
      assets_ids: [] as string[],
    };

    if (type == "user") {
      subscriptionMessage["markets"] = [
        PRESIDENTIAL_ROMANIA.MARKET_IDS.NICUSOR_DAN,
      ];
    } else {
      subscriptionMessage["assets_ids"] = [
        PRESIDENTIAL_ROMANIA.ASSET_IDS.NICUSOR_DAN_YES,
      ];
    }
  }

  ws.on("error", function (err: Error) {
    console.log("error SOCKET", "error", err);
    onError && onError(`🪦 Socket error: ${err.toString()}!`);
    process.exit(1);
  });
  ws.on("close", function (code: number, reason: Buffer) {
    console.log(
      "disconnected SOCKET",
      "code",
      code,
      "reason",
      reason.toString()
    );
    onClose &&
      onClose(`❌ Socket disconnected! Code ${code}: ${reason.toString()}!`);
    process.exit(1);
  });

  ws.on("open", function (ev: any) {
    if (type !== "live-activity") {
      ws.send(JSON.stringify(subscriptionMessage), (err?: Error) => {
        if (err) {
          console.log("send error", err);
          process.exit(1);
        }
        onOpen && onOpen(`🔌 Socket donnected! Reporting ${type}!`);
      }); // send sub message
    }

    setInterval(() => {
      console.log("PINGING");
      ws.send("PING");
    }, 50000);

    if (ev) {
      console.log("open", ev);
    }
  });

  ws.onmessage = function (msg: any) {
    console.log(msg.data);
    if (msg.data !== "PONG") {
      onMessage && onMessage(msg.data);
      logToFile(
        "/Users/tudor/Documents/codebase-apple/polymarket/poly-1/logs/traderLogs.txt",
        `🔌 socket message: ${msg.data}`
      );
    }
  };
};

export default socketConnection;
