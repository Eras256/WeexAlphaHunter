import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const REGISTRY_ADDRESS = process.env.BASE_SEPOLIA_STRATEGY_REGISTRY_ADDRESS; // Matches .env line 134
const RPC_URL = process.env.BASE_RPC_URL; // Matches .env line 126
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!REGISTRY_ADDRESS || !RPC_URL || !PRIVATE_KEY) {
    console.error("❌ Missing env vars (REGISTRY, RPC, or KEY)");
    process.exit(1);
}

// Contract ABI (Register method)
const ABI = [
    "function registerStrategy(bytes32 _strategyHash, string memory _name, string memory _description) external"
];

const strategies = [
    {
        name: "Llama HFT Scalper",
        description: "Ultra-low latency scalping powered by Llama (Groq). Exploits micro-inefficiencies.",
        hash: ethers.id("Llama-HFT-Scalper-V1")
    },
    {
        name: "DeepSeek Statistical Arb",
        description: "Long/Short neutral strategy using DeepSeek for cross-exchange spreads.",
        hash: ethers.id("DeepSeek-Arb-V1")
    },
    {
        name: "Gemini Macro Trend",
        description: "Swing trading engine using Gemini to process global news and sentiment.",
        hash: ethers.id("Gemini-Macro-V1")
    },
    {
        name: "Mixtral Sentiment Shift",
        description: "Detects sudden sentiment reversals on X (Twitter) using Mixtral.",
        hash: ethers.id("Mixtral-Sentiment-V1")
    },
    {
        name: "Qwen Order Flow",
        description: "Analyzes L2 Order Flow Imbalance (OFI) to predict whale movements.",
        hash: ethers.id("Qwen-OFI-V1")
    },
    {
        name: "Titan Guard (Fallback)",
        description: "Deterministic Math Engine fallback for 100% uptime and capital protection.",
        hash: ethers.id("Titan-Math-V1")
    }
];

async function main() {
    console.log("🚀 Registering Titan Strategies on Base Sepolia...");
    console.log(`📡 RPC: ${RPC_URL}`);
    console.log(`📝 Registry: ${REGISTRY_ADDRESS}`);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(REGISTRY_ADDRESS!, ABI, wallet);

    for (const strat of strategies) {
        try {
            console.log(`\n🔹 Registering: ${strat.name}...`);
            const tx = await contract.registerStrategy(strat.hash, strat.name, strat.description);
            console.log(`   ⏳ Tx Hash: ${tx.hash}. Waiting for confirmation...`);
            await tx.wait();
            console.log(`   ✅ Registered!`);
        } catch (error: any) {
            if (error.message.includes("already registered")) {
                console.log(`   ⚠️ Already registered. Skipping.`);
            } else {
                console.error(`   ❌ Failed: ${error.reason || error.message}`);
            }
        }
    }
    console.log("\n🎉 All strategies processed!");
}

main().catch(console.error);
