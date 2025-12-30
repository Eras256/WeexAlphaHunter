
import { createGeminiClient, createConsensusEngine, logger } from "@wah/core";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function runTest() {
    console.log("🔍 Checking Consensus Configuration...");
    console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);

    console.log("\n🤖 Initializing Consensus Engine...");
    const gemini = createGeminiClient();
    const consensus = createConsensusEngine(gemini);

    console.log("\n🧪 Running Test Signal Generation...");
    // Mock Market Data (Bitcoin Dip)
    const marketData = {
        symbol: 'BTC/USDT',
        price: 95000,
        indicators: {
            RSI: 30, // Oversold
            MACD: -100
        }
    };

    try {
        const signal = await consensus.generateConsensusSignal(marketData);
        console.log("\n✅ CONSENSUS RESULT:");
        console.log(`   Action: ${signal.action}`);
        console.log(`   Confidence: ${signal.confidence}`);
        console.log(`   Agreement Score: ${signal.consensusScore}%`);
        console.log(`   Models: ${signal.modelUsed}`);
        console.log(`   Reasoning: ${signal.reasoning}`);
        console.log(`   Details:`, JSON.stringify(signal.details, null, 2));

    } catch (e: any) {
        console.error("❌ Test Failed:", e.message);
    }
}

runTest();
