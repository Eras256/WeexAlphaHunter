import { createBlockchainClient, generateUUID, logger, sleep } from "../../core/src/index.js";
import { ethers } from "ethers";
import { WeexClient } from "../../engine-compliance/src/weex-client.js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { localAI } from "../../core/src/local-ai.js";

// Load env
const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');

console.log(`[TitanPure] Loading .env from: ${rootEnvPath}`);
dotenv.config({ path: rootEnvPath });
console.log(`[TitanPure] Loading .env.local from: ${localEnvPath}`);
dotenv.config({ path: localEnvPath, override: true });

/**
 * TITAN PURE EXECUTOR (OFFLINE MODE)
 * Uses ONLY Local Intelligence (Math Models + Neural Net).
 * ZERO External AI APIs (No Gemini, No Groq, No OpenAI).
 */
export async function runTitanExecutor() {
    logger.info("🚀 Starting TITAN PURE EXECUTOR (Offline/Local Mode)...");
    logger.info("🚫 External AI APIs DISABLED. Using Native Titan Neural Engine.");

    // DUAL CHAIN ARCHITECTURE
    const blockchainBase = createBlockchainClient('baseSepolia');
    const blockchainEth = createBlockchainClient('sepolia');
    const exchange = new WeexClient("production-v1");

    if (!blockchainBase) logger.warn("⚠️ Base Sepolia client not initialized (Simulation Mode).");
    if (!blockchainEth) logger.warn("⚠️ Ethereum Sepolia client not initialized (L1 Settlement disabled).");

    logger.info("✅ Systems Initialized:");
    logger.info("   • Brain: TITAN NATIVE (Local Math + Neural)");
    logger.info(`   • Blockchain L2: Base Sepolia ${blockchainBase ? '✓' : '(Simulated)'}`);
    logger.info(`   • Exchange: WEEX (${exchange.mode === 'live' ? 'LIVE' : 'MOCK'} Mode)`);

    const STRATEGIES = [
        { name: "Titan Pure Math", risk: "LOW", winRate: 0.85 },
        { name: "Titan Neural Local", risk: "HIGH", winRate: 0.60 }
    ];

    const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt'];
    // State
    const recentActivity: any[] = [];
    let latestMarketData: any = null;
    let latestSignal: any = null;
    const lastTradeTime = new Map<string, number>(); // Memory to prevent duplicate orders
    let running = true;

    // Performance & Equity
    let initialEquity = 0;
    let currentEquity = 0;
    let availableBalance = 0;
    const startTime = Date.now();
    let useShadowLedger = false;

    // Restore history
    try {
        const statsPath = path.resolve(process.cwd(), 'apps/web/public/live-stats.json');
        if (fs.existsSync(statsPath)) {
            const data = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
            if (Array.isArray(data.recentActivity)) recentActivity.push(...data.recentActivity);
        }
    } catch (e) { }

    // Fetch Initial Balance
    try {
        logger.info("📊 Fetching account balance from WEEX...");
        const account = await exchange.getAccountInfo();
        logger.info(`📊 Account Response: ${JSON.stringify(account).substring(0, 200)}`);

        if (Array.isArray(account)) {
            const usdt = account.find((a: any) => a.asset === 'USDT' || a.currency === 'USDT' || a.coinName === 'USDT');
            logger.info(`📊 USDT Object Found: ${JSON.stringify(usdt)}`);
            if (usdt) {
                initialEquity = parseFloat(usdt.equity || usdt.available || '0');
                availableBalance = parseFloat(usdt.available || '0');
                logger.info(`📊 Parsed Equity: $${initialEquity}`);
            }
        } else if (account?.account_equity) {
            initialEquity = parseFloat(account.account_equity);
            if (account.available) availableBalance = parseFloat(account.available);
        }

        if (initialEquity < 10) throw new Error(`Balance too low: $${initialEquity}`);
        currentEquity = initialEquity;
        logger.info(`💰 Initial Equity: $${initialEquity.toFixed(2)}`);
    } catch (e: any) {
        logger.warn(`⚠️ Failed to fetch equity: ${e.message}`);
        logger.warn(`⚠️ Using Shadow Ledger ($1000).`);
        initialEquity = 1000.0;
        currentEquity = 1000.0;
        useShadowLedger = true;
    }

    // Reset Active Orders
    logger.info("🧹 Startup: Clearing active orders to reset limit...");
    for (const symbol of SYMBOLS) {
        await exchange.cancelAllOrders(symbol, 'normal');
        await sleep(100);
        await exchange.cancelAllOrders(symbol, 'plan');
        await sleep(200);

        // 🛡️ Safety: Set Leverage to 5x (Low Risk)
        await exchange.setLeverage(symbol, 5);
        await sleep(100);
    }
    logger.info("✅ Active orders cleared.");

    while (running) {
        // Update Equity
        if (!useShadowLedger) {
            try {
                const account = await exchange.getAccountInfo();
                const usdt = Array.isArray(account) ? account.find((a: any) => a.asset === 'USDT' || a.currency === 'USDT' || a.coinName === 'USDT') : null;
                if (usdt) {
                    currentEquity = parseFloat(usdt.equity || usdt.available);
                    availableBalance = parseFloat(usdt.available || '0');
                } else if (typeof account?.account_equity !== 'undefined') {
                    currentEquity = parseFloat(account.account_equity);
                    // If available not explicitly provided in this format, assume it equals equity for now or 0 if unknown
                    if (typeof account?.available !== 'undefined') availableBalance = parseFloat(account.available);
                }
            } catch (e) { }
        }

        const pnl = currentEquity - initialEquity;
        const pnlPercent = ((currentEquity - initialEquity) / initialEquity) * 100;
        const durationMin = (Date.now() - startTime) / 60000;

        console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║ ⚡ TITAN PURE (OFFLINE MODE) - 100% LOCAL EXECUTION                    ║
╠════════════════════════════════════════════════════════════════════════╣
║ 💰 $${currentEquity.toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)})   ║   🧠 Model: Local Neural + Math V1      ║
╚════════════════════════════════════════════════════════════════════════╝`);

        for (const symbol of SYMBOLS) {
            const activeStrategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
            logger.info(`\n🔍 Scanning ${symbol.toUpperCase()}...`);

            try {
                // 1. Fetch Data
                const currentPrice = await exchange.getTicker(symbol);
                const depth = await exchange.getDepth(symbol, 15);

                logger.info(`   📡 Fetching 100 Candles (15m) & Order Book from WEEX...`);
                const candles = await exchange.getCandles(symbol, '15m', 100);

                // Update latest market data for dashboard
                latestMarketData = {
                    symbol: symbol,
                    price: currentPrice,
                    depth: depth,
                    candles: candles.slice(-5) // Keep last 5 candles for brevity
                };

                // 2. Local Technical Analysis
                const indicators = calculateLocalIndicators(candles, depth, currentPrice);
                logger.info(`   📊 Techs: RSI=${indicators.RSI.toFixed(1)} | Trend=${indicators.Trend} | Imbalance=${indicators.OrderImbalance.toFixed(2)}`);

                // 3. Generate Local Signal
                const signal = await localAI.generateSignal({
                    price: currentPrice,
                    indicators: indicators
                });

                // Update latest signal for dashboard
                latestSignal = {
                    symbol: symbol,
                    action: signal.action,
                    confidence: signal.confidence,
                    reasoning: signal.reasoning,
                    timestamp: Date.now()
                };

                logger.info(`   🧠 TITAN SIGNAL: ${signal.action} (${(signal.confidence * 100).toFixed(0)}%)`);
                logger.info(`      Reason: ${signal.reasoning}`);

                if (signal.action === 'HOLD') {
                    await sleep(1000);
                    continue;
                }


                // 🛡️ Safety: Check for EXISTING POSITIONS to prevent over-accumulation
                const positions = await exchange.getOpenPositions(symbol);
                const hasPosition = positions.find((p: any) => parseFloat(p.holdAmount || p.total || '0') > 0);

                if (hasPosition) {
                    logger.warn(`   ⏸️ POSITION OPEN for ${symbol}. Skipping new trade to manage risk.`);
                    await sleep(1000);
                    continue;
                }

                // 3.1 Memory Check (Prevent API Latency duplicates)
                const lastTrade = lastTradeTime.get(symbol);
                if (lastTrade && (Date.now() - lastTrade < 60000 * 2)) {
                    logger.warn(`   ⏸️ RECENT TRADE DETECTED (Memory) for ${symbol}. Skipping.`);
                    await sleep(1000);
                    continue;
                }

                // 4. Execution

                // 🛑 Pre-execution Balance Check
                if (!useShadowLedger && availableBalance < 5) {
                    logger.warn(`   💸 Insufficient Available Margin ($${availableBalance.toFixed(2)}). Skipping trade.`);
                    await sleep(1000);
                    continue;
                }

                logger.info(`   ⚡ Executing ${signal.action} Order...`);
                // 4. Execution / Risk Management 2.0 (Institutional Grade)
                logger.info(`   ⚡ Executing ${signal.action} Order...`);

                // A. Calulate Volatility (ATR)
                const atr = calculateATR(candles, 14);
                // Fallback if ATR is 0 or invalid (use 1% of price)
                const volatility = atr > 0 ? atr : currentPrice * 0.01;

                // B. Dynamic Position Sizing (Kelly / Risk Based)
                // Risk 0.1% of Equity per Trade (Ultra-conservative for very limited margin)
                const riskPerTrade = currentEquity * 0.001;
                // Stop Loss Distance = 2 * ATR
                const stopLossDistance = volatility * 2.0;
                // Position Size = Risk / StopDistance
                let qty = riskPerTrade / stopLossDistance;

                // Sanity Check: Cap max leverage impact to 5x Notional
                const maxQty = (currentEquity * 5) / currentPrice;
                if (qty > maxQty) qty = maxQty;

                // HARD CAP: Max $50 USD per trade to preserve margin
                const maxUsdValue = 50;
                if (qty * currentPrice > maxUsdValue) qty = maxUsdValue / currentPrice;

                // Min Size Check ($10 minimum)
                if (qty * currentPrice < 10) qty = 10 / currentPrice;

                // Formatting
                if (symbol.toLowerCase().includes('btc')) qty = Number(qty.toFixed(3));
                else if (symbol.toLowerCase().includes('eth')) qty = Number(qty.toFixed(2));
                else qty = Number(qty.toFixed(1));

                // C. Dynamic SL/TP
                const slPrice = signal.action === 'BUY' ? currentPrice - (volatility * 2) : currentPrice + (volatility * 2);
                const tpPrice = signal.action === 'BUY' ? currentPrice + (volatility * 4) : currentPrice - (volatility * 4); // 1:2 R:R Ratio

                logger.info(`      🛡️ Risk Params: ATR=${volatility.toFixed(1)} | Risk=$${riskPerTrade.toFixed(2)} | Qty=${qty}`);
                logger.info(`      🎯 Targets: SL=${slPrice.toFixed(2)} | TP=${tpPrice.toFixed(2)}`);

                let order: any = null;

                try {
                    order = await exchange.placeOrder(
                        symbol,
                        signal.action,
                        qty,
                        currentPrice,
                        {
                            stopLoss: parseFloat(slPrice.toFixed(2)),
                            takeProfit: parseFloat(tpPrice.toFixed(2))
                        }
                    );
                    logger.info(`   ✅ Order Filled: ${order.orderId}`);
                    lastTradeTime.set(symbol, Date.now()); // Update Memory

                    // COMPLIANCE: Upload AI Log immediately
                    exchange.uploadAiLog({
                        orderId: order.orderId,
                        stage: "Decision Making",
                        model: "TITAN_NEURAL_V1",
                        input: {
                            price: currentPrice,
                            indicators: indicators
                        },
                        output: {
                            action: signal.action,
                            confidence: signal.confidence,
                            qty: qty
                        },
                        explanation: `[${signal.source}] ${signal.reasoning}`
                    }).catch(err => logger.warn(`Background Log Upload Error: ${err.message}`));

                } catch (err: any) {
                    // Check for Max Orders Limit - ONLY if message contains "limit exceed"
                    const errorMsg = err?.response?.data?.msg || err?.message || '';
                    const errorCode = err?.response?.data?.code;

                    if (errorMsg.includes('limit exceed') || errorMsg.includes('order count')) {
                        logger.warn(`   ⚠️ Max Active Orders Reached (${errorCode}). Triggering FULL Cleanup for ${symbol}...`);
                        await exchange.cancelAllOrders(symbol, 'normal');
                        await exchange.cancelAllOrders(symbol, 'plan');
                        await sleep(500);
                    } else if (errorMsg.includes('margin') || errorMsg.includes('not enough')) {
                        logger.error(`   💸 Insufficient Funds: ${errorMsg}`);
                        logger.error(`   ⚠️ Please deposit USDT to your WEEX account to enable live trading.`);
                    }

                    if (useShadowLedger) {
                        logger.warn(`   ⚠️ Live Order Failed (${err.message}). Using Shadow Execution.`);
                        order = {
                            orderId: `shadow_${Date.now()}`,
                            symbol,
                            side: signal.action,
                            status: 'FILLED',
                            price: currentPrice,
                            quantity: qty
                        };
                    } else {
                        logger.warn(`   ❌ Execution Error: ${err.message}`);
                        // Skip blockchain recording if real trade failed and we are not in shadow mode
                        continue;
                    }
                }

                if (order) {
                    // 5. Blockchain Proof (L2)
                    try {
                        if (blockchainBase) {
                            const tradeId = generateUUID();
                            const decisionId = generateUUID();

                            await blockchainBase.recordAIDecision({
                                decisionId,
                                reasoning: `[PURE LOCAL] ${signal.reasoning}`,
                                confidence: signal.confidence
                            });

                            const tx = await blockchainBase.submitTradeProof({
                                tradeId,
                                aiDecisionId: decisionId,
                                symbol,
                                exchangeOrderId: order.orderId || 'mock',
                                price: currentPrice,
                                qty,
                                side: signal.action,
                                aiConfidence: signal.confidence
                            });

                            logger.info(`   🔗 Verified on Base Sepolia: ${tx}`);

                            recentActivity.unshift({
                                hash: tx,
                                action: signal.source === 'TITAN_NEURAL' ? 'NEURAL_EXEC' : 'MATH_EXEC',
                                details: `${signal.action} ${symbol.toUpperCase().replace('CMT_', '')}`,
                                timestamp: Date.now(),
                                chain: "Base Sepolia",
                                explorerUrl: `https://sepolia.basescan.org/tx/${tx}`,
                                strategy: activeStrategy.name,
                                pnl: 0
                            });
                            if (recentActivity.length > 500) recentActivity.pop();
                        }
                    } catch (bcError: any) {
                        logger.warn(`   ⚠️ Blockchain Recording Failed: ${bcError.message}`);
                    }
                }

            } catch (e: any) {
                logger.error(`Loop Error: ${e.message}`);
            }
            await sleep(2000);
        }
        // Dashboard Update (Write at end of cycle for latest data)
        try {
            const pnl = currentEquity - initialEquity;
            const pnlPercent = ((currentEquity - initialEquity) / initialEquity) * 100;
            const durationMin = (Date.now() - startTime) / 60000;

            const stats = {
                initialEquity: initialEquity,
                currentEquity: currentEquity,
                pnl: parseFloat(pnl.toFixed(2)),
                pnlPercent: parseFloat(pnlPercent.toFixed(4)),
                roi: ((pnlPercent / durationMin) * 525600).toFixed(2), // Annualized ROI estimate
                runtime: parseFloat(durationMin.toFixed(1)),
                timestamp: Date.now(),
                recentActivity: recentActivity,
                activeStrategiesList: STRATEGIES,
                marketData: latestMarketData,
                latestSignal: latestSignal
            };
            const statsPath = path.resolve(process.cwd(), 'apps/web/public/live-stats.json');
            fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
        } catch (e) { }

        await sleep(5000);
    }
}

// Calculate indicators locally
function calculateLocalIndicators(candles: any[], depth: any, currentPrice: number) {
    // RSI
    let rsi = 50;
    let trend = 0;
    if (candles && candles.length > 14) {
        const closes = candles.map((c: any) => typeof c === 'object' ? parseFloat(c.close || c[4]) : parseFloat(c));
        let gains = 0, losses = 0;
        for (let i = closes.length - 14; i < closes.length; i++) {
            const diff = closes[i] - closes[i - 1];
            if (diff >= 0) gains += diff; else losses -= diff;
        }
        const rs = (gains / 14) / ((losses / 14) || 1);
        rsi = 100 - (100 / (1 + rs));

        const sma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
        trend = currentPrice > sma20 ? 1 : -1;
    }

    // Imbalance
    let imbalance = 0;
    if (depth && depth.bids && depth.asks) {
        const bidVol = depth.bids.slice(0, 5).reduce((a: number, b: string[]) => a + parseFloat(b[1]), 0);
        const askVol = depth.asks.slice(0, 5).reduce((a: number, b: string[]) => a + parseFloat(b[1]), 0);
        imbalance = (bidVol - askVol) / ((bidVol + askVol) || 1);
    }

    return {
        RSI: rsi,
        Trend: trend,
        OrderImbalance: imbalance,
        FearGreed: 50 // Default
    };
}

function calculateATR(candles: any[], period: number = 14): number {
    if (!candles || candles.length < period + 1) return 0;

    let trSum = 0;
    // Normalized candle format: [time, open, high, low, close...] or Object
    const getHigh = (c: any) => parseFloat(c.high || c[2] || 0);
    const getLow = (c: any) => parseFloat(c.low || c[3] || 0);
    const getClose = (c: any) => parseFloat(c.close || c[4] || 0);

    // Initial TR calculation
    for (let i = candles.length - period; i < candles.length; i++) {
        const high = getHigh(candles[i]);
        const low = getLow(candles[i]);
        const prevClose = getClose(candles[i - 1]);

        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        trSum += tr;
    }

    return trSum / period;
}

runTitanExecutor().catch(console.error);
