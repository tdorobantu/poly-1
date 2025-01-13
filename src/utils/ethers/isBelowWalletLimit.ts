import getUSDCBalance from "./getBalance.ts";

const isBelowWalletLimit = async (walletLimit: number) => {
  try {
    console.log("⚖️ Fetching Fetching current wallet balance.");
    const balance = await getUSDCBalance(process.env.WALLET_POLY_MARKET);
    console.log(
      `The USDC balance for wallet ${process.env.WALLET_POLY_MARKET} is ${balance}`
    );
    const isBelowWalletLimit = Number(balance) <= walletLimit;

    if (isBelowWalletLimit) {
      console.log(
        `Current wallet value of ${balance} is BELOW the wallet limit of ${walletLimit} ❌ 💳`
      );
      return true;
    }

    console.log(
      `Current wallet value of ${balance} is ABOVE the wallet limit of ${walletLimit} ✅ 💳`
    );
  } catch (error) {
    console.error("❌ An error occurred while fetching market data:");
    console.error(error);
    throw error; // Re-throw the error for higher-level handling if needed.
  }

  //   console.log(JSON.stringify(marketData));
  return false;
};

export default isBelowWalletLimit;
