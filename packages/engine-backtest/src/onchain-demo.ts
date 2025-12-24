import { createBlockchainClient, createGeminiClient, generateUUID, logger, sleep } from "@wah/core";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env from root .env.local
dotenv.config({ path: path.join(process.cwd(), "../../.env.local") });
dotenv.config({ path: path.join(process.cwd(), "../../.env") });

/**
 * On-Chain Demo with Real Gemini AI Integration
 * 
 * This script demonstrates the complete flow:
 * 1. Generate real AI trading signals using Gemini
 * 2. Record AI decisions on-chain
 * 3. Submit trade proofs to blockchain
 * 4. Display updated statistics
 */
async function runOnChainDemo() {
    logger.info("🚀 Starting On-Chain Demo with Gemini AI...\n");

    // Initialize Blockchain Client (Base Sepolia)
    const blockchain = createBlockchainClient('baseSepolia');

    if (!blockchain) {
        logger.error("❌ Failed to initialize Blockchain Client. Check .env.local");
        process.exit(1);
    }

    // Initialize Gemini AI Client
    const gemini = createGeminiClient();
    const useAI = gemini.isConfigured();

    if (!useAI) {
        logger.warn("⚠️  GEMINI_API_KEY not configured. Using mock signals.");
    } else {
        logger.info("✅ Gemini AI configured and ready");
    }

    logger.info("✅ Connected to Base Sepolia");
    const balance = await blockchain.getBalance();
    logger.info(`💰 Wallet Balance: ${balance} ETH\n`);

    // 1. Register a Strategy
    const strategyName = `GEMINI AI Strategy - ${new Date().toISOString().split('T')[0]}`;
    logger.info(`📝 Registering Strategy: ${strategyName}`);

    try {
        const strategyHash = await blockchain.registerStrategy({
            name: strategyName,
            description: "AI-powered trading strategy using Gemini 2.5 for signal generation and on-chain verification"
        });
        logger.info(`✅ Strategy Registered! Hash: ${strategyHash}\n`);

        // 2. Generate and Submit AI-Powered Trades
        const numberOfTrades = 5;
        logger.info(`🤖 Generating ${numberOfTrades} AI-Powered Trades...\n`);

        const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];

        for (let i = 0; i < numberOfTrades; i++) {
            const symbol = symbols[i % symbols.length];
            const basePrice = symbol === "BTC/USDT" ? 95000 : symbol === "ETH/USDT" ? 3500 : 150;
            const price = basePrice + (Math.random() - 0.5) * basePrice * 0.05; // ±5% variation

            logger.info(`[${i + 1}/${numberOfTrades}] Processing ${symbol}...`);

            try {
                let action: 'BUY' | 'SELL';
                let confidence: number;
                let reasoning: string;

                if (useAI) {
                    // Generate real AI signal using Gemini
                    logger.info(`  🧠 Generating AI signal with Gemini...`);

                    const signal = await gemini.generateTradingSignal({
                        symbol: symbol,
                        price: price,
                        volume: 1000000000 + Math.random() * 500000000,
                        indicators: {
                            rsi: 30 + Math.random() * 40,
                            macd: -0.5 + Math.random() * 1.0,
                            volume_ratio: 0.8 + Math.random() * 0.4
                        }
                    });

                    // Skip HOLD signals for this demo
                    if (signal.action === 'HOLD') {
                        logger.info(`  ⏸️  Signal: HOLD - Skipping trade\n`);
                        continue;
                    }

                    action = signal.action;
                    confidence = signal.confidence;
                    reasoning = signal.reasoning;

                    logger.info(`  ✅ AI Signal: ${action} (Confidence: ${(confidence * 100).toFixed(1)}%)`);
                    logger.info(`  💭 Reasoning: ${reasoning.substring(0, 80)}...`);

                } else {
                    // Mock mode
                    action = Math.random() > 0.5 ? 'BUY' : 'SELL';
                    confidence = 0.8 + Math.random() * 0.15;
                    reasoning = "Mock signal - Gemini API key not configured";

                    logger.info(`  🎲 Mock Signal: ${action} (Confidence: ${(confidence * 100).toFixed(1)}%)`);
                }

                // Generate IDs
                const tradeId = generateUUID();
                const aiDecisionId = generateUUID();
                const qty = 0.1 + Math.random() * 0.5;

                // Record AI Decision on-chain
                logger.info(`  📝 Recording AI decision on-chain...`);
                await blockchain.recordAIDecision({
                    decisionId: aiDecisionId,
                    reasoning: reasoning,
                    confidence: confidence
                });

                // Submit Trade Proof
                logger.info(`  📤 Submitting trade proof to blockchain...`);
                const txHash = await blockchain.submitTradeProof({
                    tradeId,
                    aiDecisionId,
                    symbol,
                    price,
                    qty,
                    side: action,
                    aiConfidence: confidence
                });

                logger.info(`  ✅ Trade recorded! TX: ${txHash}`);
                logger.info(`  🔗 View on BaseScan: https://sepolia.basescan.org/tx/${txHash}\n`);

                // Rate limiting
                await sleep(2000);

            } catch (error: any) {
                logger.error(`  ❌ Error processing trade: ${error.message}\n`);
            }
        }

        // 3. Display Updated Stats
        logger.info("═".repeat(60));
        logger.info("📊 UPDATED ON-CHAIN STATISTICS");
        logger.info("═".repeat(60));

        const stats = await blockchain.getStats();
        logger.info(`Total Trades Recorded:    ${stats.totalTrades}`);
        logger.info(`Total AI Decisions:       ${stats.totalDecisions}`);
        logger.info(`Network:                  Base Sepolia`);
        logger.info(`Contract Address:         ${process.env.BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS}`);
        logger.info("═".repeat(60));

        logger.info("\n🎉 On-Chain Demo Complete!");
        logger.info("\n📱 Next Steps:");
        logger.info("1. Check the Frontend Dashboard at http://localhost:3000");
        logger.info("2. View transactions on BaseScan");
        logger.info("3. Verify AI decisions are recorded on-chain");
        logger.info("4. Run 'pnpm --filter @wah/engine-backtest ai:gen --runId=demo1' for more AI signals\n");

    } catch (error: any) {
        logger.error(`\n❌ Error during demo: ${error.message}`);
        logger.error(error.stack);
        process.exit(1);
    }
}

runOnChainDemo();
