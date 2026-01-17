
import fs from 'fs';
import path from 'path';
import { TitanMemoryStore } from '../packages/engine-backtest/src/titan-memory-store.js';

const OLD_MEMORY_PATH = path.join(process.cwd(), 'data', 'titan_v5_memory.json');
const NEW_MEMORY_DIR = path.join(process.cwd(), 'data');

async function migrate() {
    console.log("🚀 Starting Memory Migration (Legacy JSON -> Vector Store)...");

    if (!fs.existsSync(OLD_MEMORY_PATH)) {
        console.error("❌ No legacy memory file found at:", OLD_MEMORY_PATH);
        return;
    }

    const rawData = fs.readFileSync(OLD_MEMORY_PATH, 'utf-8');
    let oldTrades = [];
    try {
        oldTrades = JSON.parse(rawData);
    } catch (e) {
        console.error("❌ Invalid JSON in legacy memory:", e);
        return;
    }

    console.log(`📦 Found ${oldTrades.length} legacy trades to migrate.`);

    const vectorStore = new TitanMemoryStore(NEW_MEMORY_DIR);
    await vectorStore.init();

    let count = 0;
    for (const trade of oldTrades) {
        if (!trade.marketConditions) continue;

        // Skip pending/invalid
        if (!trade.outcome || trade.outcome === 'PENDING') continue;

        // Construct Vector [RSI, ADX, Trend, OFI]
        // Trend: Bullish=1, Bearish=-1, Neutral=0
        let trendVal = 0;
        const t = trade.marketConditions.trend?.toUpperCase() || 'NEUTRAL';
        if (t.includes('BULL')) trendVal = 1;
        if (t.includes('BEAR')) trendVal = -1;

        const vector = [
            (trade.marketConditions.rsi || 50) / 100,
            (trade.marketConditions.adx || 20) / 100,
            trendVal,
            0 // Legacy trades didn't store OFI explicitly in struct, default to 0
        ];

        // Format metadata for new store
        const metadata = {
            timestamp: trade.timestamp || Date.now(),
            symbol: trade.symbol,
            action: trade.action,
            outcome: trade.outcome,
            pnl: trade.pnl || 0,
            context: trade.reasoning || "Legacy Migration"
        };

        // Inject
        await vectorStore.remember(vector, metadata);
        process.stdout.write('.');
        count++;
    }

    // ----------------------------------------------------------------
    // PART 2: MIGRATE GOLDEN DATASET (Curated Lessons)
    // ----------------------------------------------------------------
    const GOLDEN_PATH = path.join(process.cwd(), 'packages/neural/few_shot_patterns_v2.json');
    if (fs.existsSync(GOLDEN_PATH)) {
        console.log(`\n📦 Importing Golden Dataset from ${GOLDEN_PATH}...`);
        try {
            const goldenData = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf-8'));
            let goldenCount = 0;

            for (const item of goldenData) {
                // Parse "input" string: "RSI=35.0, Trend=BULLISH, ADX=45, OFI=0.25"
                const inputStr = item.input || "";

                // Defaults
                let rsi = 50;
                let adx = 20;
                let trendVal = 0;
                let ofi = 0;

                // Regex Extraction
                const rsiMatch = inputStr.match(/RSI=([\d\.]+)/);
                if (rsiMatch) rsi = parseFloat(rsiMatch[1]);

                const adxMatch = inputStr.match(/ADX=([\d\.]+)/);
                if (adxMatch) adx = parseFloat(adxMatch[1]);

                const ofiMatch = inputStr.match(/OFI=([-\d\.]+)/);
                if (ofiMatch) ofi = parseFloat(ofiMatch[1]);

                if (inputStr.includes('BULLISH')) trendVal = 1;
                else if (inputStr.includes('BEARISH')) trendVal = -1;

                const vector = [
                    rsi / 100,
                    adx / 100,
                    trendVal,
                    ofi // Normalized roughly -1 to 1 usually, assuming raw is fine for now or saturate
                ];

                const isWin = item.type === 'POSITIVE';
                const action = item.action || item.bad_action || 'HOLD';
                const outcome = isWin ? 'WIN' : 'LOSS';

                const metadata = {
                    timestamp: Date.now(), // No date in golden set, assume eternal wisdom
                    symbol: 'UNIVERSAL',   // Apply to all
                    action: action as any,
                    outcome: outcome as any,
                    pnl: 0,
                    context: item.lesson || "Golden Rule"
                };

                await vectorStore.remember(vector, metadata);
                process.stdout.write('+');
                goldenCount++;
            }
            console.log(`\n✨ Injected ${goldenCount} Golden Lessons into Memory.`);
            count += goldenCount;

        } catch (e) {
            console.error("❌ Failed to import Golden Dataset:", e);
        }
    }

    console.log(`\n✅ Migration Complete! Total ${count} memories vectorized.`);
}

migrate().catch(console.error);
