import { io, Socket } from "socket.io-client";

type Auth = {
    apiKey: string;
    secret: string;
    passphrase: string;
};

interface SubscriptionMessage {
    auth?: Auth;
    type: "user" | "market";
    markets?: string[];
    assets_ids?: string[];
}

const polyMarketSocket = (
    type: "user" | "market",
    assets_ids?: string[],
    markets?: string[],
    auth?: Auth
): Socket => {
    const host = process.env.WS_URL || "wss://ws-subscriptions-clob.polymarket.com";
    const socket = io(`${host}${type}`, {
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log(`✅ Connected to Polymarket WebSocket: ${type} channel`);

        const subscriptionMessage: SubscriptionMessage = {
            auth: type === "user" && auth ? auth : undefined,
            type,
            markets: type === "user" ? markets : undefined,
            assets_ids: type === "market" ? assets_ids : undefined,
        };

        console.log("📤 Sending subscription message:", subscriptionMessage);

        socket.emit("subscribe", subscriptionMessage);
    });

    socket.on("message", (message: any) => {
        console.log("📩 Message received:", message);
    });

    socket.on("error", (error: any) => {
        console.error("❌ WebSocket error:", error);
    });

    socket.on("disconnect", (reason: string) => {
        console.warn("❌ Disconnected from WebSocket:", reason);
    });

    return socket;
};

export default polyMarketSocket