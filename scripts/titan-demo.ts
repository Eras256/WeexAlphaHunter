/**
 * WAlphaHunter - Simple Trading Demo with Titan AI
 * Demonstrates: AI Signal → Mock Trade → On-Chain Verification (Base Sepolia)
 */

import { localAI, createBlockchainClient, generateUUID, logger } from "@wah/core";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Use newly deployed contracts
process.env.BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS = "0x9b8d4e3E7Ecf9Bb1F1039fc83E518069dB38281d";
process.env.BASE_SEPOLIA_STRATEGY_REGISTRY_ADDRESS = "0x074244A155ED76b8b6A4470D3a7864b546f6DefD";
process.env.BASE_RPC_URL = "https://sepolia.base.org";

async function runDemo() {
    console.log("\n🦁 ===== WALPHAHUNTER TITAN DEMO =====");
    console.log("🧠 Loading Titan Neural Engine...\n");

    // 1. Initialize Blockchain Client (Base Sepolia only)
    const blockchain = createBlockchainClient('baseSepolia');
    if (!blockchain) {
        console.error("❌ Failed to initialize blockchain client. Check PRIVATE_KEY.");
        return;
    }
    console.log("✅ Blockchain Client: Base Sepolia");

    // 2. Generate AI Signal using Titan (Local)
    const mockMarketData = {
        price: 95000 + Math.random() * 2000, // Simulate price variation
        indicators: {
            RSI: 30 + Math.random() * 40,
            Trend: Math.random() > 0.5 ? 1 : -1,
            OrderImbalance: (Math.random() - 0.5) * 0.4
        }
    };

    console.log(`\n📊 Market Data: Price=$${mockMarketData.price.toFixed(2)}, RSI=${mockMarketData.indicators.RSI.toFixed(1)}`);
    console.log("🧠 Consulting Titan Neural Engine...\n");

    const signal = await localAI.generateSignal(mockMarketData);

    console.log(`🎯 TITAN SIGNAL:`);
    console.log(`   Action: ${signal.action}`);
    console.log(`   Confidence: ${(signal.confidence).toFixed(1)}%`);
    console.log(`   Source: ${signal.source}`);
    console.log(`   Reasoning: ${signal.reasoning}`);

    // 3. Simulate Trade Execution
    console.log("\n⚡ Executing Mock Trade on WEEX...");
    const orderId = `mock_${Date.now()}`;
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Status: FILLED (Simulated)`);

    // 4. Record on Blockchain (Base Sepolia)
    console.log("\n🔗 Recording Proofs on Base Sepolia...");

    const decisionId = generateUUID();
    const tradeId = generateUUID();

    try {
        // Record AI Decision
        console.log("   📝 Minting AI Decision Proof...");
        const decisionTxHash = await blockchain.recordAIDecision({
            decisionId,
            reasoning: `Titan Signal: ${signal.action} with ${signal.confidence.toFixed(1)}% confidence. ${signal.reasoning?.substring(0, 100) || ""}`,
            confidence: signal.confidence
        });
        console.log(`   ✅ AI Decision TX: ${decisionTxHash}`);

        // Record Trade Proof
        console.log("   📝 Minting Trade Proof...");
        const tradeTxHash = await blockchain.submitTradeProof({
            tradeId,
            aiDecisionId: decisionId,
            symbol: "BTC/USDT",
            exchangeOrderId: orderId,
            price: mockMarketData.price,
            qty: 0.001,
            side: signal.action as 'BUY' | 'SELL',
            aiConfidence: signal.confidence
        });
        console.log(`   ✅ Trade Proof TX: ${tradeTxHash}`);

        console.log("\n🎉 DEMO COMPLETE! Transactions recorded on Base Sepolia.");
        console.log("🔍 Verify at: https://sepolia.basescan.org/address/0x9b8d4e3E7Ecf9Bb1F1039fc83E518069dB38281d");

    } catch (error: any) {
        console.error("\n❌ Blockchain Error:", error.message);
    }
}

runDemo();
