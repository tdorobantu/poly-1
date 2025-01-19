import { getClobClient } from "../../services/clobClientSingleton.ts";

const getMarketsBySlug = async (marketSlug: string) => {
  const clobClient = await getClobClient();
  let nextCursor = ""; // Start with an empty cursor to fetch the first page
  const matchingMarkets: any[] = []; // Store all matching markets

  do {
    const markets = await clobClient.getMarkets(nextCursor);
    console.log(`Fetched markets with cursor: ${nextCursor}`);

    // Collect all matching markets in the current page
    const matches = markets.data.filter((item) =>
      (item.market_slug as string)
        .toLowerCase()
        .includes(marketSlug.toLowerCase())
    );

    matchingMarkets.push(...matches); // Add matches to the result array

    // Update the nextCursor to paginate
    nextCursor = markets.next_cursor;

    // Log progress
    if (nextCursor === "LTE=") {
      console.log("📍 Reached the end of pagination.");
    }
  } while (nextCursor && nextCursor !== "LTE=");

  // Return all matching markets
  return matchingMarkets;
};

export default getMarketsBySlug;
