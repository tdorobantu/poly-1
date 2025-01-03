import { BigNumber, constants, ethers } from "ethers";
import getWallet from "./getWallet.ts";
import getUsdcContract from "./getUsdcContract.ts";
import getCtfContract from "./getCtfContract.ts";
import { getContractConfig } from "./config.ts";

const approveAllowances = async (
    rpcUrl: string,
    walletPrivateKey: string,
    isMainnet: boolean
): Promise<void> => {
    console.log("🚀 Starting the approval process...");

    // Initialize wallet
    console.log("🔑 Initializing wallet...");
    const wallet = getWallet(rpcUrl, walletPrivateKey);

    const chainId = await wallet.getChainId();
    console.log(`🔗 Connected to chainId: ${chainId}`);

    // Get contract configuration
    const contractConfig = getContractConfig(chainId);

    // Initialize USDC and CTF contracts
    const usdcContract = await getUsdcContract(wallet);
    const ctfContract = await getCtfContract(wallet);

    console.log(`🏦 USDC Contract Address: ${usdcContract.address}`);
    console.log(`🎲 CTF Contract Address: ${ctfContract.address}`);

    // Check allowances
    console.log("🔍 Checking allowances...");
    const usdcAllowanceCtf = await usdcContract.allowance(
        wallet.address,
        contractConfig.conditionalTokens
    ) as BigNumber;
    const usdcAllowanceExchange = await usdcContract.allowance(
        wallet.address,
        contractConfig.exchange
    ) as BigNumber;
    const conditionalTokensAllowanceExchange = await ctfContract.isApprovedForAll(
        wallet.address,
        contractConfig.exchange
    );

    console.log(`💵 USDC Allowance for CTF: ${ethers.utils.formatUnits(usdcAllowanceCtf, 6)}`);
    console.log(`💵 USDC Allowance for Exchange: ${ethers.utils.formatUnits(usdcAllowanceExchange, 6)}`);
    console.log(`🎲 Conditional Tokens Approval for Exchange: ${conditionalTokensAllowanceExchange}`);

    // Update allowances if necessary
    let txn;
    if (usdcAllowanceCtf.lte(constants.Zero)) {
        console.log("🛠️ Updating USDC allowance for CTF...");
        txn = await usdcContract.approve(contractConfig.conditionalTokens, constants.MaxUint256, {
            gasPrice: ethers.utils.parseUnits("100", "gwei"),
            gasLimit: 200_000,
        });
        console.log(`✅ USDC allowance for CTF set. Transaction Hash: ${txn.hash}`);
    }

    if (usdcAllowanceExchange.lte(constants.Zero)) {
        console.log("🛠️ Updating USDC allowance for Exchange...");
        txn = await usdcContract.approve(contractConfig.exchange, constants.MaxUint256, {
            gasPrice: ethers.utils.parseUnits("100", "gwei"),
            gasLimit: 200_000,
        });
        console.log(`✅ USDC allowance for Exchange set. Transaction Hash: ${txn.hash}`);
    }

    if (!conditionalTokensAllowanceExchange) {
        console.log("🛠️ Setting approval for Conditional Tokens...");
        txn = await ctfContract.setApprovalForAll(contractConfig.exchange, true, {
            gasPrice: ethers.utils.parseUnits("100", "gwei"),
            gasLimit: 200_000,
        });
        console.log(`✅ Conditional Tokens approval for Exchange set. Transaction Hash: ${txn.hash}`);
    }

    console.log("🎉 All allowances are set!");
};

export default approveAllowances;