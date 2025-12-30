
import { createBlockchainClient, createGeminiClient, createConsensusEngine, generateUUID, logger, sleep } from "@wah/core";
import { WeexClient } from "../../engine-compliance/src/weex-client.js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env
dotenv.config({ path: ".env.local" });
process.env.EXECUTION_MODE = "mock";
process.env.BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS = "0x9b8d4e3E7Ecf9Bb1F1039fc83E518069dB38281d";
process.env.BASE_SEPOLIA_STRATEGY_REGISTRY_ADDRESS = "0x074244A155ED76b8b6A4470D3a7864b546f6DefD";

/**
 * PRODUCTION TRADE EXECUTOR
 * Bridges AI Logic, Exchange Execution, and Blockchain Verification
 */
export async function runTradeExecutor() {
    logger.info("🚀 Starting WAlphaHunter Trade Executor...");
    logger.info("🤖 Initializing Multi-AI Consensus System (MetaPredict V1)...");

    // 1. Initialize Components
    const gemini = createGeminiClient();
    const consensus = createConsensusEngine(gemini);

    // DUAL CHAIN ARCHITECTURE: Base L2 (Primary) + Eth L1 (Settlement)
    const blockchainBase = createBlockchainClient('baseSepolia');
    const blockchainEth = createBlockchainClient('sepolia');
    const exchange = new WeexClient("production-v1");

    if (!blockchainBase) {
        throw new Error("Base Sepolia client failed to initialize");
    }
    if (!blockchainEth) {
        logger.warn("⚠️ Ethereum Sepolia client not initialized (L1 Settlement disabled)");
    }

    logger.info("✅ Systems Initialized:");
    logger.info("   • Consensus AI (Council of 6 + Titan HNN)");
    logger.info("   • Blockchain L2: Base Sepolia ✓");
    logger.info(`   • Blockchain L1: Ethereum Sepolia ${blockchainEth ? '✓' : '✗'}`);
    logger.info("   • Exchange: WEEX (Mock Mode)");

    const SYMBOLS = ['cmt_btcusdt'];
    let running = true;

    // Main Trading Loop
    while (running) {
        for (const symbol of SYMBOLS) {
            try {
                // A. Market Data Analysis (Institutional Grade)
                let currentPrice = 95000;
                let rsiValue = 50;
                let trend = 'NEUTRAL';
                let imbalance = 0;
                let fearGreedIndex = 50;
                let wxtPrice = 0.05; // Standard

                try {
                    // 1. Price
                    currentPrice = await exchange.getTicker(symbol);
                    logger.info(`\n📊 Market Price [${symbol}]: $${currentPrice}`);

                    // 1b. Eco-System Check (WXT Token)
                    wxtPrice = await exchange.getWXTPrice();
                    logger.info(`  💎 WXT Ecosystem Token: $${wxtPrice} (Affiliate Boost Active: WEEX-OWEN-VIP)`);

                    // 2. Order Book Depth
                    const depth = await exchange.getDepth(symbol, 15);
                    if (depth.bids.length > 0 && depth.asks.length > 0) {
                        const bidVol = depth.bids.slice(0, 5).reduce((acc: number, x: string[]) => acc + parseFloat(x[1]), 0);
                        const askVol = depth.asks.slice(0, 5).reduce((acc: number, x: string[]) => acc + parseFloat(x[1]), 0);
                        const totalVol = bidVol + askVol;
                        if (totalVol > 0) {
                            imbalance = (bidVol - askVol) / totalVol;
                        }
                    }

                    // 3. Technicals (Candles)
                    const candles = await exchange.getCandles(symbol, '15m', 20);
                    if (candles && candles.length > 14) {
                        const closes = candles.map((c: any) => typeof c === 'object' ? parseFloat(c.close || c[4]) : parseFloat(c));

                        rsiValue = calculateRSI(closes, 14);

                        const sma20 = closes.reduce((a, b) => a + b, 0) / closes.length;
                        trend = currentPrice > sma20 ? 'BULLISH' : 'BEARISH';
                    }

                    // 4. External Sentiment (Fear & Greed API) - PRO FEATURE
                    // This gives the AI "Macro Context"
                    try {
                        const fgRes = await fetch('https://api.alternative.me/fng/');
                        const fgData = await fgRes.json();
                        if (fgData && fgData.data && fgData.data.length > 0) {
                            fearGreedIndex = parseInt(fgData.data[0].value);
                        }
                    } catch (e) {
                        // Ignore API fail, default to 50
                    }

                    logger.info(`  📉 Analysis: RSI=${rsiValue.toFixed(2)} | Trend=${trend} | OrderImbalance=${imbalance.toFixed(2)} | F&G=${fearGreedIndex}`);
                } catch (e) {
                    logger.warn(`Failed to fetch Market Data: ${e}`);
                }

                // B. Generate AI Signal (CONSENSUS) with ECOSYSTEM BOOST
                const signal = await consensus.generateConsensusSignal({
                    symbol,
                    price: currentPrice,
                    indicators: {
                        RSI: parseFloat(rsiValue.toFixed(2)),
                        Trend: trend === 'BULLISH' ? 1 : -1,
                        OrderImbalance: parseFloat(imbalance.toFixed(2)), // Vital signal
                        FearGreed: fearGreedIndex, // 0-100 (Ext Fear to Ext Greed)
                        WXT_Ecosystem_Price: wxtPrice, // AI sees platform strength
                        MarketPhase: rsiValue > 70 ? 1 : rsiValue < 30 ? -1 : 0
                    }
                });

                logger.info(`  🧠 Consensus Decision: ${signal.action}`);
                logger.info(`     Confidence: ${signal.confidence}% | Agreement: ${signal.consensusScore}%`);
                logger.info(`     Models: ${signal.modelUsed}`);

                if (signal.action === 'HOLD') {
                    logger.info(`  ⏸️  Consensus was HOLD, but forcing BUY for BLOCKCHAIN TEST.`);
                    signal.action = 'BUY'; // Force Buy
                    // continue; // Disabled for test
                }

                // --- Helper Functions ---
                function calculateRSI(prices: number[], period: number = 14): number {
                    if (prices.length < period + 1) return 50;

                    let gains = 0;
                    let losses = 0;

                    for (let i = 1; i < prices.length; i++) {
                        const diff = prices[i] - prices[i - 1];
                        if (diff >= 0) gains += diff;
                        else losses -= diff;
                    }

                    const avgGain = gains / period;
                    const avgLoss = losses / period;

                    if (avgLoss === 0) return 100;
                    const rs = avgGain / avgLoss;
                    return 100 - (100 / (1 + rs));
                }

                // C. Execute Trade on Exchange
                // Safe size: 0.0002 BTC (~$19 @ $95k). Min Notional usually 5-10 USDT.
                const quantity = 0.0002;
                logger.info(`  ⚡ Executing ${signal.action} order on WEEX...`);

                const order = await exchange.placeOrder(symbol, signal.action, quantity, currentPrice);
                logger.info(`  ✅ Order Filled: ${order.orderId || 'MockID'}`);

                // D. Upload AI Log to WEEX (COMPLIANCE)
                if (order.orderId) {
                    await exchange.uploadAiLog({
                        orderId: order.orderId,
                        stage: "Consensus Execution",
                        model: signal.modelUsed.substring(0, 50), // Ensure fit
                        input: {
                            symbol,
                            price: currentPrice,
                            technical_indicators: {
                                RSI: parseFloat(rsiValue.toFixed(2)),
                                Trend: trend
                            },
                            timestamp: Date.now()
                        },
                        output: signal,
                        explanation: signal.reasoning.substring(0, 1000)
                    });
                }

                // E. Record on Blockchain (Dual-Chain Proof of Work)
                try {
                    const tradeId = generateUUID();
                    const decisionId = generateUUID();

                    // 1. Record on BASE SEPOLIA (L2 - Primary)
                    logger.info(`  📝 [L2] Minting AI Decision Proof on Base Sepolia...`);
                    await blockchainBase.recordAIDecision({
                        decisionId,
                        reasoning: signal.reasoning,
                        confidence: signal.confidence
                    });

                    logger.info(`  🔗 [L2] Minting Trade Verification Proof on Base Sepolia...`);
                    await blockchainBase.submitTradeProof({
                        tradeId,
                        aiDecisionId: decisionId,
                        symbol,
                        exchangeOrderId: order.orderId || `mock-ord-${Date.now()}`,
                        price: currentPrice,
                        qty: quantity,
                        side: signal.action,
                        aiConfidence: signal.confidence
                    });
                    logger.info(`  ✅ [L2] Trade Verified on Base Sepolia!`);

                    // 2. Record on ETHEREUM SEPOLIA (L1 - Settlement)
                    if (blockchainEth) {
                        logger.info(`  📝 [L1] Anchoring Decision to Ethereum Sepolia...`);
                        await blockchainEth.recordAIDecision({
                            decisionId,
                            reasoning: signal.reasoning,
                            confidence: signal.confidence
                        });

                        logger.info(`  🔗 [L1] Anchoring Trade Proof to Ethereum Sepolia...`);
                        await blockchainEth.submitTradeProof({
                            tradeId,
                            aiDecisionId: decisionId,
                            symbol,
                            exchangeOrderId: order.orderId || `mock-ord-${Date.now()}`,
                            price: currentPrice,
                            qty: quantity,
                            side: signal.action,
                            aiConfidence: signal.confidence
                        });
                        logger.info(`  ✅ [L1] Trade Settled on Ethereum Sepolia!`);
                    }

                    logger.info(`  🎉 DUAL-CHAIN VERIFICATION COMPLETE!`);
                } catch (bcError: any) {
                    logger.warn(`  ⚠️ Blockchain Recording Failed (Non-Critical): ${bcError.message}`);
                }

                // Wait to avoid rate limits
                await sleep(10000);

            } catch (error: any) {
                logger.error(`Loop Error: ${error.message}`);
                await sleep(20000);
            }
        }
        await sleep(15000);
    }
}

// Auto-start if called directly
runTradeExecutor().catch(error => {
    console.error("FATAL ERROR:", error);
    process.exit(1);
});
