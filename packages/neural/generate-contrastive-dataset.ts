/**
 * CONTRASTIVE LEARNING DATASET GENERATOR
 * Analyzes winning and losing trades to create a balanced training set.
 * Learns from BOTH successes and failures.
 */

import * as fs from 'fs';

interface Trade {
    timestamp: string;
    action: 'BUY' | 'SELL';
    symbol: string;
    price: number;
    confidence: number;
    reasoning: string;
    model: string;
}

interface LabeledExample {
    input: {
        rsi: number;
        trend: string;
        ofi: number;
        price: number;
        symbol: string;
    };
    output: {
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
    };
    outcome: 'WIN' | 'LOSS' | 'NEUTRAL';
    profit_delta: number;
    reasoning: string;
}

import * as path from 'path';

// Project root from current working directory
const projectRoot = process.cwd();

// Load trade history
const tradeLogPath = path.join(projectRoot, 'packages/engine-backtest/trade_history_permanent.jsonl');
const tradeLog = fs.readFileSync(tradeLogPath, 'utf-8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => JSON.parse(l)) as Trade[];

console.log(`📊 Loaded ${tradeLog.length} trades for analysis`);

// Group trades by symbol and analyze price movement
const priceHistory: Record<string, { timestamp: string; price: number; action: string }[]> = {};

for (const trade of tradeLog) {
    const sym = trade.symbol.toLowerCase();
    if (!priceHistory[sym]) priceHistory[sym] = [];
    priceHistory[sym].push({
        timestamp: trade.timestamp,
        price: trade.price,
        action: trade.action
    });
}

// Analyze each trade to determine if it was a WIN or LOSS
const labeledExamples: LabeledExample[] = [];

for (let i = 0; i < tradeLog.length - 1; i++) {
    const trade = tradeLog[i];
    const sym = trade.symbol.toLowerCase();
    const trades = priceHistory[sym];
    const tradeIndex = trades.findIndex(t => t.timestamp === trade.timestamp);

    // Look at next trade on same symbol to estimate profit
    const nextTradeOnSymbol = trades[tradeIndex + 1];
    if (!nextTradeOnSymbol) continue;

    const priceDelta = nextTradeOnSymbol.price - trade.price;
    const percentChange = (priceDelta / trade.price) * 100;

    // Determine outcome
    let outcome: 'WIN' | 'LOSS' | 'NEUTRAL' = 'NEUTRAL';
    if (trade.action === 'BUY') {
        if (percentChange > 0.1) outcome = 'WIN';
        else if (percentChange < -0.1) outcome = 'LOSS';
    } else if (trade.action === 'SELL') {
        if (percentChange < -0.1) outcome = 'WIN';
        else if (percentChange > 0.1) outcome = 'LOSS';
    }

    // Extract RSI if mentioned in reasoning
    let rsi = 50;
    const rsiMatch = trade.reasoning.match(/RSI[:\s]*(\d+\.?\d*)/i);
    if (rsiMatch) rsi = parseFloat(rsiMatch[1]);

    // Extract OFI if mentioned
    let ofi = 0;
    const ofiMatch = trade.reasoning.match(/OFI[:\s]*([-]?\d+\.?\d*)/i);
    if (ofiMatch) ofi = parseFloat(ofiMatch[1]);

    // Determine trend from reasoning
    let trend = 'NEUTRAL';
    if (trade.reasoning.toLowerCase().includes('bullish')) trend = 'BULLISH';
    else if (trade.reasoning.toLowerCase().includes('bearish')) trend = 'BEARISH';

    labeledExamples.push({
        input: {
            rsi,
            trend,
            ofi,
            price: trade.price,
            symbol: trade.symbol
        },
        output: {
            action: trade.action,
            confidence: trade.confidence
        },
        outcome,
        profit_delta: percentChange,
        reasoning: trade.reasoning
    });
}

// Separate into WIN and LOSS categories
const wins = labeledExamples.filter(e => e.outcome === 'WIN');
const losses = labeledExamples.filter(e => e.outcome === 'LOSS');
const neutrals = labeledExamples.filter(e => e.outcome === 'NEUTRAL');

console.log(`\n📈 Analysis Results:`);
console.log(`   ✅ Winning trades: ${wins.length}`);
console.log(`   ❌ Losing trades: ${losses.length}`);
console.log(`   ⏸️  Neutral trades: ${neutrals.length}`);
console.log(`   📊 Win Rate: ${((wins.length / (wins.length + losses.length)) * 100).toFixed(1)}%`);

// Generate CONTRASTIVE PATTERNS
console.log(`\n🧠 Generating Contrastive Learning Patterns...`);

// Find patterns in WINS
const winPatterns: any[] = [];
const avgWinRSI = wins.reduce((s, w) => s + w.input.rsi, 0) / wins.length || 50;
const avgWinOFI = wins.reduce((s, w) => s + w.input.ofi, 0) / wins.length || 0;
const winBuyCount = wins.filter(w => w.output.action === 'BUY').length;
const winSellCount = wins.filter(w => w.output.action === 'SELL').length;

console.log(`\n✅ WINNING PATTERNS:`);
console.log(`   Avg RSI: ${avgWinRSI.toFixed(1)}`);
console.log(`   Avg OFI: ${avgWinOFI.toFixed(2)}`);
console.log(`   BUY wins: ${winBuyCount}, SELL wins: ${winSellCount}`);

// Find patterns in LOSSES
const avgLossRSI = losses.reduce((s, w) => s + w.input.rsi, 0) / losses.length || 50;
const avgLossOFI = losses.reduce((s, w) => s + w.input.ofi, 0) / losses.length || 0;
const lossBuyCount = losses.filter(w => w.output.action === 'BUY').length;
const lossSellCount = losses.filter(w => w.output.action === 'SELL').length;

console.log(`\n❌ LOSING PATTERNS (AVOID THESE):`);
console.log(`   Avg RSI: ${avgLossRSI.toFixed(1)}`);
console.log(`   Avg OFI: ${avgLossOFI.toFixed(2)}`);
console.log(`   BUY losses: ${lossBuyCount}, SELL losses: ${lossSellCount}`);

// Generate training data with POSITIVE and NEGATIVE examples
const trainingData = {
    metadata: {
        generated_at: new Date().toISOString(),
        total_trades: tradeLog.length,
        wins: wins.length,
        losses: losses.length,
        win_rate: (wins.length / (wins.length + losses.length)) * 100
    },
    positive_examples: wins.slice(0, 25).map(w => ({
        input: w.input,
        expected_output: w.output,
        label: 'GOOD_TRADE',
        profit_delta: w.profit_delta
    })),
    negative_examples: losses.slice(0, 25).map(l => ({
        input: l.input,
        expected_output: { action: 'HOLD', confidence: 0.3 }, // Should have been HOLD
        label: 'BAD_TRADE_AVOID',
        actual_bad_action: l.output,
        loss_delta: l.profit_delta
    })),
    optimal_thresholds: {
        rsi_buy_zone: avgWinRSI < 50 ? { min: avgWinRSI - 5, max: avgWinRSI + 10 } : { min: 35, max: 46 },
        rsi_sell_zone: avgWinRSI > 50 ? { min: avgWinRSI - 5, max: avgWinRSI + 10 } : { min: 59, max: 75 },
        ofi_buy_threshold: avgWinOFI > 0 ? avgWinOFI * 0.8 : 0.15,
        ofi_sell_threshold: avgWinOFI < 0 ? avgWinOFI * 0.8 : -0.15,
        avoid_patterns: [
            { description: 'BUY in strong BEARISH with OFI < -0.2', action: 'HOLD' },
            { description: 'SELL in strong BULLISH with OFI > 0.2', action: 'HOLD' },
            { description: 'Trade with confidence < 0.5', action: 'HOLD' }
        ]
    }
};

// Save training data
fs.writeFileSync(
    path.join(projectRoot, 'packages/neural/contrastive_training_data.json'),
    JSON.stringify(trainingData, null, 2)
);

console.log(`\n✅ Contrastive training data saved to packages/neural/contrastive_training_data.json`);

// Also generate few-shot patterns for the inference engine
const fewShotPatterns = [
    // TOP 5 WINNING PATTERNS
    ...wins.slice(0, 5).map((w, i) => ({
        id: `WIN_${i + 1}`,
        type: 'POSITIVE',
        input: `RSI=${w.input.rsi.toFixed(1)}, Trend=${w.input.trend}, OFI=${w.input.ofi.toFixed(2)}`,
        action: w.output.action,
        confidence: w.output.confidence,
        profit: `+${w.profit_delta.toFixed(2)}%`,
        lesson: `When RSI=${w.input.rsi.toFixed(0)} in ${w.input.trend} trend with OFI=${w.input.ofi.toFixed(2)}, ${w.output.action} worked well.`
    })),
    // TOP 5 LOSING PATTERNS (AVOID)
    ...losses.slice(0, 5).map((l, i) => ({
        id: `LOSS_${i + 1}`,
        type: 'NEGATIVE',
        input: `RSI=${l.input.rsi.toFixed(1)}, Trend=${l.input.trend}, OFI=${l.input.ofi.toFixed(2)}`,
        bad_action: l.output.action,
        confidence: l.output.confidence,
        loss: `${l.profit_delta.toFixed(2)}%`,
        lesson: `AVOID ${l.output.action} when RSI=${l.input.rsi.toFixed(0)} in ${l.input.trend} trend. Should have been HOLD.`
    }))
];

fs.writeFileSync(
    path.join(projectRoot, 'packages/neural/few_shot_patterns_v2.json'),
    JSON.stringify(fewShotPatterns, null, 2)
);

console.log(`✅ Few-shot patterns saved to packages/neural/few_shot_patterns_v2.json`);

// Summary
console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  🧠 CONTRASTIVE LEARNING COMPLETE                                 ║
╠═══════════════════════════════════════════════════════════════════╣
║  📊 Analyzed: ${tradeLog.length.toString().padStart(4)} trades                                      ║
║  ✅ Winners:  ${wins.length.toString().padStart(4)} (learn to replicate)                         ║
║  ❌ Losers:   ${losses.length.toString().padStart(4)} (learn to avoid)                            ║
║  📈 Win Rate: ${((wins.length / (wins.length + losses.length)) * 100).toFixed(1).padStart(5)}%                                          ║
╠═══════════════════════════════════════════════════════════════════╣
║  Generated Files:                                                  ║
║  • packages/neural/contrastive_training_data.json                 ║
║  • packages/neural/few_shot_patterns_v2.json                      ║
╚═══════════════════════════════════════════════════════════════════╝
`);
