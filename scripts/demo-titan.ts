
// Import LocalIntelligence from core
// Note: Relative path hacking due to script location
import { localAI } from "../packages/core/src/local-ai.js"; // Import our

// Mock sleep function
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("🦁 TITAN HYBRID AI - DEMO SESSION");
    console.log("===================================");

    // Warmup phase - sending some candles to fill history buffer
    console.log("⏳ Warming up context window (10 candles)...");

    for (let i = 0; i < 9; i++) {
        await localAI.generateSignal({
            price: 100 + i,
            indicators: { RSI: 50, Trend: 0, OrderImbalance: 0, FearGreed: 50 }
        });
    }

    console.log("✅ Titan Context Ready.\n");

    // Scenario 1: Extreme Bullish (Math & Neural should agree)
    console.log("🔹 SCENARIO 1: Extreme Bullish Pump (RSI Low -> Pump)");
    const signal1 = await localAI.generateSignal({
        price: 90,
        indicators: {
            RSI: 25, // Oversold
            Trend: 1, // Bullish Trend
            OrderImbalance: 0.5, // High Buying Pressure
            FearGreed: 20 // Extreme Fear (Buy Signal)
        }
    });
    console.log(`Action: ${signal1.action} | Confidence: ${(signal1.confidence * 100).toFixed(1)}%`);
    console.log(`Source: ${signal1.source}`);
    console.log(`Reason: ${signal1.reasoning}\n`);

    // Scenario 2: Trap (Math Neutral, but Neural detects pattern)
    // We send a pattern that might trigger Neural weights (if trained randomly, results vary, but architecture holds)
    console.log("🔹 SCENARIO 2: Subtle Neural Pattern");
    const signal2 = await localAI.generateSignal({
        price: 105,
        indicators: {
            RSI: 45, // Neutralish
            Trend: 0, // Flat
            OrderImbalance: 0.1, // Neutral
            FearGreed: 50
        }
    });
    console.log(`Action: ${signal2.action} | Confidence: ${(signal2.confidence * 100).toFixed(1)}%`);
    console.log(`Source: ${signal2.source}`);
    console.log(`Reason: ${signal2.reasoning}\n`);
}

main().catch(console.error);
