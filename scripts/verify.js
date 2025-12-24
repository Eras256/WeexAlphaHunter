import hre from "hardhat";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config();

async function main() {
    console.log("🔍 Starting contract verification on", hre.network.name);
    console.log("================================================\n");

    // Read addresses from environment
    const networkPrefix = hre.network.name === "baseSepolia" ? "BASE_SEPOLIA" :
        hre.network.name === "sepolia" ? "SEPOLIA" :
            hre.network.name.toUpperCase();

    const tradeVerifierAddress = process.env[`${networkPrefix}_TRADE_VERIFIER_ADDRESS`];
    const strategyRegistryAddress = process.env[`${networkPrefix}_STRATEGY_REGISTRY_ADDRESS`];

    if (!tradeVerifierAddress || !strategyRegistryAddress) {
        console.log("❌ Contract addresses not found in environment variables");
        console.log(`   Looking for: ${networkPrefix}_TRADE_VERIFIER_ADDRESS`);
        console.log(`   Looking for: ${networkPrefix}_STRATEGY_REGISTRY_ADDRESS`);
        process.exit(1);
    }

    // Verify TradeVerifier
    console.log("📝 Verifying TradeVerifier at:", tradeVerifierAddress);
    try {
        await hre.run("verify", {
            address: tradeVerifierAddress,
            constructorArguments: [],
        });
        console.log("✅ TradeVerifier verified successfully!\n");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️  TradeVerifier already verified\n");
        } else {
            console.error("❌ TradeVerifier verification failed:", error.message, "\n");
        }
    }

    // Verify StrategyRegistry
    console.log("📝 Verifying StrategyRegistry at:", strategyRegistryAddress);
    try {
        await hre.run("verify", {
            address: strategyRegistryAddress,
            constructorArguments: [],
        });
        console.log("✅ StrategyRegistry verified successfully!\n");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️  StrategyRegistry already verified\n");
        } else {
            console.error("❌ StrategyRegistry verification failed:", error.message, "\n");
        }
    }

    console.log("================================================");
    console.log("🎉 VERIFICATION COMPLETE!");
    console.log("================================================");
    console.log(`View on explorer:`);

    const explorerUrl = hre.network.name === "baseSepolia"
        ? "https://sepolia.basescan.org/address/"
        : hre.network.name === "sepolia"
            ? "https://sepolia.etherscan.io/address/"
            : "https://etherscan.io/address/";

    console.log(`TradeVerifier:     ${explorerUrl}${tradeVerifierAddress}`);
    console.log(`StrategyRegistry:  ${explorerUrl}${strategyRegistryAddress}`);
    console.log("================================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:");
        console.error(error);
        process.exit(1);
    });
