/**
 * TITAN NEURAL ENGINE - OFFLINE REINFORCEMENT LEARNING TRAINER
 * 
 * This script uses the Golden Dataset generated from successful trades
 * to update the neural network weights using a gradient-free evolutionary approach.
 * 
 * Strategy: 
 * 1. Load current model weights
 * 2. Run forward pass with training examples
 * 3. Calculate error (difference between model prediction and actual action)
 * 4. Apply small mutations to weights that reduce error
 * 5. Save improved weights
 * 
 * Usage: pnpm train:brain
 */

import * as fs from 'fs';
import * as path from 'path';

interface TrainingExample {
    input: {
        rsi: number;
        trend: number;
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

interface ModelWeights {
    w1: number[][];
    w2: number[][];
    b1: number[];
    b2: number[];
}

// --- Neural Network Functions (Mirrored from neural-ai.ts) ---

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
    // Cross-entropy-like loss, weighted by confidence
    return -Math.log(Math.max(prediction[targetIdx], 0.001)) * confidence;
}

function evaluateModel(weights: ModelWeights, examples: TrainingExample[]): number {
    let totalLoss = 0;
    let correct = 0;

    for (const ex of examples) {
        // Create input vector [RSI, Trend, Imbalance(0), FearGreed(50), Volatility(0.5)]
        const input = [
            ex.input.rsi / 100,           // Normalize to 0-1
            (ex.input.trend + 1) / 2,     // Convert -1,0,1 to 0,0.5,1
            0.5,                           // Default imbalance (we don't have this data)
            0.5,                           // Default fear/greed (normalized)
            0.5                            // Default volatility
        ];

        const prediction = forwardPass(input, weights);
        totalLoss += calculateLoss(prediction, ex.output.action, ex.output.confidence);

        // Check if prediction matches action
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

async function main() {
    console.log('🧠 TITAN NEURAL ENGINE - OFFLINE RL TRAINER');
    console.log('===========================================\n');

    // Load golden dataset
    const datasetPath = path.join(process.cwd(), 'training_data', 'golden_training_data.json');
    if (!fs.existsSync(datasetPath)) {
        console.error('❌ Golden dataset not found! Run: pnpm generate:dataset first');
        process.exit(1);
    }

    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    console.log(`📂 Loaded ${dataset.examples.length} training examples`);
    console.log(`   🥇 GOLD: ${dataset.stats.goldExamples}`);
    console.log(`   🥈 SILVER: ${dataset.stats.silverExamples}\n`);

    // Filter to GOLD examples only for training (higher quality)
    const goldExamples: TrainingExample[] = dataset.examples.filter(
        (e: TrainingExample) => e.quality === 'GOLD'
    );

    // Use all for validation
    const allExamples: TrainingExample[] = dataset.examples;

    // Load current model or initialize new
    const modelPath = path.join(process.cwd(), 'data', 'models', 'titan-native.json');
    let weights: ModelWeights;

    if (fs.existsSync(modelPath)) {
        weights = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
        console.log('📦 Loaded existing model weights');
    } else {
        // Initialize random weights (matching neural-ai.ts architecture: 5→8→3)
        weights = {
            w1: Array(5).fill(0).map(() => Array(8).fill(0).map(() => (Math.random() - 0.5) * 0.5)),
            w2: Array(8).fill(0).map(() => Array(3).fill(0).map(() => (Math.random() - 0.5) * 0.5)),
            b1: new Array(8).fill(0.1),
            b2: new Array(3).fill(0.1)
        };
        console.log('🆕 Initialized new random weights');
    }

    // Calculate initial performance
    let bestLoss = evaluateModel(weights, goldExamples);
    console.log(`\n📊 Initial Loss: ${bestLoss.toFixed(4)}`);

    // Evolutionary Training Loop
    const EPOCHS = 500;
    const MUTATIONS_PER_EPOCH = 20;
    let bestWeights = cloneWeights(weights);
    let noImprovementCount = 0;
    let mutationRate = 0.1;

    console.log('\n🏋️ Starting Evolutionary Training...\n');

    for (let epoch = 0; epoch < EPOCHS; epoch++) {
        let improved = false;

        for (let m = 0; m < MUTATIONS_PER_EPOCH; m++) {
            const mutated = mutateWeights(bestWeights, mutationRate);
            const loss = evaluateModel(mutated, goldExamples);

            if (loss < bestLoss) {
                bestLoss = loss;
                bestWeights = cloneWeights(mutated);
                improved = true;
                noImprovementCount = 0;
            }
        }

        // Adaptive mutation rate
        if (!improved) {
            noImprovementCount++;
            if (noImprovementCount > 10) {
                mutationRate = Math.min(mutationRate * 1.2, 0.5); // Increase exploration
            }
        } else {
            mutationRate = Math.max(mutationRate * 0.95, 0.01); // Decrease for fine-tuning
        }

        // Progress logging
        if (epoch % 50 === 0 || epoch === EPOCHS - 1) {
            const accuracy = calculateAccuracy(bestWeights, goldExamples);
            console.log(`Epoch ${epoch + 1}/${EPOCHS} | Loss: ${bestLoss.toFixed(4)} | Accuracy: ${(accuracy * 100).toFixed(1)}% | Mutation Rate: ${mutationRate.toFixed(3)}`);
        }

        // Early stopping
        if (bestLoss < 0.05 || noImprovementCount > 50) {
            console.log('\n⚡ Early stopping triggered');
            break;
        }
    }

    // Evaluate on full dataset
    console.log('\n📈 FINAL EVALUATION');
    console.log('-------------------');

    const goldAccuracy = calculateAccuracy(bestWeights, goldExamples);
    const fullAccuracy = calculateAccuracy(bestWeights, allExamples);

    console.log(`🥇 GOLD Examples Accuracy: ${(goldAccuracy * 100).toFixed(1)}%`);
    console.log(`📊 All Examples Accuracy:  ${(fullAccuracy * 100).toFixed(1)}%`);

    // Save improved model
    const modelDir = path.dirname(modelPath);
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    fs.writeFileSync(modelPath, JSON.stringify({
        w1: bestWeights.w1,
        w2: bestWeights.w2,
        b1: bestWeights.b1,
        b2: bestWeights.b2,
        metadata: {
            trainedAt: new Date().toISOString(),
            trainingExamples: goldExamples.length,
            finalLoss: bestLoss,
            accuracy: goldAccuracy
        }
    }, null, 2));

    console.log(`\n✅ Model saved to: ${modelPath}`);
    console.log('\n🚀 Restart the trading bot to use the updated model!');
}

function calculateAccuracy(weights: ModelWeights, examples: TrainingExample[]): number {
    let correct = 0;

    for (const ex of examples) {
        const input = [
            ex.input.rsi / 100,
            (ex.input.trend + 1) / 2,
            0.5,
            0.5,
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
