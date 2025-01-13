import fetch from "node-fetch";
import PolymarketPosition from "../../types/PolyMarketPositions";

const getPolymarketPositions = async (
  user: string,
  market: string
): Promise<PolymarketPosition[]> => {
  const baseUrl = "https://data-api.polymarket.com/positions";
  const limit = 50; // Maximum number of results per request
  let offset = 0;
  let allPositions: any[] = [];
  let hasMore = true;

  console.log(`🌍 Fetching all positions for user: ${user}, market: ${market}`);

  try {
    while (hasMore) {
      const url = `${baseUrl}?user=${user}&market=${market}&sortBy=CURRENT&sortDirection=DESC&sizeThreshold=.1&limit=${limit}&offset=${offset}`;
      console.log(`🔗 Fetching data from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `❌ Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as unknown as PolymarketPosition[];
      console.log(`✅ Fetched ${data.length} positions.`);

      // Append the fetched positions to the array
      allPositions = allPositions.concat(data);

      // Check if there are more results to fetch
      if (data.length < limit) {
        hasMore = false;
      } else {
        offset += limit; // Increment offset for the next page
      }
    }

    console.log("🎉 All positions fetched successfully.");
    return allPositions;
  } catch (error) {
    console.error(`⚠️ Error fetching positions: ${error.message}`);
    throw error;
  }
};

export default getPolymarketPositions;
