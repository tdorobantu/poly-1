import { Side } from "@polymarket/clob-client";
import { getClobClient } from "../../services/clobClientSingleton.ts";

const cancelOrdersByAssetId = async (assetId: string, side: Side) => {
  console.log("🔍 Fetching open orders...");
  try {
    console.log("📔 Initializing clobClient!");
    const clobClient = await getClobClient();
    console.log("✅ ClobClient initialized successfully!");

    console.log(`📊 Fetching open orders for asset_id: ${assetId}...`);
    const openOrders = await clobClient.getOpenOrders({ asset_id: assetId });
    console.log("📜 Open orders retrieved");

    console.log("📋 Filtering orders based on asset_id and side...");
    const filteredOrders = openOrders.filter(
      (order) => order.asset_id === assetId && order.side === side
    );

    if (filteredOrders.length === 0) {
      console.log("🚫 No matching orders found to cancel.");
      return;
    }

    const orderIds = filteredOrders.map((order) => order.id);
    console.log("🗑️ Preparing to cancel the following orders:", orderIds);

    const resp = await clobClient.cancelOrders(orderIds);
    console.log("✅ Successfully cancelled orders:", resp);
  } catch (error) {
    console.error("❌ Error while cancelling orders:", error);
  }
};

export default cancelOrdersByAssetId;
