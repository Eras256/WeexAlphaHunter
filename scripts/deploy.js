import hre from "hardhat";
const { ethers, network } = hre;
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🚀 Starting deployment to", network.name);
    console.log("================================================");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying contracts with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    console.log("================================================\n");

    // Deploy TradeVerifier
    console.log("📝 Deploying TradeVerifier contract...");
    const TradeVerifier = await ethers.getContractFactory("TradeVerifier");
    const tradeVerifier = await TradeVerifier.deploy();
    await tradeVerifier.waitForDeployment();
    const tradeVerifierAddress = await tradeVerifier.getAddress();

    console.log("✅ TradeVerifier deployed to:", tradeVerifierAddress);
    console.log("   Transaction hash:", tradeVerifier.deploymentTransaction().hash);
    console.log("");

    // Deploy StrategyRegistry
    console.log("📝 Deploying StrategyRegistry contract...");
    const StrategyRegistry = await ethers.getContractFactory("StrategyRegistry");
    const strategyRegistry = await StrategyRegistry.deploy();
    await strategyRegistry.waitForDeployment();
    const strategyRegistryAddress = await strategyRegistry.getAddress();

    console.log("✅ StrategyRegistry deployed to:", strategyRegistryAddress);
    console.log("   Transaction hash:", strategyRegistry.deploymentTransaction().hash);
    console.log("");

    // Wait for confirmations
    console.log("⏳ Waiting for block confirmations...");
    if (tradeVerifier.deploymentTransaction()) {
        await tradeVerifier.deploymentTransaction().wait(5);
    }
    if (strategyRegistry.deploymentTransaction()) {
        await strategyRegistry.deploymentTransaction().wait(5);
    }
    console.log("✅ Contracts confirmed!\n");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.config.chainId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            TradeVerifier: {
                address: tradeVerifierAddress,
                txHash: tradeVerifier.deploymentTransaction().hash,
            },
            StrategyRegistry: {
                address: strategyRegistryAddress,
                txHash: strategyRegistry.deploymentTransaction().hash,
            }
        }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to file
    const filename = `${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    console.log("📄 Deployment info saved to:", filepath);
    console.log("");

    // Update .env file with contract addresses
    const envPath = path.join(__dirname, "..", ".env.local");
    let envContent = "";

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
    }

    // Update or add contract addresses
    const networkPrefix = network.name === "baseSepolia" ? "BASE_SEPOLIA" :
        network.name === "sepolia" ? "SEPOLIA" :
            network.name.toUpperCase();

    const updates = [
        `${networkPrefix}_TRADE_VERIFIER_ADDRESS=${tradeVerifierAddress}`,
        `${networkPrefix}_STRATEGY_REGISTRY_ADDRESS=${strategyRegistryAddress}`,
        `NEXT_PUBLIC_${networkPrefix}_TRADE_VERIFIER_ADDRESS=${tradeVerifierAddress}`,
        `NEXT_PUBLIC_${networkPrefix}_STRATEGY_REGISTRY_ADDRESS=${strategyRegistryAddress}`,
    ];

    updates.forEach(update => {
        const [key] = update.split("=");
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, update);
        } else {
            envContent += `\n${update}`;
        }
    });

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env.local with contract addresses");
    console.log("");

    // Print summary
    console.log("================================================");
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("================================================");
    console.log("Network:", network.name);
    console.log("Chain ID:", network.config.chainId);
    console.log("");
    console.log("📋 Contract Addresses:");
    console.log("   TradeVerifier:    ", tradeVerifierAddress);
    console.log("   StrategyRegistry: ", strategyRegistryAddress);
    console.log("");
    console.log("🔍 Verify contracts with:");
    console.log(`   pnpm run verify:${network.name === 'baseSepolia' ? 'base-sepolia' : network.name}`);
    console.log("================================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
