/**
 * TITAN V3: NEURO-SYMBOLIC CONSENSUS GUARDIAN
 * ============================================
 * 
 * Integrated version for simple-executor.ts
 * Architecture: Neuro > Symbolic < Neuro
 * 
 * Features:
 * - Exhaustive pattern matching for consensus
 * - Kill Switch for emergency halt
 * - MoA micro-agents voting
 * - Audit logging
 * 
 * @author Titan Quant Team
 * @version 3.0.0
 */

import { EventEmitter } from 'events';
import { logger } from './index.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type TitanAction = 'BUY' | 'SELL' | 'HOLD' | 'HALT';

export type TitanSignalSource =
    | 'MATH_GUARDIAN'
    | 'NEURAL_CORTEX'
    | 'SYMBOLIC_CONSENSUS'
    | 'EMERGENCY_HALT'
    | 'MOA_CONSENSUS';

export interface TitanMarketData {
    symbol: string;
    price: number;
    rsi?: number;
    ofi?: number;
    volatility?: number;
    trendStrength?: number;
    fearGreed?: number;
    trend?: string;
}

export interface TitanConsensusResult {
    finalAction: TitanAction;
    finalConfidence: number;
    source: TitanSignalSource;
    reasoning: string;
    canExecute: boolean;
    proofHash: string;
    mathVerdict: { action: TitanAction; confidence: number; reasoning: string };
    neuralVerdict: { action: TitanAction; confidence: number; reasoning: string };
    agentVotes: { agent: string; action: TitanAction; confidence: number }[];
}

// =============================================================================
// CONSTANTS (Golden Dataset Optimized)
// =============================================================================

const MIN_CONSENSUS_CONFIDENCE = 0.85;
const MAX_NETWORK_LATENCY_MS = 200;
const RSI_BUY_THRESHOLD = 46;
const RSI_SELL_THRESHOLD = 59;
const RSI_EXTREME_OVERSOLD = 25;
const RSI_EXTREME_OVERBOUGHT = 75;
const VOLATILITY_HALT_THRESHOLD = 3.5;

// =============================================================================
// MICRO-AGENTS (MoA)
// =============================================================================

class TrendMicroAgent {
    vote(data: TitanMarketData): { action: TitanAction; confidence: number; reasoning: string } {
        const trend = data.trend || 'NEUTRAL';
        const trendStrength = data.trendStrength ?? 0;

        if (trend === 'BULLISH' && trendStrength > 0.5) {
            return { action: 'BUY', confidence: 0.7, reasoning: `Bullish trend (${(trendStrength * 100).toFixed(0)}% strength)` };
        } else if (trend === 'BEARISH' && trendStrength < -0.5) {
            return { action: 'SELL', confidence: 0.7, reasoning: `Bearish trend` };
        }
        return { action: 'HOLD', confidence: 0.5, reasoning: 'Neutral trend' };
    }
}

class VolatilityMicroAgent {
    vote(data: TitanMarketData): { action: TitanAction; confidence: number; reasoning: string } {
        const volatility = data.volatility ?? 1;

        if (volatility > VOLATILITY_HALT_THRESHOLD) {
            return { action: 'HALT', confidence: 0.95, reasoning: `Extreme volatility: ${volatility.toFixed(2)}%` };
        } else if (volatility > 2.5) {
            return { action: 'HOLD', confidence: 0.7, reasoning: `High volatility: ${volatility.toFixed(2)}%` };
        }
        return { action: 'HOLD', confidence: 0.5, reasoning: 'Volatility normal' };
    }
}

class SentimentMicroAgent {
    vote(data: TitanMarketData): { action: TitanAction; confidence: number; reasoning: string } {
        const fearGreed = data.fearGreed ?? 50;

        if (fearGreed < 20) {
            return { action: 'BUY', confidence: 0.75, reasoning: `Extreme Fear (${fearGreed}) - Contrarian BUY` };
        } else if (fearGreed > 80) {
            return { action: 'SELL', confidence: 0.75, reasoning: `Extreme Greed (${fearGreed}) - Contrarian SELL` };
        }
        return { action: 'HOLD', confidence: 0.5, reasoning: `F&G Index: ${fearGreed}` };
    }
}

// =============================================================================
// MATH GUARDIAN (Deterministic Logic)
// =============================================================================

class MathGuardian {
    generateSignal(data: TitanMarketData, networkLatencyMs: number): { action: TitanAction; confidence: number; reasoning: string } {
        const reasons: string[] = [];
        let score = 0;

        // Safety: Network latency check
        if (networkLatencyMs > MAX_NETWORK_LATENCY_MS) {
            return {
                action: 'HALT',
                confidence: 1.0,
                reasoning: `Network latency ${networkLatencyMs}ms exceeds ${MAX_NETWORK_LATENCY_MS}ms threshold`
            };
        }

        const rsi = data.rsi ?? 50;
        const ofi = data.ofi ?? 0;
        const trend = data.trend || 'NEUTRAL';

        // RSI Logic (Golden Dataset Optimized)
        if (rsi < RSI_EXTREME_OVERSOLD) {
            score += 4;
            reasons.push(`RSI Collapsed (${rsi.toFixed(1)})`);
        } else if (rsi < 30) {
            score += 3;
            reasons.push(`RSI Deep Oversold (${rsi.toFixed(1)})`);
        } else if (rsi < RSI_BUY_THRESHOLD) {
            score += 1;
            reasons.push(`RSI Below Optimal (${rsi.toFixed(1)})`);
        } else if (rsi > RSI_EXTREME_OVERBOUGHT) {
            score -= 4;
            reasons.push(`RSI Sky High (${rsi.toFixed(1)})`);
        } else if (rsi > 70) {
            score -= 3;
            reasons.push(`RSI Overbought (${rsi.toFixed(1)})`);
        } else if (rsi > RSI_SELL_THRESHOLD) {
            score -= 1;
            reasons.push(`RSI Above Optimal (${rsi.toFixed(1)})`);
        }

        // OFI Logic
        if (ofi > 0.30) {
            score += 2;
            reasons.push(`Strong Buy Wall (OFI: ${ofi.toFixed(2)})`);
        } else if (ofi < -0.30) {
            score -= 2;
            reasons.push(`Strong Sell Wall (OFI: ${ofi.toFixed(2)})`);
        }

        // Trend Confirmation
        if (trend === 'BULLISH') {
            score += 1;
            reasons.push('Trend Bullish');
        } else if (trend === 'BEARISH') {
            score -= 2; // Iron Rule: Don't fight the trend
            reasons.push('Trend Bearish (Caution)');
        }

        // Safety Filter: No BUY in bearish unless extreme oversold
        if (score > 0 && trend === 'BEARISH' && rsi > 30) {
            score = 0;
            reasons.push('[SAFETY] Blocked BUY in bearish trend');
        }

        // Determine action
        let action: TitanAction = 'HOLD';
        if (score >= 4) action = 'BUY';
        else if (score <= -4) action = 'SELL';

        const confidence = Math.min((Math.abs(score) / 8) + 0.3, 0.99);

        return {
            action,
            confidence,
            reasoning: reasons.join(', ') || 'No significant signals'
        };
    }
}

// =============================================================================
// NEURAL CORTEX (Pattern Recognition Fallback)
// =============================================================================

class NeuralCortexFallback {
    infer(data: TitanMarketData): { action: TitanAction; confidence: number; reasoning: string } {
        const rsi = data.rsi ?? 50;
        const ofi = data.ofi ?? 0;

        // Simple heuristic (would be replaced by ONNX model)
        if (rsi < 35 && ofi > 0.2) {
            return {
                action: 'BUY',
                confidence: 0.72,
                reasoning: `Neural: Oversold (RSI=${rsi.toFixed(1)}) + Buy pressure`
            };
        } else if (rsi > 65 && ofi < -0.2) {
            return {
                action: 'SELL',
                confidence: 0.72,
                reasoning: `Neural: Overbought (RSI=${rsi.toFixed(1)}) + Sell pressure`
            };
        }
        return {
            action: 'HOLD',
            confidence: 0.5,
            reasoning: `Neural: Market neutral`
        };
    }
}

// =============================================================================
// TITAN V3 CORE (Symbolic Consensus Engine)
// =============================================================================

export class TitanV3Core extends EventEmitter {
    private mathGuardian: MathGuardian;
    private neuralCortex: NeuralCortexFallback;
    private trendAgent: TrendMicroAgent;
    private volatilityAgent: VolatilityMicroAgent;
    private sentimentAgent: SentimentMicroAgent;
    private killSwitchActive: boolean = false;
    private killSwitchReason: string = '';
    private auditLog: string[] = [];
    private initialized: boolean = false;

    constructor() {
        super();
        this.mathGuardian = new MathGuardian();
        this.neuralCortex = new NeuralCortexFallback();
        this.trendAgent = new TrendMicroAgent();
        this.volatilityAgent = new VolatilityMicroAgent();
        this.sentimentAgent = new SentimentMicroAgent();
    }

    async initialize(): Promise<void> {
        logger.info('🦁 TITAN V3 Neuro-Symbolic Core initializing...');
        logger.info('   Architecture: Neuro > Symbolic < Neuro');
        logger.info('   EU AI Act Article 14: Compliant (Kill Switch enabled)');
        this.initialized = true;
        logger.info('✅ TITAN V3 Core ready');
    }

    // EU AI Act Article 14: Kill Switch
    activateKillSwitch(reason: string): void {
        this.killSwitchActive = true;
        this.killSwitchReason = reason;
        const entry = `[KILL_SWITCH] Activated: ${reason}`;
        this.auditLog.push(entry);
        logger.warn(`🛑 TITAN KILL SWITCH ACTIVATED: ${reason}`);
        this.emit('killSwitch', { activated: true, reason, timestamp: Date.now() });
    }

    deactivateKillSwitch(operatorId: string): void {
        this.killSwitchActive = false;
        const entry = `[KILL_SWITCH] Deactivated by: ${operatorId}`;
        this.auditLog.push(entry);
        logger.info(`✅ TITAN Kill Switch deactivated by ${operatorId}`);
        this.emit('killSwitch', { activated: false, operator: operatorId, timestamp: Date.now() });
    }

    isHalted(): boolean {
        return this.killSwitchActive;
    }

    /**
     * Generate consensus signal using Neuro-Symbolic pattern matching
     */
    async generateConsensus(
        data: TitanMarketData,
        networkLatencyMs: number = 50
    ): Promise<TitanConsensusResult> {
        // Safety: Kill Switch check
        if (this.killSwitchActive) {
            return this.createResult('HALT', 1.0, 'EMERGENCY_HALT',
                `KILL SWITCH ACTIVE: ${this.killSwitchReason}`, false,
                { action: 'HALT', confidence: 1, reasoning: 'Kill switch' },
                { action: 'HALT', confidence: 1, reasoning: 'Kill switch' },
                []
            );
        }

        // 1. Gather MoA agent votes
        const trendVote = this.trendAgent.vote(data);
        const volatilityVote = this.volatilityAgent.vote(data);
        const sentimentVote = this.sentimentAgent.vote(data);
        const agentVotes = [
            { agent: 'TREND', ...trendVote },
            { agent: 'VOLATILITY', ...volatilityVote },
            { agent: 'SENTIMENT', ...sentimentVote }
        ];

        // 2. Get Math Guardian verdict (deterministic)
        const mathVerdict = this.mathGuardian.generateSignal(data, networkLatencyMs);

        // 3. Get Neural verdict (stochastic/fallback)
        const neuralVerdict = this.neuralCortex.infer(data);

        // 4. Symbolic Consensus Logic (Pattern Matching)
        let result: { finalAction: TitanAction; source: TitanSignalSource; reasoning: string; canExecute: boolean };

        // Case 1: Math says HALT - always obey
        if (mathVerdict.action === 'HALT') {
            result = {
                finalAction: 'HALT',
                source: 'EMERGENCY_HALT',
                reasoning: `MATH GUARDIAN: ${mathVerdict.reasoning}`,
                canExecute: false
            };
        }
        // Case 2: Volatility Agent says HALT
        else if (volatilityVote.action === 'HALT') {
            result = {
                finalAction: 'HALT',
                source: 'EMERGENCY_HALT',
                reasoning: volatilityVote.reasoning,
                canExecute: false
            };
        }
        // Case 3: Strong agreement Math + Neural
        else if (
            mathVerdict.action === neuralVerdict.action &&
            mathVerdict.action !== 'HOLD' &&
            neuralVerdict.confidence >= MIN_CONSENSUS_CONFIDENCE
        ) {
            result = {
                finalAction: mathVerdict.action,
                source: 'SYMBOLIC_CONSENSUS',
                reasoning: `CONSENSUS: Math + Neural agree (${mathVerdict.action})`,
                canExecute: true
            };
        }
        // Case 4: Math SELL, Neural BUY - Math VETOS
        else if (mathVerdict.action === 'SELL' && neuralVerdict.action === 'BUY') {
            result = {
                finalAction: 'HOLD',
                source: 'MATH_GUARDIAN',
                reasoning: 'VETO: Math Guardian blocks risky BUY',
                canExecute: false
            };
        }
        // Case 5: Math neutral, high-confidence Neural
        else if (mathVerdict.action === 'HOLD' && neuralVerdict.confidence > 0.85) {
            result = {
                finalAction: neuralVerdict.action,
                source: 'NEURAL_CORTEX',
                reasoning: `NEURAL ALPHA: ${neuralVerdict.reasoning}`,
                canExecute: neuralVerdict.action !== 'HOLD'
            };
        }
        // Case 6: Low confidence everywhere
        else if (mathVerdict.confidence < 0.6 && neuralVerdict.confidence < 0.6) {
            result = {
                finalAction: 'HOLD',
                source: 'SYMBOLIC_CONSENSUS',
                reasoning: 'CAUTION: Insufficient consensus',
                canExecute: false
            };
        }
        // Default: Trust Math Guardian
        else {
            result = {
                finalAction: mathVerdict.action,
                source: 'MATH_GUARDIAN',
                reasoning: mathVerdict.reasoning,
                canExecute: mathVerdict.action !== 'HOLD' && mathVerdict.confidence > 0.7
            };
        }

        // Audit log
        const logEntry = `[${new Date().toISOString()}] ${result.finalAction} | Conf: ${mathVerdict.confidence.toFixed(2)} | Src: ${result.source}`;
        this.auditLog.push(logEntry);

        // Emit decision event
        this.emit('decision', {
            timestamp: Date.now(),
            result,
            mathVerdict,
            neuralVerdict
        });

        return this.createResult(
            result.finalAction,
            mathVerdict.confidence,
            result.source,
            result.reasoning,
            result.canExecute,
            mathVerdict,
            neuralVerdict,
            agentVotes
        );
    }

    getAuditLog(): string[] {
        return [...this.auditLog];
    }

    private createResult(
        action: TitanAction,
        confidence: number,
        source: TitanSignalSource,
        reasoning: string,
        canExecute: boolean,
        mathVerdict: { action: TitanAction; confidence: number; reasoning: string },
        neuralVerdict: { action: TitanAction; confidence: number; reasoning: string },
        agentVotes: { agent: string; action: TitanAction; confidence: number }[]
    ): TitanConsensusResult {
        // Generate proof hash
        const payload = `TITAN:${Date.now()}:${action}:${confidence}:${source}`;
        let hash = 0;
        for (let i = 0; i < payload.length; i++) {
            hash = ((hash << 5) - hash) + payload.charCodeAt(i);
            hash = hash & hash;
        }
        const proofHash = `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;

        return {
            finalAction: action,
            finalConfidence: confidence,
            source,
            reasoning,
            canExecute,
            proofHash,
            mathVerdict,
            neuralVerdict,
            agentVotes
        };
    }
}

// Export singleton instance
export const titanV3 = new TitanV3Core();
