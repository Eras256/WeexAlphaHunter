/**
 * GOLDEN DATASET GENERATOR
 * 
 * Este script analiza los logs de IA y extrae los casos de "alta calidad"
 * para re-entrenar la red neuronal local (Titan Neural Engine).
 * 
 * Criterios de "Caso Dorado":
 * 1. Consenso >= 70%
 * 2. Confianza >= 0.65
 * 3. Razonamiento coherente (no fallback de emergencia puro)
 * 
 * Output: golden_training_data.json
 */

import * as fs from 'fs';
import * as path from 'path';

interface AILog {
    orderId: string;
    stage: string;
    model: string;
    input: {
        symbol: string;
        price: number;
        technical_indicators: {
            RSI: number;
            Trend: string;
        };
        timestamp: number;
    };
    output: {
        action: string;
        confidence: number;
        consensusScore?: number;
        reasoning: string;
        modelUsed: string;
        proofHash: string;
    };
    explanation: string;
}

interface TrainingExample {
    input: {
        rsi: number;
        trend: number; // 1 = BULLISH, -1 = BEARISH, 0 = NEUTRAL
        price: number;
        symbol: string;
    };
    output: {
        action: number; // 1 = BUY, -1 = SELL, 0 = HOLD
        confidence: number;
    };
    quality: 'GOLD' | 'SILVER' | 'BRONZE';
    reasoning: string;
}

function trendToNumber(trend: string): number {
    if (trend === 'BULLISH') return 1;
    if (trend === 'BEARISH') return -1;
    return 0;
}

function actionToNumber(action: string): number {
    if (action === 'BUY') return 1;
    if (action === 'SELL') return -1;
    return 0;
}

function main() {
    console.log('🧠 TITAN GOLDEN DATASET GENERATOR');
    console.log('==================================\n');

    // Read AI logs - file is in project root
    const logsPath = path.join(process.cwd(), 'ai_logs_backup.jsonl');

    if (!fs.existsSync(logsPath)) {
        console.error('❌ ai_logs_backup.jsonl not found!');
        process.exit(1);
    }

    const rawData = fs.readFileSync(logsPath, 'utf-8');
    const lines = rawData.split('\n').filter(line => line.trim());

    console.log(`📂 Found ${lines.length} AI log entries\n`);

    const goldenExamples: TrainingExample[] = [];
    const silverExamples: TrainingExample[] = [];
    const bronzeExamples: TrainingExample[] = [];

    let stats = {
        total: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
        discarded: 0,
        byModel: {} as Record<string, number>,
        byAction: { BUY: 0, SELL: 0, HOLD: 0 },
        avgConfidence: 0,
        avgConsensus: 0
    };

    for (const line of lines) {
        try {
            const log: AILog = JSON.parse(line);
            stats.total++;

            // Track model usage
            stats.byModel[log.model] = (stats.byModel[log.model] || 0) + 1;

            // Extract features
            const rsi = log.input.technical_indicators?.RSI || 50;
            const trend = log.input.technical_indicators?.Trend || 'NEUTRAL';
            const action = log.output.action;
            const confidence = log.output.confidence || 0.5;
            const consensusScore = log.output.consensusScore || 50;

            stats.byAction[action as keyof typeof stats.byAction]++;
            stats.avgConfidence += confidence;
            stats.avgConsensus += consensusScore;

            // Create training example
            const example: TrainingExample = {
                input: {
                    rsi,
                    trend: trendToNumber(trend),
                    price: log.input.price,
                    symbol: log.input.symbol
                },
                output: {
                    action: actionToNumber(action),
                    confidence
                },
                quality: 'BRONZE',
                reasoning: log.output.reasoning
            };

            // Classify quality
            // GOLD: High consensus (>=70) + High confidence (>=0.7) + Not emergency fallback
            if (consensusScore >= 70 && confidence >= 0.7 && !log.model.includes('Emergency') && !log.model.includes('Solo')) {
                example.quality = 'GOLD';
                goldenExamples.push(example);
                stats.gold++;
            }
            // SILVER: Medium consensus (>=60) OR High confidence (>=0.65)
            else if ((consensusScore >= 60 || confidence >= 0.65) && action !== 'HOLD') {
                example.quality = 'SILVER';
                silverExamples.push(example);
                stats.silver++;
            }
            // BRONZE: Everything else that resulted in a trade
            else if (action !== 'HOLD') {
                bronzeExamples.push(example);
                stats.bronze++;
            }
            else {
                stats.discarded++;
            }

        } catch (e) {
            // Skip malformed lines
        }
    }

    stats.avgConfidence /= stats.total;
    stats.avgConsensus /= stats.total;

    // Print Statistics
    console.log('📊 ANALYSIS RESULTS');
    console.log('-------------------');
    console.log(`Total Entries: ${stats.total}`);
    console.log(`  🥇 GOLD Quality:   ${stats.gold} (${(stats.gold / stats.total * 100).toFixed(1)}%)`);
    console.log(`  🥈 SILVER Quality: ${stats.silver} (${(stats.silver / stats.total * 100).toFixed(1)}%)`);
    console.log(`  🥉 BRONZE Quality: ${stats.bronze} (${(stats.bronze / stats.total * 100).toFixed(1)}%)`);
    console.log(`  ❌ Discarded:      ${stats.discarded}`);
    console.log();
    console.log(`Actions: BUY=${stats.byAction.BUY} | SELL=${stats.byAction.SELL} | HOLD=${stats.byAction.HOLD}`);
    console.log(`Avg Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
    console.log(`Avg Consensus:  ${stats.avgConsensus.toFixed(1)}%`);
    console.log();
    console.log('Model Usage:');
    for (const [model, count] of Object.entries(stats.byModel)) {
        console.log(`  • ${model}: ${count}`);
    }

    // Find winning patterns
    console.log('\n🏆 WINNING PATTERNS DETECTED');
    console.log('----------------------------');

    // Pattern 1: Sniper SELL (RSI > 70 + BEARISH)
    const sniperSells = goldenExamples.filter(e =>
        e.input.rsi > 70 && e.input.trend === -1 && e.output.action === -1
    );
    console.log(`Sniper SELL (RSI>70 + BEARISH): ${sniperSells.length} examples`);

    // Pattern 2: Deep Value BUY (RSI < 35 + BULLISH)
    const deepValueBuys = goldenExamples.filter(e =>
        e.input.rsi < 35 && e.input.trend === 1 && e.output.action === 1
    );
    console.log(`Deep Value BUY (RSI<35 + BULLISH): ${deepValueBuys.length} examples`);

    // Pattern 3: Momentum BUY (RSI 40-55 + BULLISH + High Confidence)
    const momentumBuys = goldenExamples.filter(e =>
        e.input.rsi >= 40 && e.input.rsi <= 55 && e.input.trend === 1 && e.output.action === 1
    );
    console.log(`Momentum BUY (RSI 40-55 + BULLISH): ${momentumBuys.length} examples`);

    // Save datasets
    const outputDir = path.join(process.cwd(), 'training_data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Combined Golden Dataset (Gold + Silver)
    const goldenDataset = {
        generated: new Date().toISOString(),
        stats: {
            goldExamples: goldenExamples.length,
            silverExamples: silverExamples.length,
            totalTrainingExamples: goldenExamples.length + silverExamples.length
        },
        patterns: {
            sniperSell: sniperSells.length,
            deepValueBuy: deepValueBuys.length,
            momentumBuy: momentumBuys.length
        },
        examples: [...goldenExamples, ...silverExamples]
    };

    fs.writeFileSync(
        path.join(outputDir, 'golden_training_data.json'),
        JSON.stringify(goldenDataset, null, 2)
    );

    console.log(`\n✅ Saved ${goldenDataset.examples.length} training examples to training_data/golden_training_data.json`);

    // Generate recommended threshold updates
    console.log('\n🔧 RECOMMENDED THRESHOLD UPDATES');
    console.log('---------------------------------');

    // Analyze RSI thresholds from winning trades
    const winningBuyRSIs = goldenExamples.filter(e => e.output.action === 1).map(e => e.input.rsi);
    const winningSellRSIs = goldenExamples.filter(e => e.output.action === -1).map(e => e.input.rsi);

    if (winningBuyRSIs.length > 0) {
        const avgBuyRSI = winningBuyRSIs.reduce((a, b) => a + b, 0) / winningBuyRSIs.length;
        const minBuyRSI = Math.min(...winningBuyRSIs);
        console.log(`Winning BUY signals: Avg RSI = ${avgBuyRSI.toFixed(1)}, Min RSI = ${minBuyRSI.toFixed(1)}`);
        console.log(`  → Consider: BUY threshold RSI < ${Math.ceil(avgBuyRSI)}`);
    }

    if (winningSellRSIs.length > 0) {
        const avgSellRSI = winningSellRSIs.reduce((a, b) => a + b, 0) / winningSellRSIs.length;
        const maxSellRSI = Math.max(...winningSellRSIs);
        console.log(`Winning SELL signals: Avg RSI = ${avgSellRSI.toFixed(1)}, Max RSI = ${maxSellRSI.toFixed(1)}`);
        console.log(`  → Consider: SELL threshold RSI > ${Math.floor(avgSellRSI)}`);
    }

    console.log('\n🎓 To retrain the neural network, run:');
    console.log('   pnpm train:brain');
}

main();
