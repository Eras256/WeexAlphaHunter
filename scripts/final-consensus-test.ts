/**
 * 🦁 FINAL CONSENSUS TEST - Council of 6 + Titan
 * Demonstrates how all AI models vote together to reach consensus
 */

import { createGeminiClient, createConsensusEngine, localAI } from "@wah/core";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testFullConsensus() {
    console.log("\n" + "=".repeat(60));
    console.log("🏛️  WALPHAHUNTER - COUNCIL OF 6 CONSENSUS TEST");
    console.log("=".repeat(60));

    // Market scenario
    const marketData = {
        symbol: "BTC/USDT",
        price: 94500,
        indicators: {
            RSI: 35,  // Slightly oversold
            Trend: -1, // Bearish
            OrderImbalance: 0.15, // Slight buy pressure
            FearGreed: 28, // Fear
            WXT_Ecosystem_Price: 0.048
        }
    };

    console.log("\n📊 MARKET CONDITIONS:");
    console.log(`   Symbol: ${marketData.symbol}`);
    console.log(`   Price: $${marketData.price.toLocaleString()}`);
    console.log(`   RSI: ${marketData.indicators.RSI} (Oversold < 30)`);
    console.log(`   Trend: ${marketData.indicators.Trend === 1 ? 'BULLISH' : 'BEARISH'}`);
    console.log(`   Order Imbalance: ${(marketData.indicators.OrderImbalance * 100).toFixed(1)}%`);
    console.log(`   Fear & Greed: ${marketData.indicators.FearGreed} (Fear < 50)`);

    console.log("\n" + "-".repeat(60));
    console.log("🧠 CONSULTING THE COUNCIL OF 6...");
    console.log("-".repeat(60));

    // Initialize consensus engine
    const gemini = createGeminiClient();
    const consensus = createConsensusEngine(gemini);

    // Get consensus signal
    const startTime = Date.now();
    const signal = await consensus.generateConsensusSignal(marketData);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("📋 COUNCIL VOTES:");
    console.log("=".repeat(60));

    // Parse and display individual model votes
    const models = signal.modelUsed.split(", ");
    models.forEach((model: string, i: number) => {
        const icons = ["🔮", "🤖", "⚡", "🧪", "🔬", "🦁"];
        console.log(`   ${icons[i % 6]} ${model}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("🎯 FINAL CONSENSUS DECISION:");
    console.log("=".repeat(60));

    const actionEmoji = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '🟡';
    console.log(`\n   ${actionEmoji} ACTION: ${signal.action}`);
    console.log(`   📊 CONFIDENCE: ${signal.confidence}%`);
    console.log(`   🤝 CONSENSUS SCORE: ${signal.consensusScore}%`);
    console.log(`   ⏱️  DECISION TIME: ${elapsed}s`);

    console.log("\n📝 REASONING:");
    console.log(`   "${signal.reasoning.substring(0, 200)}..."`);

    // Also test Titan standalone
    console.log("\n" + "-".repeat(60));
    console.log("🦁 TITAN NEURAL ENGINE (Standalone Test):");
    console.log("-".repeat(60));

    const titanSignal = await localAI.generateSignal(marketData);
    const titanEmoji = titanSignal.action === 'BUY' ? '🟢' : titanSignal.action === 'SELL' ? '🔴' : '🟡';

    console.log(`   ${titanEmoji} Titan Vote: ${titanSignal.action}`);
    console.log(`   📊 Confidence: ${titanSignal.confidence.toFixed(1)}%`);
    console.log(`   🔧 Source: ${titanSignal.source}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ CONSENSUS TEST COMPLETE");
    console.log("=".repeat(60));
    console.log("\n🏁 The Council has spoken! Ready for production.\n");
}

testFullConsensus().catch(console.error);
