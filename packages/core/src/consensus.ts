
import { GeminiClient } from './gemini.js';
import { logger } from './logger.js';
import { localAI } from './local-ai.js';

interface TradingSignal {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
}

interface AIResponse {
    provider: string;
    model: string;
    signal: TradingSignal;
    raw: string;
}

export class ConsensusEngine {
    private gemini: GeminiClient;
    private groqKey?: string;
    private openRouterKey?: string;

    constructor(gemini: GeminiClient) {
        this.gemini = gemini;
        this.groqKey = process.env.GROQ_API_KEY;
        this.openRouterKey = process.env.OPENROUTER_API_KEY;
    }

    /**
     * Generate a consensus trading signal using multiple AI models
     */


    private async callGemini(marketData: any): Promise<AIResponse | null> {
        try {
            const result = await this.gemini.generateTradingSignal(marketData);
            return {
                provider: 'Google',
                model: result.modelUsed,
                signal: {
                    action: result.action,
                    confidence: result.confidence,
                    reasoning: result.reasoning
                },
                raw: JSON.stringify(result)
            };
        } catch (e: any) {
            logger.error(`[Consensus] Gemini Failed: ${e.message}`);
            return null;
        }
    }

    private async callGroq(prompt: string): Promise<AIResponse | null> {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: 'You are a trading bot. Return ONLY JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1
                })
            });

            if (!response.ok) throw new Error(`Status ${response.status}`);
            const json: any = await response.json();
            const content = json.choices[0].message.content;
            const signal = this.parseSignal(content);

            return {
                provider: 'Groq',
                model: 'llama-3.1-8b-instant',
                signal,
                raw: content
            };
        } catch (e: any) {
            logger.warn(`[Consensus] Groq Failed: ${e.message}`);
            return null;
        }
    }

    private async callOpenRouter(prompt: string): Promise<AIResponse | null> {
        try {
            // "Council Member 1": DeepSeek V3 (Logic/Math Expert)
            const model = 'deepseek/deepseek-chat';
            // Fallback Logic: If DeepSeek fails, try Qwen 2.5 (Another top coder)
            const backupModel = 'qwen/qwen-2.5-72b-instruct';

            let currentModel = model;
            let response = await this.fetchOpenRouter(prompt, currentModel);

            if (!response) {
                logger.warn(`[Consensus] DeepSeek failed, trying Qwen...`);
                currentModel = backupModel;
                response = await this.fetchOpenRouter(prompt, currentModel);
            }

            if (!response) return null;

            return {
                provider: 'OpenRouter',
                model: currentModel.split('/')[1] || currentModel,
                signal: this.parseSignal(response),
                raw: response
            };
        } catch (e: any) {
            logger.warn(`[Consensus] OpenRouter Failed: ${e.message}`);
            return null;
        }
    }

    private async fetchOpenRouter(prompt: string, model: string): Promise<string | null> {
        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://w-alpha-hunter.vercel.app',
                    'X-Title': 'WAlphaHunter'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are a crypto trading AI. Return ONLY JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1
                })
            });
            if (!res.ok) return null;
            const json: any = await res.json();
            return json.choices[0].message.content;
        } catch (e) {
            return null;
        }
    }

    // "Council Member 2": Groq (Speed - Llama 3)
    // "Council Member 3": Gemini (Context)

    // "Council Member 4": Groq 2 (Mixtral 8x7b - The Generalist)
    // We add a SECOND call to Groq using a different model to add diversity.
    private async callGroq2(prompt: string): Promise<AIResponse | null> {
        if (!this.groqKey) return null;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.groqKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768', // Different architecture than Llama
                    messages: [{ role: 'system', content: 'You are a trading bot. Return ONLY JSON.' }, { role: 'user', content: prompt }],
                    temperature: 0.1
                })
            });
            if (!response.ok) return null;
            const json: any = await response.json();
            const content = json.choices[0].message.content;
            return {
                provider: 'Groq',
                model: 'mixtral-8x7b',
                signal: this.parseSignal(content),
                raw: content
            };
        } catch (e: any) { return null; }
    }

    /**
     * Generate a consensus trading signal using multiple AI models
     * "The Council of 5" Architecture
     */
    async generateConsensusSignal(marketData: any): Promise<any> {
        const prompt = `You are an expert cryptocurrency trading AI. Analyze data and provide a signal (BUY/SELL/HOLD). Return ONLY JSON. Market Data: Symbol: ${marketData.symbol}, Price: ${marketData.price}, Indicators: ${JSON.stringify(marketData.indicators || {})}`;

        const promises: Promise<AIResponse | null>[] = [];

        // 1. Gemini (Google)
        promises.push(this.callGemini(marketData));

        // 2. Llama 3 (Groq)
        if (this.groqKey) {
            promises.push(this.callGroq(prompt));
        }

        // 3. DeepSeek (OpenRouter)
        if (this.openRouterKey) {
            promises.push(this.callOpenRouter(prompt));
        }

        // DELAY for secondary calls to avoid Rate Limits (Free Tier optimization)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Mixtral (Groq) - NEW
        if (this.groqKey) {
            promises.push(this.callGroq2(prompt));
        }

        // 5. OpenRouter Backup (Gemini 2 via OpenRouter)
        if (this.openRouterKey) {
            promises.push(this.fetchOpenRouter(prompt, 'google/gemini-2.0-flash-exp:free').then(raw => {
                if (!raw) return null;
                return { provider: 'OpenRouter', model: 'gemini-2.0-flash-free', signal: this.parseSignal(raw), raw };
            }));
        }

        // 6. LOCAL INTELLIGENCE (The "Warrior" Engine) - GUARANTEED SIGNAL
        // This runs locally on CPU, 0 latency, 100% uptime.
        promises.push(localAI.generateSignal(marketData).then(signal => ({
            provider: 'Local',
            model: 'titan-hybrid-v2',
            signal: {
                action: signal.action,
                confidence: signal.confidence,
                reasoning: signal.reasoning
            },
            raw: JSON.stringify(signal)
        })));

        const results = await Promise.all(promises);
        const validResults = results.filter((r): r is AIResponse => r !== null);

        if (validResults.length === 0) throw new Error("All AI models failed.");

        return this.calculateConsensus(validResults);
    }

    private parseSignal(text: string): TradingSignal {
        // reuse Gemini's robust parsing if possible, or simple regex
        // Since we are inside 'core', we can't easily access private method parseJSONWithRepair of GeminiClient from here unless we duplicate logic or make it public.
        // For now, simple JSON parse + crude cleanup
        try {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleaned);
            return {
                action: json.action || 'HOLD',
                confidence: Number(json.confidence) || 0.5,
                reasoning: json.reasoning || 'No reasoning provided'
            };
        } catch (e) {
            // Fallback: try to regex action
            if (text.includes('BUY')) return { action: 'BUY', confidence: 0.5, reasoning: 'Parsed from text' };
            if (text.includes('SELL')) return { action: 'SELL', confidence: 0.5, reasoning: 'Parsed from text' };
            return { action: 'HOLD', confidence: 0.5, reasoning: 'Failed to parse JSON' };
        }
    }

    private calculateConsensus(results: AIResponse[]): {
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        reasoning: string;
        modelUsed: string;
        consensusScore: number;
        details: any;
    } {
        let buy = 0, sell = 0, hold = 0;
        let buyConf = 0, sellConf = 0, holdConf = 0;

        results.forEach(r => {
            if (r.signal.action === 'BUY') { buy++; buyConf += r.signal.confidence; }
            else if (r.signal.action === 'SELL') { sell++; sellConf += r.signal.confidence; }
            else { hold++; holdConf += r.signal.confidence; }
        });

        const total = results.length;
        let finalAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        let consensusScore = 0;
        let avgConf = 0;

        if (buy > sell && buy > hold) {
            finalAction = 'BUY';
            consensusScore = (buy / total) * 100;
            avgConf = buyConf / buy;
        } else if (sell > buy && sell > hold) {
            finalAction = 'SELL';
            consensusScore = (sell / total) * 100;
            avgConf = sellConf / sell;
        } else {
            finalAction = 'HOLD';
            consensusScore = (hold / total) * 100;
            avgConf = holdConf / hold;
        }

        // Require majority (e.g., > 50% or explicitly defined threshold)
        // If only 1 model, score is 100%.

        const modelNames = results.map(r => `${r.provider}/${r.model}`).join(', ');

        return {
            action: finalAction,
            confidence: avgConf,
            reasoning: `Consensus of ${results.length} models (${modelNames}). Score: ${consensusScore.toFixed(0)}%. Primary reasoning: ${results[0].signal.reasoning}`,
            modelUsed: `Consensus (${modelNames})`,
            consensusScore,
            details: results.map(r => ({ model: r.model, action: r.signal.action }))
        };
    }
}

export function createConsensusEngine(geminiClient: GeminiClient): ConsensusEngine {
    return new ConsensusEngine(geminiClient);
}
