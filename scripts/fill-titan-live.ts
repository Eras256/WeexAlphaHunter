import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { localAI } from "../packages/core/src/local-ai"; // Import our new Titan Brain

dotenv.config({ path: '.env.local' });
dotenv.config();

// Configuration
const ETH_SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

const ETH_CONTRACT = "0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC";
const BASE_CONTRACT = "0xE6Dd5F45205b81d51BbCEDEb8Dc50AE36A1e6571";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ABI Limitada para recordAIDecision
const ABI = [
    "function recordAIDecision(bytes32 _decisionHash, string memory _reasoning, uint16 _confidence) external"
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("🦁 TITAN AI ENGINE: STARTING LIVE BROADCAST");
    console.log("==========================================");

    if (!PRIVATE_KEY) {
        throw new Error("❌ PRIVATE_KEY not found in .env");
    }

    // Connect to Networks
    const ethProvider = new ethers.JsonRpcProvider(ETH_SEPOLIA_RPC);
    const baseProvider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY);

    const ethSigner = wallet.connect(ethProvider);
    const baseSigner = wallet.connect(baseProvider);

    const ethContract = new ethers.Contract(ETH_CONTRACT, ABI, ethSigner);
    const baseContract = new ethers.Contract(BASE_CONTRACT, ABI, baseSigner);

    console.log(`📡 Connected to ETH Sepolia & BASE Sepolia`);
    console.log(`🧠 Titan Neural Model: LOADED`);

    // Generate 5 decisions for EACH network
    const ITERATIONS = 5;

    for (let i = 1; i <= ITERATIONS; i++) {
        console.log(`\n🔄 CYCLE ${i}/${ITERATIONS}`);

        // --- 1. ETHEREUM SEPOLIA (Simulating BTC/USDT) ---
        await processNetwork(ethContract, "ETH Sepolia", "BTC/USDT", 65000 + (Math.random() * 1000));

        // --- 2. BASE SEPOLIA (Simulating ETH/USDT) ---
        await processNetwork(baseContract, "BASE Sepolia", "ETH/USDT", 3500 + (Math.random() * 100));

        await sleep(2000); // Pause between cycles
    }

    console.log("\n✅ ALL SYSTEM PROCESSES COMPLETED.");
}

async function processNetwork(contract: ethers.Contract, networkName: string, pair: string, price: number) {
    // 1. Generate Fake Market Conditions
    const rsi = 30 + Math.random() * 40; // 30-70 range
    const trend = Math.random() > 0.5 ? 1 : -1;
    const imbalance = (Math.random() * 0.6) - 0.3;

    console.log(`   📊 Analyzing ${pair} on ${networkName}...`);

    // 2. Ask Titan AI for a decision
    const signal = await localAI.generateSignal({
        price: price,
        indicators: {
            RSI: rsi,
            Trend: trend,
            OrderImbalance: imbalance,
            FearGreed: rsi // correlating for demo
        }
    });

    console.log(`      💡 Titan says: ${signal.action} (${(signal.confidence * 100).toFixed(1)}%) via ${signal.source}`);

    try {
        // 3. Record on Chain
        const decisionHash = ethers.keccak256(ethers.toUtf8Bytes(`${networkName}_${Date.now()}_${Math.random()}`));
        // Confidence to basis points (0-10000)
        const confidenceBP = Math.floor(signal.confidence * 10000);

        // Enrich reasoning with Pair info since contract doesn't store pair in this function version
        const fullReasoning = `[${pair}] ${signal.action} - ${signal.reasoning}`;

        const tx = await contract.recordAIDecision(decisionHash, fullReasoning, confidenceBP);
        console.log(`      🚀 Rx Sent: ${tx.hash}`);

        // Don't wait strictly for block confirmation to speed up demo, 
        // rely on mempool. In prod we would wait.
        // await tx.wait(1); 
        // console.log(`      ✅ Confirmed`);

    } catch (e: any) {
        console.error(`      ❌ Error sending to ${networkName}:`, e.message || e);
    }
}

main().catch(console.error);
