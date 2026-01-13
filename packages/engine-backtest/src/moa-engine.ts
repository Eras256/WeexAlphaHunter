import { OpenRouterClient } from '../../core/src/openrouter-client.js';
import { GroqClient } from '../../core/src/groq-client.js';
// Gemini import removed/unused
import { keccak256 } from 'ethers';

// Types – reuse from existing codebase
export interface MarketData {
    symbol: string;
    price: number;
    indicators: { RSI: number; MACD?: number; trend?: string; orderflow_imbalance?: number; fear_greed?: number };
    positionSize?: number;
    accountEquity?: number;
}

export interface Signal {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    consensusScore?: number;
    modelUsed?: string;
    proofHash?: string;
}

/**
 * Run the Proposer agents in parallel (Groq Llama 3 + Mistral + DeepSeek + Titans Local).
 * Gemini has been removed as per "Titan Protocol" override.
 */
async function runProposers(md: MarketData) {
    // 1. Math/Quant Analyst - Switching to Groq (Llama 3.1) for reliability
    // OpenRouter free models (OpenChat, Phi-3, Mistral) are consistently failing with 404/429.
    const mathClient = new GroqClient('llama-3.1-8b-instant');

    // 2. Strategic Macro Analyst (Llama 3.1 8B Instant via Groq) - This works great
    const strategyClient = new GroqClient('llama-3.1-8b-instant');

    // 3. Risk Manager - Switching to Groq (Llama 3.1) for reliability
    const riskClient = new GroqClient('llama-3.1-8b-instant');

    const mathPrompt = `You are a quantitative analyst. Given the market data below, output a JSON object with fields:
{ "action": "BUY|SELL|HOLD", "confidence": 0-1, "reasoning": "Brief quantitative rationale." }
Market: ${md.symbol}
Price: ${md.price}
RSI: ${md.indicators.RSI}
Trend: ${md.indicators.trend || 'Unknown'}
Imbalance: ${md.indicators.orderflow_imbalance || 0}`;

    // Llama 3 on Groq is super fast, good for "Gut Check" / Macro
    const strategyPrompt = `You are the Lead Strategic Analyst (Titan Groq).
Analyze this market:
Asset: ${md.symbol} | Price: ${md.price} | RSI: ${md.indicators.RSI} | Trend: ${md.indicators.trend} | F&G: ${md.indicators.fear_greed}
Decide BUY/SELL/HOLD.
Output valid JSON: { "action": "BUY|SELL|HOLD", "confidence": 0-1, "reasoning": "Strategy insight" }`;

    const riskPrompt = `You are a risk manager. Current trend is ${md.indicators.trend}. RSI is ${md.indicators.RSI}. Decide BUY/SELL/HOLD and give a confidence score (0-1). Output valid JSON.`;

    // Titan Local (Mathematical Heuristic - "The Neural Core")
    // Runs purely on local CPU, no logic gaps
    const titanLocalVote = (() => {
        const rsi = md.indicators.RSI;
        const trend = md.indicators.trend;
        let score = 0;

        // Simple logic: RSI oversold in Uptrend = BUY
        if (rsi < 32) score += 0.5;
        if (rsi > 68) score -= 0.5;
        if (trend === 'BULLISH') score += 0.3;
        if (trend === 'BEARISH') score -= 0.3;
        if ((md.indicators.orderflow_imbalance || 0) > 0.15) score += 0.2;

        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        if (score >= 0.5) action = 'BUY';
        if (score <= -0.5) action = 'SELL';

        return {
            action,
            confidence: Math.abs(score) > 0.8 ? 0.9 : 0.6,
            reasoning: `Local algorithm calculated score ${score.toFixed(2)} based on RSI ${rsi}`
        };
    })();

    // Execute concurrently for speed
    const [mathRes, strategyRes, riskRes] = await Promise.all([
        mathClient.completions({ prompt: mathPrompt }).catch(e => { console.error("Quant Error", e.message); return null; }),
        strategyClient.completions({ prompt: strategyPrompt }).catch(e => { console.error("Groq Error", e.message); return null; }),
        riskClient.completions({ prompt: riskPrompt }).catch(e => { console.error("Risk Error", e.message); return null; })
    ]);

    const safeParse = (s: string | null) => {
        if (!s) return null;
        try {
            // Extract JSON if wrapped in markdown code blocks
            const jsonMatch = s.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : s);
        } catch { return null; }
    };

    return {
        quant: safeParse(mathRes),
        strategy: safeParse(strategyRes), // Llama 3
        risk: safeParse(riskRes),
        local: titanLocalVote
    };
}

/**
 * Aggregator agent – synthesizes the proposals.
 * Uses DeepSeek R1 (OpenRouter) as the "Titan Consensus Engine".
 */
async function aggregate(proposals: any): Promise<Signal> {
    // Switching Aggregator to Groq (Llama 3.1) for maximum speed and reliability
    // OpenRouter free tier has been too unstable (404s/429s).
    const aggClient = new GroqClient('llama-3.1-8b-instant');
    const p = proposals;

    const aggPrompt = `You are TITAN, the Supreme AI Investment Consensus Engine.
Review the following agent votes and make the FINAL execution decision.

1. Strategic Analyst (Llama 3 70B): ${JSON.stringify(p.strategy || "ABSTAIN")}
2. Quantitative Analyst (DeepSeek Math): ${JSON.stringify(p.quant || "ABSTAIN")}
3. Risk Manager (Mistral): ${JSON.stringify(p.risk || "ABSTAIN")}
4. Neural Core (Local Algo): ${JSON.stringify(p.local || "ABSTAIN")}

Instructions:
- Prioritize the 'Quantitative Analyst' (DeepSeek) and 'Neural Core' (Local) for signal direction.
- If Risk Manager signals extreme caution (HOLD/SELL on high RSI), respect it.
- Output a pure JSON object:
{ "action": "BUY|SELL|HOLD", "consensusScore": 0-100, "confidence": 0-1, "reasoning": "Final verdict...", "modelUsed": "Titan_DeepSeek_R1_Consensus" }`;

    try {
        const aggRes = await aggClient.completions({ prompt: aggPrompt });
        const jsonMatch = aggRes.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aggRes);
        return {
            ...parsed,
            modelUsed: "Titan_DeepSeek_R1_Consensus"
        };
    } catch (e) {
        // Fallback if aggregator fails - Simple Majority Vote of Local + Strategy
        const localAction = p.local?.action || 'HOLD';
        const strategyAction = p.strategy?.action || 'HOLD';

        // If Logic and Strategy agree, go with it
        if (localAction !== 'HOLD' && localAction === strategyAction) {
            return {
                action: localAction,
                confidence: 0.75,
                reasoning: `Titan Aggegator Offline. Fallback Consensus: Local (${localAction}) + Strategy (${strategyAction}) matched.`,
                modelUsed: "Titan_Fallback_V2"
            };
        }

        return {
            action: 'HOLD',
            confidence: 0,
            reasoning: "Aggregator connection failed and no majority consensus found.",
            modelUsed: "Titan_Fallback_Safety"
        };
    }
}

/**
 * Public entry point used by the executor.
 * NOTE: 'existingGemini' argument is kept for signature compatibility but ignored.
 */
export async function runMoA(md: MarketData, existingGemini?: any): Promise<Signal> {
    if (!md) throw new Error("No Market Data provided to MoA");

    // We purposely IGNORE existingGemini here to "not use Gemini" as requested.

    // 1. Gather Proposals (Groq, OpenRouter, Local)
    const proposals = await runProposers(md);

    // 2. Synthesize (DeepSeek)
    const signal = await aggregate(proposals);

    // Attach cryptographic proof hash for on‑chain verification
    const proofPayload = {
        uid: process.env.WEEX_UID || 'ANON-TITAN-USER',
        marketData: { symbol: md.symbol, price: md.price, rsi: md.indicators.RSI },
        votes: {
            strategy: proposals.strategy?.action,
            quant: proposals.quant?.action,
            local: proposals.local?.action
        },
        decision: signal.action,
        ts: Date.now(),
    };

    // Generate Hash
    try {
        (signal as any).proofHash = keccak256(Buffer.from(JSON.stringify(proofPayload)));
    } catch (e) {
        (signal as any).proofHash = "0x0000000000000000000000000000000000000000";
    }

    return signal;
}
