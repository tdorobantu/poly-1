import { getClobClient } from "../../services/clobClientSingleton.ts";

const getMarketFromSlug = async (marketSlug: string) => {
  const clobClient = await getClobClient();
  let nextCursor = ""; // Start with an empty cursor to fetch the first page
  let target = null;

  do {
    const markets = await clobClient.getMarkets(nextCursor);
    console.log(`Fetched markets with cursor: ${nextCursor}`);

    // Attempt to find the target market in the current page
    target = markets.data.find((item) =>
      (item.market_slug as string)
        .toLowerCase()
        .includes(marketSlug.toLowerCase())
    );

    // If target is found, exit the loop
    if (target) {
      console.log("🎯 Market found:", target);
      break;
    }

    // Update the nextCursor to paginate
    nextCursor = markets.next_cursor;

    // Log progress
    if (nextCursor === "LTE=") {
      console.log("📍 Reached the end of pagination.");
    }
  } while (nextCursor && nextCursor !== "LTE=");

  // Return the found target or null if not found
  return target;
};

export default getMarketFromSlug;
