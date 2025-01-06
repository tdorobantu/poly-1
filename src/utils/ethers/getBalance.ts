import { ethers } from "ethers";

const getBalance = async (walletAddress: string, rpcUrl: string) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const balance = await provider.getBalance(walletAddress);
  console.log(ethers.utils.formatEther(balance)); // Balance in MATIC
};

export default getBalance;
