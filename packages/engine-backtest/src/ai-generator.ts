import { generateUUID, hashDecision, logger, sleep, createGeminiClient } from "@wah/core";
import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

interface MarketData {
    timestamp: string;
    price: number;
    volume: number;
    rsi?: number;
    macd?: number;
    volatility?: number;
}

/**
 * Generate realistic market data for simulation
 */
function generateMarketData(timestamp: Date): MarketData {
    const basePrice = 90000 + Math.random() * 10000; // BTC between 90k-100k
    const volume = 1000000000 + Math.random() * 500000000;

    return {
        timestamp: timestamp.toISOString(),
        price: basePrice,
        volume: volume,
        rsi: 30 + Math.random() * 40, // RSI between 30-70
        macd: -0.5 + Math.random() * 1.0, // MACD between -0.5 and 0.5
        volatility: 0.5 + Math.random() * 1.5 // Volatility 0.5-2.0
    };
}

async function generateDecisions() {
    const argv = await yargs(hideBin(process.argv))
        .option('runId', { type: 'string', demandOption: true })
        .option('count', { type: 'number', default: 50, description: 'Number of decisions to generate' })
        .option('useAI', { type: 'boolean', default: true, description: 'Use real Gemini AI (true) or mock data (false)' })
        .parse();

    const runId = argv.runId;
    const useAI = argv.useAI;
    const targetCount = argv.count;

    logger.info(`Starting AI Decision Generator for RunID: ${runId}`);
    logger.info(`Mode: ${useAI ? 'REAL GEMINI AI' : 'MOCK DATA'}`);
    logger.info(`Target decisions: ${targetCount}`);

    // Initialize Gemini client
    const gemini = createGeminiClient();

    if (useAI && !gemini.isConfigured()) {
        logger.warn('GEMINI_API_KEY not configured. Falling back to mock mode.');
    }

    const decisions = [];
    const startTime = new Date("2025-01-01T00:00:00Z").getTime();
    const endTime = new Date("2025-12-01T00:00:00Z").getTime();
    const interval = (endTime - startTime) / targetCount;

    let currentTime = startTime;
    let processedCount = 0;

    while (processedCount < targetCount) {
        const timestamp = new Date(currentTime);
        const marketData = generateMarketData(timestamp);

        try {
            let action: 'BUY' | 'SELL' | 'HOLD';
            let confidence: number;
            let reasoning: string;

            if (useAI && gemini.isConfigured()) {
                // Use real Gemini AI
                logger.info(`[${processedCount + 1}/${targetCount}] Generating AI signal for ${timestamp.toISOString()}...`);

                const signal = await gemini.generateTradingSignal({
                    symbol: 'BTC/USDT',
                    price: marketData.price,
                    volume: marketData.volume,
                    indicators: {
                        rsi: marketData.rsi || 50,
                        macd: marketData.macd || 0,
                        volatility: marketData.volatility || 1.0
                    }
                });

                action = signal.action;
                confidence = signal.confidence;
                reasoning = `[GEMINI AI] ${signal.reasoning}`;

                logger.info(`  → Action: ${action}, Confidence: ${(confidence * 100).toFixed(1)}%`);

                // Rate limiting: wait 1 second between API calls
                await sleep(1000);

            } else {
                // Mock mode (for testing without API key)
                const actions: Array<'BUY' | 'SELL' | 'HOLD'> = ['BUY', 'SELL', 'HOLD'];
                action = actions[Math.floor(Math.random() * actions.length)];
                confidence = 0.75 + (Math.random() * 0.20);

                const mockReasons = [
                    "RSI Divergence detected on 1H timeframe",
                    "Volume spike consistent with breakout pattern",
                    "Macro sentiment analysis suggests trend continuation",
                    "Volatility contraction indicates impending move"
                ];
                reasoning = `[MOCK] ${mockReasons[Math.floor(Math.random() * mockReasons.length)]}`;
            }

            // Only record BUY/SELL decisions (skip HOLD)
            if (action !== 'HOLD') {
                const id = generateUUID();
                const proofHash = hashDecision(id, timestamp.toISOString(), action);

                decisions.push({
                    decisionId: id,
                    timestamp: timestamp.toISOString(),
                    symbol: "BTC/USDT",
                    action: action,
                    confidence: confidence,
                    reasoning: reasoning,
                    marketData: {
                        price: marketData.price,
                        volume: marketData.volume,
                        rsi: marketData.rsi,
                        macd: marketData.macd
                    },
                    proofHash: proofHash
                });
            }

        } catch (error: any) {
            logger.error(`Error generating decision: ${error.message}`);
            // Continue with next iteration
        }

        currentTime += interval;
        processedCount++;

        // Progress update every 10 decisions
        if (processedCount % 10 === 0) {
            logger.info(`Progress: ${processedCount}/${targetCount} decisions processed`);
        }
    }

    // Ensure output directory exists
    const outDir = path.join(process.cwd(), '../../data/logs');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Write to JSONL
    const outPath = path.join(outDir, `ai_decisions_${runId}.jsonl`);
    const stream = fs.createWriteStream(outPath);

    for (const decision of decisions) {
        stream.write(JSON.stringify(decision) + "\n");
    }
    stream.end();

    logger.info(`\n✅ Generated ${decisions.length} AI decisions`);
    logger.info(`📁 Log saved to: ${outPath}`);
    logger.info(`\nDecision breakdown:`);

    const buyCount = decisions.filter(d => d.action === 'BUY').length;
    const sellCount = decisions.filter(d => d.action === 'SELL').length;
    const avgConfidence = decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length;

    logger.info(`  - BUY signals: ${buyCount}`);
    logger.info(`  - SELL signals: ${sellCount}`);
    logger.info(`  - Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
}

generateDecisions().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
