import { OpenRouterClient } from '../../core/src/openrouter-client.js';
import { createGeminiClient, GeminiClient } from '../../core/src/index.js';
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
 * Run the Proposer agents in parallel (Gemini + Llama + Mistral + DeepSeek + Titans Local).
 */
async function runProposers(md: MarketData, gemini: GeminiClient) {
    const mathClient = new OpenRouterClient('deepseek/r1'); // math / reasoning
    const macroClient = new OpenRouterClient('meta-llama/3.1'); // macro / news
    const riskClient = new OpenRouterClient('mistralai/mistral-medium'); // risk assessment

    const mathPrompt = `You are a quantitative analyst. Given the market data below, output a JSON object with fields:
{ "action": "BUY|SELL|HOLD", "confidence": 0-1, "reasoning": "Brief quantitative rationale." }
Market: ${md.symbol}
Price: ${md.price}
RSI: ${md.indicators.RSI}
Trend: ${md.indicators.trend || 'Unknown'}
Imbalance: ${md.indicators.orderflow_imbalance || 0}`;

    const macroPrompt = `You are a macro analyst. Considering the Fear & Greed Index is ${md.indicators.fear_greed || 50}, decide BUY/SELL/HOLD for ${md.symbol}. Output valid JSON.`;

    const riskPrompt = `You are a risk manager. Current trend is ${md.indicators.trend}. Decide BUY/SELL/HOLD and give a confidence score (0-1). Output valid JSON.`;

    const geminiPrompt = `You are the Lead Market Analyst (Gemini 2.5).
Analyze this market situation with high precision.
Asset: ${md.symbol}
Price: ${md.price}
RSI: ${md.indicators.RSI}
Trend: ${md.indicators.trend}
Order Book Imbalance: ${md.indicators.orderflow_imbalance}
Fear/Greed: ${md.indicators.fear_greed}

Your goal is to provide a decisive signal.
Output strictly valid JSON: { "action": "BUY|SELL|HOLD", "confidence": 0.0-1.0, "reasoning": "concise strategic insight" }`;

    // Titan Local (Mathematical Heuristic - "The Neural Core")
    // Runs purely on local CPU, no logic gaps
    const titanLocalVote = (() => {
        const rsi = md.indicators.RSI;
        const trend = md.indicators.trend;
        let score = 0;

        // Simple logic: RSI oversold in Uptrend = BUY
        if (rsi < 35) score += 0.4;
        if (rsi > 65) score -= 0.4;
        if (trend === 'BULLISH') score += 0.3;
        if (trend === 'BEARISH') score -= 0.3;
        if ((md.indicators.orderflow_imbalance || 0) > 0.2) score += 0.2;

        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        if (score > 0.4) action = 'BUY';
        if (score < -0.4) action = 'SELL';

        return {
            action,
            confidence: Math.abs(score) > 0.8 ? 0.9 : 0.6,
            reasoning: `Local algorithm calculated score ${score.toFixed(2)} based on RSI ${rsi}`
        };
    })();

    // Execute concurrently for speed
    // Note: Local vote is instant, but we await the others
    const [mathRes, macroRes, riskRes, geminiRes] = await Promise.all([
        mathClient.completions({ prompt: mathPrompt }).catch(_ => null),
        macroClient.completions({ prompt: macroPrompt }).catch(_ => null),
        riskClient.completions({ prompt: riskPrompt }).catch(_ => null),
        gemini.generateJSON(geminiPrompt, { temperature: 0.7 }).catch(_ => null)
    ]);

    const safeParse = (s: string | null) => {
        if (!s) return null;
        try { return JSON.parse(s); } catch { return null; }
    };

    return {
        // Safe parse OpenRouter strings, Gemini already returns object structure
        math: safeParse(mathRes),
        macro: safeParse(macroRes),
        risk: safeParse(riskRes),
        gemini: geminiRes?.data || null,
        local: titanLocalVote
    };
}

/**
 * Aggregator agent – synthesizes the proposals.
 */
async function aggregate(proposals: any): Promise<Signal> {
    const aggClient = new OpenRouterClient('deepseek/r1'); // synthesizer (The Judge)

    // Fallback if proposals are null
    const p = proposals;

    const aggPrompt = `You are the Chairman of the AI Investment Council. Review the following votes and make the FINAL decision.
    
1. Gemini 2.5 (Analytic Lead): ${JSON.stringify(p.gemini || "ABSTAIN")}
2. DeepSeek Math (Quant): ${JSON.stringify(p.math || "ABSTAIN")}
3. Llama 3.1 (Macro): ${JSON.stringify(p.macro || "ABSTAIN")}
4. Mistral (Risk): ${JSON.stringify(p.risk || "ABSTAIN")}
5. Titan Neural (Local): ${JSON.stringify(p.local || "ABSTAIN")}

Instructions:
- Weight Gemini and Titan Local (Logic) deeply.
- If Gemini and Llama agree, follow them.
- If Risk sends a strong SELL warning, respect it.
- Output a JSON with fields:
{ "action": "BUY|SELL|HOLD", "consensusScore": 0-100, "confidence": 0-1, "reasoning": "Final verdict summarizing the board's view...", "modelUsed": "DeepSeek-R1 (Aggregator)" }`;

    try {
        const aggRes = await aggClient.completions({ prompt: aggPrompt });
        return JSON.parse(aggRes);
    } catch (e) {
        // Fallback if aggregator fails - Simple Majority Vote
        return {
            action: 'HOLD',
            confidence: 0,
            reasoning: "Aggregator connection failed. Defaulting to HOLD safety.",
            modelUsed: "Fallback_Safety_Switch"
        };
    }
}

/**
 * Public entry point used by the executor.
 */
export async function runMoA(md: MarketData, existingGemini?: GeminiClient): Promise<Signal> {
    // fast-fail if no market data
    if (!md) throw new Error("No Market Data provided to MoA");

    const gemini = existingGemini || createGeminiClient();

    const proposals = await runProposers(md, gemini);
    const signal = await aggregate(proposals);

    // Attach cryptographic proof hash for on‑chain verification
    const proofPayload = {
        uid: process.env.WEEX_UID || 'ANON-TITAN-USER',
        marketData: { symbol: md.symbol, price: md.price, rsi: md.indicators.RSI },
        votes: {
            gemini: proposals.gemini?.action,
            quant: proposals.math?.action,
            local: proposals.local?.action
        },
        decision: signal.action,
        ts: Date.now(),
    };

    // Generate Hash
    try {
        (signal as any).proofHash = keccak256(Buffer.from(JSON.stringify(proofPayload)));
    } catch (e) {
        (signal as any).proofHash = "0x0000000000000000000000000000000000000000"; // Fail safe
    }

    return signal;
}
