
/**
 * TITAN NEURAL ENGINE - V5 CORRECTION TRAINER
 * 
 * Trains the neural network using the V5 Correction Dataset (Learning from Mistakes).
 * Adapts JSONL text-based format to Neural Input Vectors.
 */

import * as fs from 'fs';
import * as path from 'path';

interface TrainingExample {
    input: {
        rsi: number;
        trend: number; // 1=BULLISH, -1=BEARISH, 0=NEUTRAL
        price: number;
        symbol: string;
        adx: number;
        volatility: number;
    };
    output: {
        action: number; // 1 = BUY, -1 = SELL, 0 = HOLD
        confidence: number;
    };
    quality: 'GOLD' | 'SILVER' | 'BRONZE';
    reasoning: string;
}

interface ModelWeights {
    w1: number[][];
    w2: number[][];
    b1: number[];
    b2: number[];
}

// --- Neural Network Functions ---

function relu(x: number): number {
    return Math.max(0, x);
}

function softmax(arr: number[]): number[] {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
}

function matMul(inputs: number[], weights: number[][]): number[] {
    const output = new Array(weights[0].length).fill(0);
    for (let i = 0; i < inputs.length; i++) {
        for (let j = 0; j < weights[0].length; j++) {
            output[j] += inputs[i] * weights[i][j];
        }
    }
    return output;
}

function addBias(inputs: number[], bias: number[]): number[] {
    return inputs.map((val, i) => val + bias[i]);
}

function forwardPass(input: number[], weights: ModelWeights): number[] {
    // Hidden layer
    let h1 = matMul(input, weights.w1);
    h1 = addBias(h1, weights.b1);
    h1 = h1.map(relu);

    // Output layer
    let output = matMul(h1, weights.w2);
    output = addBias(output, weights.b2);
    return softmax(output); // [BUY, SELL, HOLD]
}

function actionToIndex(action: number): number {
    if (action === 1) return 0;  // BUY
    if (action === -1) return 1; // SELL
    return 2; // HOLD
}

function calculateLoss(prediction: number[], targetAction: number, confidence: number): number {
    const targetIdx = actionToIndex(targetAction);
    return -Math.log(Math.max(prediction[targetIdx], 0.001)) * confidence;
}

function evaluateModel(weights: ModelWeights, examples: TrainingExample[]): number {
    let totalLoss = 0;
    let correct = 0;

    for (const ex of examples) {
        const trendNorm = (ex.input.trend + 1) / 2;
        const input = [
            ex.input.rsi / 100,
            trendNorm,
            ex.input.adx / 100,
            Math.min(ex.input.volatility / 10, 1.0),
            0.5
        ];

        const prediction = forwardPass(input, weights);
        totalLoss += calculateLoss(prediction, ex.output.action, ex.output.confidence);

        const predictedIdx = prediction.indexOf(Math.max(...prediction));
        const targetIdx = actionToIndex(ex.output.action);
        if (predictedIdx === targetIdx) correct++;
    }

    return (1 - correct / examples.length) + (totalLoss / examples.length * 0.1);
}

function mutateWeights(weights: ModelWeights, rate: number): ModelWeights {
    const mutate = (arr: number[][]): number[][] => {
        return arr.map(row =>
            row.map(val => val + (Math.random() - 0.5) * rate)
        );
    };

    const mutateBias = (arr: number[]): number[] => {
        return arr.map(val => val + (Math.random() - 0.5) * rate);
    };

    return {
        w1: mutate(weights.w1),
        w2: mutate(weights.w2),
        b1: mutateBias(weights.b1),
        b2: mutateBias(weights.b2)
    };
}

function cloneWeights(weights: ModelWeights): ModelWeights {
    return {
        w1: weights.w1.map(row => [...row]),
        w2: weights.w2.map(row => [...row]),
        b1: [...weights.b1],
        b2: [...weights.b2]
    };
}

// --- PARSING HELPER ---

function parseGoldenDataset(filePath: string): TrainingExample[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const examples: TrainingExample[] = [];

    for (const line of lines) {
        try {
            const data = JSON.parse(line);
            const prompt = data.prompt;
            const completion = data.completion;

            const rsiMatch = prompt.match(/RSI=([\d\.]+)/);
            const adxMatch = prompt.match(/ADX=([\d\.]+)/);
            const trendMatch = prompt.match(/Trend=([A-Z]+)/);
            const volMatch = prompt.match(/Volatility=([\d\.]+)/);
            const symbolMatch = prompt.match(/Symbol=([a-z_]+)/);
            const actionMatch = completion.match(/Action: ([A-Z]+)/);

            if (rsiMatch && trendMatch && actionMatch) {
                let actionCode = 0;
                if (actionMatch[1] === 'BUY') actionCode = 1;
                else if (actionMatch[1] === 'SELL') actionCode = -1;
                else actionCode = 0; // HOLD

                let trendCode = 0;
                if (trendMatch[1] === 'BULLISH') trendCode = 1;
                else if (trendMatch[1] === 'BEARISH') trendCode = -1;

                examples.push({
                    input: {
                        rsi: parseFloat(rsiMatch[1]),
                        trend: trendCode,
                        price: 0,
                        symbol: symbolMatch ? symbolMatch[1] : 'unknown',
                        adx: adxMatch ? parseFloat(adxMatch[1]) : 0,
                        volatility: volMatch ? parseFloat(volMatch[1]) : 0
                    },
                    output: {
                        action: actionCode,
                        confidence: 0.8
                    },
                    quality: 'GOLD',
                    reasoning: completion
                });
            }
        } catch (e) {
            console.warn("Skipping bad line:", e);
        }
    }
    return examples;
}

// --- MAIN ---

async function main() {
    console.log('🧠 TITAN V5 CORRECTION TRAINER');
    console.log('==============================\n');

    const datasetPath = path.join(process.cwd(), 'packages/neural/data/gold_dataset_v5_correction.jsonl');
    if (!fs.existsSync(datasetPath)) {
        console.error('❌ Correction dataset not found!');
        process.exit(1);
    }

    const examples = parseGoldenDataset(datasetPath);
    console.log(`📂 Loaded ${examples.length} CORRECTION examples`);

    const modelPath = path.join(process.cwd(), 'data', 'models', 'titan-native.json');
    let weights: ModelWeights;

    if (fs.existsSync(modelPath)) {
        weights = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
        console.log('📦 Loaded existing model weights');
    } else {
        weights = {
            w1: Array(5).fill(0).map(() => Array(8).fill(0).map(() => (Math.random() - 0.5) * 1.0)),
            w2: Array(8).fill(0).map(() => Array(3).fill(0).map(() => (Math.random() - 0.5) * 1.0)),
            b1: new Array(8).fill(0.1),
            b2: new Array(3).fill(0.1)
        };
        console.log('🆕 Initialized new weights (Variance 1.0)');
    }

    // DEBUG: Show prediction for first example
    if (examples.length > 0) {
        const ex = examples[0];
        const trendNorm = (ex.input.trend + 1) / 2;
        const input = [ex.input.rsi / 100, trendNorm, ex.input.adx / 100, Math.min(ex.input.volatility / 10, 1.0), 0.5];
        const pred = forwardPass(input, weights);
        console.log(`\n🔍 DEBUG Before: Ex 1 Pred: [BUY: ${pred[0].toFixed(3)}, SELL: ${pred[1].toFixed(3)}, HOLD: ${pred[2].toFixed(3)}]`);
        console.log(`   Target Action: ${ex.output.action} (Index: ${actionToIndex(ex.output.action)})`);
    }

    let bestLoss = evaluateModel(weights, examples);
    console.log(`\n📊 Initial Loss (On Correction Set): ${bestLoss.toFixed(4)}`);

    const EPOCHS = 1000;
    const MUTATIONS_PER_EPOCH = 50;
    let bestWeights = cloneWeights(weights);
    let noImprovementCount = 0;
    let mutationRate = 0.5; // AGGRESSIVE START

    console.log('\n🏋️ Starting Correction Training...\n');

    for (let epoch = 0; epoch < EPOCHS; epoch++) {
        let improved = false;

        for (let m = 0; m < MUTATIONS_PER_EPOCH; m++) {
            const mutated = mutateWeights(bestWeights, mutationRate);
            const loss = evaluateModel(mutated, examples);

            if (loss < bestLoss) {
                bestLoss = loss;
                bestWeights = cloneWeights(mutated);
                improved = true;
                noImprovementCount = 0;
            }
        }

        if (!improved) {
            noImprovementCount++;
            if (noImprovementCount > 10) mutationRate = Math.min(mutationRate * 1.2, 2.0);
        } else {
            mutationRate = Math.max(mutationRate * 0.9, 0.05);
        }

        if (epoch % 100 === 0) {
            const accuracy = calculateAccuracy(bestWeights, examples);
            console.log(`Epoch ${epoch}/${EPOCHS} | Loss: ${bestLoss.toFixed(4)} | Accuracy: ${(accuracy * 100).toFixed(1)}% | Rate: ${mutationRate.toFixed(2)}`);
        }

        if (bestLoss < 0.1) break;
    }

    console.log('\n📈 FINAL EVALUATION');
    const accuracy = calculateAccuracy(bestWeights, examples);
    console.log(`✅ Correction Set Accuracy: ${(accuracy * 100).toFixed(1)}%`);

    // DEBUG: Show prediction for first example AFTER
    if (examples.length > 0) {
        const ex = examples[0];
        const trendNorm = (ex.input.trend + 1) / 2;
        const input = [ex.input.rsi / 100, trendNorm, ex.input.adx / 100, Math.min(ex.input.volatility / 10, 1.0), 0.5];
        const pred = forwardPass(input, bestWeights);
        console.log(`\n🔍 DEBUG After: Ex 1 Pred: [BUY: ${pred[0].toFixed(3)}, SELL: ${pred[1].toFixed(3)}, HOLD: ${pred[2].toFixed(3)}]`);
    }

    // Save
    const modelDir = path.dirname(modelPath);
    if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });

    fs.writeFileSync(modelPath, JSON.stringify({
        w1: bestWeights.w1,
        w2: bestWeights.w2,
        b1: bestWeights.b1,
        b2: bestWeights.b2,
        metadata: {
            trainedAt: new Date().toISOString(),
            correctionExamples: examples.length,
            finalLoss: bestLoss,
            accuracy: accuracy
        }
    }, null, 2));

    console.log(`\n✅ UPDATED Model saved to: ${modelPath}`);
}

function calculateAccuracy(weights: ModelWeights, examples: TrainingExample[]): number {
    let correct = 0;
    for (const ex of examples) {
        const trendNorm = (ex.input.trend + 1) / 2;
        const input = [
            ex.input.rsi / 100,
            trendNorm,
            ex.input.adx / 100,
            Math.min(ex.input.volatility / 10, 1.0),
            0.5
        ];
        const prediction = forwardPass(input, weights);
        const predictedIdx = prediction.indexOf(Math.max(...prediction));
        const targetIdx = actionToIndex(ex.output.action);
        if (predictedIdx === targetIdx) correct++;
    }
    return correct / examples.length;
}

main().catch(console.error);
