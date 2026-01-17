
import * as fs from 'fs';
import * as path from 'path';

// Origen: Memoria Inteligente V5 (Decisión + Resultado)
const INPUT_FILE = './data/titan_v5_memory.json';
// Destino: Dataset de "Oro Puro" para el entrenamiento
const OUTPUT_FILE = './packages/neural/data/gold_dataset_v5_winners.jsonl';

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

async function extractWinners() {
    console.log("🦅 TITAN V5: Iniciando extracción de ADN Ganador...");

    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ Error: No se encontró el archivo de memoria: ${INPUT_FILE}`);
        return;
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const trades: TradeMemory[] = JSON.parse(rawData);

    // 1. Filtrar SOLO las victorias confirmadas
    const winners = trades.filter(t => t.outcome === 'WIN');
    const losers = trades.filter(t => t.outcome === 'LOSS');

    console.log(`📊 Análisis de Memoria:`);
    console.log(`   - Total recuerdos: ${trades.length}`);
    console.log(`   - Victorias (WIN): ${winners.length}`);
    console.log(`   - Derrotas (LOSS): ${losers.length} (Serán ignoradas)`);

    // 2. Formatear para entrenamiento (Prompt -> Completion)
    const trainingData = winners.map(trade => {
        // Redondear valores para estandarizar
        const rsi = Math.round(trade.marketConditions.rsi);
        const adx = Math.round(trade.marketConditions.adx);
        const volatility = trade.marketConditions.volatility.toFixed(2);

        return {
            // El Prompt simula lo que el bot "ve" antes de actuar
            prompt: `Market Analysis: Symbol=${trade.symbol}, Trend=${trade.marketConditions.trend}, RSI=${rsi}, ADX=${adx}, Volatility=${volatility}. Action?`,

            // La Completion es lo que QUEREMOS que haga (porque sabemos que ganó)
            completion: `Action: ${trade.action}. Reasoning: ${trade.reasoning}`
        };
    });

    // 3. Guardar Dataset
    const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');

    // Asegurar directorio destino
    const outDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, jsonlContent);

    console.log(`\n✨ ÉXITO: Se ha generado el dataset ${OUTPUT_FILE}`);
    console.log(`📝 Contiene ${trainingData.length} ejemplos de trading de alta calidad.`);

    if (trainingData.length < 10) {
        console.warn("⚠️ ADVERTENCIA: Pocos datos ganadores. El bot necesita operar más y ganar más para mejorar su entrenamiento.");
    }
}

extractWinners();
