
import * as fs from 'fs';
import * as path from 'path';

// Source: V5 Memory (Decisions + Outcomes)
const INPUT_FILE = './data/titan_v5_memory.json';
// Destino: Dataset de "Corrección" (Aprendizaje Contrastivo)
const OUTPUT_FILE = './packages/neural/data/gold_dataset_v5_correction.jsonl';

interface TradeMemory {
    id: string;
    timestamp: number;
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    entryPrice: number;
    marketConditions: {
        trend: string;
        volatility: number;
        adx: number;
        rsi: number;
    };
    outcome: 'WIN' | 'LOSS' | 'PENDING';
    pnl?: number;
    reasoning: string;
}

async function extractCorrections() {
    console.log("🦅 TITAN V5: Iniciando generación de Dataset Correctivo...");

    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ Error: No se encontró el archivo de memoria: ${INPUT_FILE}`);
        return;
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const trades: TradeMemory[] = JSON.parse(rawData);

    // Filter for CONFIRMED LOSSES
    const losers = trades.filter(t => t.outcome === 'LOSS');

    console.log(`📊 Análisis de Fallos:`);
    console.log(`   - Total recuerdos: ${trades.length}`);
    console.log(`   - Errores identificados (LOSS): ${losers.length}`);

    if (losers.length === 0) {
        console.log("✅ No hay errores reportados. Nada que corregir.");
        return;
    }

    // Generate Corrections (Invert Logic)
    const correctionData = losers.map(trade => {
        const rsi = Math.round(trade.marketConditions.rsi);
        const adx = Math.round(trade.marketConditions.adx);
        const volatility = trade.marketConditions.volatility.toFixed(2);

        // LOGIC INVERSION (Simple Heuristic for now)
        // If BUY failed -> The better action was likely HOLD (Safety) or SELL (Reversal)
        // For a safety-first correction, we suggest HOLD when conditions are choppy/bad.
        const correctedAction = 'HOLD';
        const reflection = `Correction: Previous BUY action failed (Loss: ${trade.pnl?.toFixed(2)}%). Market conditions (RSI=${rsi}, ADX=${adx}) were deceptive. Better to stay CASH.`;

        return {
            // Context: The exact situation where it failed
            prompt: `Market Analysis: Symbol=${trade.symbol}, Trend=${trade.marketConditions.trend}, RSI=${rsi}, ADX=${adx}, Volatility=${volatility}. Action?`,

            // Correction: The SAFE action to take instead
            completion: `Action: ${correctedAction}. Reasoning: ${reflection}`
        };
    });

    // Save Dataset
    const jsonlContent = correctionData.map(item => JSON.stringify(item)).join('\n');

    const outDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, jsonlContent);

    console.log(`\n✨ ÉXITO: Se ha generado el dataset CORRECTIVO ${OUTPUT_FILE}`);
    console.log(`📝 Contiene ${correctionData.length} lecciones aprendidas de errores pasados.`);
    console.log(`🧠 Entrenar con esto reducirá la tasa de fallos futuros.`);
}

extractCorrections();
