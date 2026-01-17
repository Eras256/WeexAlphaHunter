
import { getTitanV5 } from './packages/engine-backtest/src/titan-v5-core';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load Environment
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testWhaleAPI() {
    console.log("🐋 Testing Titan V5 Whale Sentinel Connection...");

    try {
        const titan = getTitanV5();
        await titan.initialize();

        console.log("✅ Titan V5 Core Initialized.");
        console.log("📡 Pinging Whale Sentinel Network...");

        // Simulate a trade scenario to trigger whale check
        // Using BTC as it has the most volume/whale activity
        const result = await titan.analyze({
            symbol: "BTCUSDT",
            proposedAction: "BUY",
            trend: "BULLISH",
            volatility: 50,
            adx: 30, // Force > 25 to ensure logic triggers if used
            rsi: 55,
            aiConfidence: 0.85
        });

        console.log("\n🔍 WHALE INTELLIGENCE REPORT:");
        console.log("------------------------------------------------");
        console.log(`Signal:      ${result.whaleSignal.signal}`);
        console.log(`Confidence:  ${(result.whaleSignal.confidence * 100).toFixed(1)}%`);
        console.log(`Reasoning:   ${result.whaleSignal.reason}`);
        console.log("------------------------------------------------");

        if (result.whaleSignal.signal !== 'NEUTRAL') {
            console.log("✅ API Connection Successful & Returning LIVE Data.");
        } else {
            console.log("⚠️ API Connected but returned NEUTRAL (Could be market conditions or mock mode).");
        }

    } catch (error) {
        console.error("❌ Whale Sentinel Connection FAILED:", error);
    }
}

testWhaleAPI();
