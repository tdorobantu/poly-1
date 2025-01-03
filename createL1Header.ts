import { ethers } from "ethers";

const createL1Header = async (nonce: string, wallet: ethers.Wallet) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signingAddress = await wallet.getAddress();

  // Deduce the chainId from the wallet's provider
  const chainId = (await wallet.provider.getNetwork()).chainId;

  console.log("The chain Id for the provided wallet is ", chainId)

  const domain = {
    name: "ClobAuthDomain",
    version: "1",
    chainId: chainId,
  };

  const types = {
    ClobAuth: [
      { name: "address", type: "address" },
      { name: "timestamp", type: "string" },
      { name: "nonce", type: "uint256" },
      { name: "message", type: "string" },
    ],
  };

  const value = {
    address: signingAddress,
    timestamp: timestamp,
    nonce: nonce,
    message: "This message attests that I control the given wallet",
  };

  const signature = await wallet._signTypedData(domain, types, value);

  const isValidSignature =
    ethers.utils.verifyTypedData(domain, types, value, signature) === signingAddress;

  console.log("Is the signature valid?", isValidSignature);


  // ? Maybe should return the wallet?
  return {
    POLY_ADDRESS: signingAddress,
    POLY_SIGNATURE: signature,
    POLY_TIMESTAMP: timestamp,
    POLY_NONCE: nonce,
  };
};

export default createL1Header;