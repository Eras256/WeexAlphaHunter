
import { createBlockchainClient, createGeminiClient, generateUUID, logger, sleep } from "@wah/core";
import { WeexClient } from "../../engine-compliance/src/weex-client.js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env
dotenv.config({ path: ".env.local" });

/**
 * PRODUCTION TRADE EXECUTOR
 * Bridges AI Logic, Exchange Execution, and Blockchain Verification
 */
export async function runTradeExecutor() {
    logger.info("🚀 Starting WAlphaHunter Trade Executor...");

    // 1. Initialize Components
    const gemini = createGeminiClient();
    const blockchain = createBlockchainClient('baseSepolia');
    const exchange = new WeexClient("production-v1");

    if (!blockchain) {
        throw new Error("Blockchain client failed to initialize");
    }

    logger.info("✅ Systems Initialized: AI (Gemini), Blockchain (Base), Exchange (WEEX)");

    const SYMBOLS = ['BTC/USDT', 'ETH/USDT'];
    let running = true;

    // Main Trading Loop
    while (running) {
        for (const symbol of SYMBOLS) {
            try {
                // A. Market Data Analysis (Simulated real-time fetch for now)
                const currentPrice = symbol === 'BTC/USDT' ? 95000 + (Math.random() * 100) : 3400 + (Math.random() * 10);

                logger.info(`\n📊 Analyzing ${symbol} @ $${currentPrice.toFixed(2)}...`);

                // B. Generate AI Signal
                const signal = await gemini.generateTradingSignal({
                    symbol,
                    price: currentPrice
                });

                if (signal.action === 'HOLD') {
                    logger.info(`  🧠 AI Decision: HOLD (Confidence: ${signal.confidence})`);
                    continue;
                }

                // C. Execute Trade on Exchange
                const quantity = symbol === 'BTC/USDT' ? 0.01 : 0.1;
                logger.info(`  ⚡ Executing ${signal.action} order on WEEX...`);

                const order = await exchange.placeOrder(symbol, signal.action, quantity, currentPrice);
                logger.info(`  ✅ Order Filled: ${order.orderId}`);

                // D. Record on Blockchain (Proof of Work)
                const tradeId = generateUUID();
                const decisionId = generateUUID();

                // 1. Record Reasoning
                logger.info(`  📝 Minting AI Decision Proof...`);
                await blockchain.recordAIDecision({
                    decisionId,
                    reasoning: signal.reasoning,
                    confidence: signal.confidence
                });

                // 2. Record Trade 
                logger.info(`  🔗 Minting Trade Verification Proof...`);
                const txHash = await blockchain.submitTradeProof({
                    tradeId,
                    aiDecisionId: decisionId,
                    symbol,
                    price: currentPrice,
                    qty: quantity,
                    side: signal.action,
                    aiConfidence: signal.confidence
                });

                logger.info(`  🎉 Trade Verified on Base Sepolia! TX: ${txHash}`);

                // Wait to avoid rate limits
                await sleep(5000);

            } catch (error: any) {
                logger.error(`Loop Error: ${error.message}`);
                await sleep(5000);
            }
        }
        await sleep(2000);
    }
}

// Auto-start if called directly
runTradeExecutor().catch(error => {
    console.error("FATAL ERROR:", error);
    process.exit(1);
});
