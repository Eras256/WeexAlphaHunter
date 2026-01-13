import { logger } from './logger.js';
import { TitanNeuralEngine } from './neural-ai.js';

export interface LocalSignal {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    source: 'MATH_V1' | 'TITAN_NEURAL' | 'HYBRID';
}

/**
 * Local Intelligence Engine ("The Warrior" -> "Titan Hybrid")
 * 
 * EVOLUTION 2025:
 * Integrates deterministic math models with a local LSTM Neural Network (Titan).
 * 
 * - Layer 1: Math Guardian (Fast, robust safety checks)
 * - Layer 2: Titan Neural Net (Pattern recognition, deep learning)
 * 
 * Result: Institutional-grade local signals.
 */
export class LocalIntelligence {
    private titan: TitanNeuralEngine;
    private historyBuffer: number[][] = []; // Buffer to store last 10 candles features

    constructor() {
        this.titan = new TitanNeuralEngine();
    }

    /**
     * Updates internal history buffer for the Neural Net
     * Features: [RSI, Trend, Imbalance, FearGreed, Volatility(mock)]
     */
    private updateHistory(indicators: Record<string, number>) {
        const features = [
            indicators.RSI || 50,
            indicators.Trend || 0,
            indicators.OrderImbalance || 0,
            indicators.FearGreed || 50,
            Math.random() // Mock volatility for now, logic to be added
        ];

        this.historyBuffer.push(features);
        if (this.historyBuffer.length > 10) {
            this.historyBuffer.shift(); // Keep only last 10
        }
    }

    async generateSignal(marketData: {
        price: number,
        indicators?: Record<string, number>
    }): Promise<LocalSignal> {
        try {
            const indicators = marketData.indicators || {};

            // 1. Update Neural Context
            this.updateHistory(indicators);

            // 2. Run Math Model (The "Guardian")
            const mathSignal = this.runMathModel(indicators);

            // 3. Run Titan Neural Model (if enough history)
            let neuralSignal = { action: 'HOLD', confidence: 0 };

            if (this.historyBuffer.length === 10) {
                neuralSignal = await this.titan.analyze(this.historyBuffer as any); // Type cast due to strict dims
            }

            // 4. Hybrid Consensus Logic

            // Case A: Strong Agreement
            if (mathSignal.action === neuralSignal.action && neuralSignal.action !== 'HOLD') {
                return {
                    action: mathSignal.action as any,
                    confidence: Math.min(mathSignal.confidence + 0.1, 0.99), // Boost confidence
                    reasoning: `HYBRID CONSENSUS: Titan Neural detected pattern (${(neuralSignal.confidence * 100).toFixed(0)}%) + Math validated: ${mathSignal.reasoning}`,
                    source: 'HYBRID'
                };
            }

            // Case B: Titan is very confident (>85%) -> Override Math (unless Math is strongly opposed?)
            // We'll play safe: Neural overrides only if Math is Neutral or Hold
            if (neuralSignal.confidence > 0.85 && (mathSignal.action === 'HOLD' || mathSignal.confidence < 0.4)) {
                return {
                    action: neuralSignal.action as any,
                    confidence: neuralSignal.confidence,
                    reasoning: `TITAN ALPHA: Deep pattern detected by Neural Net. Math is neutral.`,
                    source: 'TITAN_NEURAL'
                };
            }

            // Case C: Fallback to Math (Guardian)
            return {
                action: mathSignal.action as any,
                confidence: mathSignal.confidence,
                reasoning: mathSignal.reasoning,
                source: 'MATH_V1'
            };

        } catch (e) {
            logger.error("Local Intel Error", e);
            return { action: 'HOLD', confidence: 0, reasoning: 'Local Error', source: 'MATH_V1' };
        }
    }

    private runMathModel(indicators: Record<string, number>): { action: string, confidence: number, reasoning: string } {
        const rsi = indicators.RSI || 50;
        const trend = indicators.Trend || 0;
        const imbalance = indicators.OrderImbalance || 0;
        const fg = indicators.FearGreed || 50;

        // Result Score
        let score = 0;
        const reasons: string[] = [];

        // RSI Logic (Stricter for "Sniper Mode")
        if (rsi < 25) { score += 4; reasons.push(`RSI Collapsed (${rsi.toFixed(1)})`); } // Extreme Oversold
        else if (rsi < 30) { score += 2; reasons.push(`RSI Oversold (${rsi.toFixed(1)})`); }
        else if (rsi > 75) { score -= 4; reasons.push(`RSI Sky High (${rsi.toFixed(1)})`); }
        else if (rsi > 70) { score -= 2; reasons.push(`RSI Overbought (${rsi.toFixed(1)})`); }

        // Trend Logic (The "Iron Rule")
        if (trend === 1) { score += 1; reasons.push("Trend Bullish"); }
        else if (trend === -1) { score -= 2; reasons.push("Trend Bearish"); } // Heavily penalize fighting the trend

        // Imbalance (Require stronger signals)
        if (imbalance > 0.30) { score += 2; reasons.push("Orders: Strong Buy Wall"); }
        else if (imbalance < -0.30) { score -= 2; reasons.push("Orders: Strong Sell Wall"); }

        // Decision (Threshold raised to 4 for safer entries)
        let action = 'HOLD';
        let confidence = 0.5;

        // SAFETY FILTER: Never BUY in Bearish Trend unless RSI is screaming cheap
        if (reasons.includes("Trend Bearish") && score > 0) {
            if (rsi > 28) {
                score = 0; // Nullify buy signal
                reasons.push("[SAFETY] Trend Filter Block");
            }
        }

        if (score >= 4) {
            action = 'BUY';
            confidence = Math.min(0.7 + (score * 0.05), 0.99);
        } else if (score <= -4) {
            action = 'SELL';
            confidence = Math.min(0.7 + (Math.abs(score) * 0.05), 0.99);
        } else {
            reasons.push("Wait for Setup");
        }

        return { action, confidence, reasoning: reasons.join(', ') };
    }
}

export const localAI = new LocalIntelligence();
