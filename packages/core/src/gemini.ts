import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { logger } from './logger.js';

// Model fallback chain (confirmed working Gemini 2.5 models)
// Model fallback chain (confirmed working Gemini 2.5 models)
// Model fallback chain (Updated for Jan 2026 Stability)
const MODEL_FALLBACK_CHAIN = [
    'gemini-1.5-flash-8b',        // Fast & Cheap (High Throughput)
    'gemini-2.0-flash-exp',       // 2.0 Experimental (Often Rate Limited)
    'gemini-1.5-flash',           // Standard 1.5
    'gemini-pro'                  // Legacy Fallback
] as const;

export interface GeminiConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
}

export interface GeminiResponse {
    data: string;
    modelUsed: string;
}

/**
 * Gemini AI Client for WAlphaHunter
 * Implements multi-model fallback strategy with JSON repair capabilities
 */
export class GeminiClient {
    private genAI: GoogleGenerativeAI;
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';

        if (!this.apiKey) {
            logger.warn('GEMINI_API_KEY not configured. AI features will be limited.');
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    /**
     * Generate content with automatic model fallback
     */
    async generateContent(
        prompt: string,
        config: GeminiConfig = {}
    ): Promise<GeminiResponse> {
        const defaultConfig: GeminiConfig = {
            temperature: 0.9,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 4096, // Increased to handle longer responses
            ...config
        };

        let lastError: Error | null = null;

        // Try each model in the fallback chain
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                // Add explicit delay if we are retrying after a rate limit
                // We reduce this to a short pause because we are switching models, and quotas are often per-model.
                if (lastError?.message?.includes('429')) {
                    logger.warn('Rate Limit hit on previous model. Switching to next model (cooling down)...');
                    // Short pause to allow system to breathe, but not block trading
                    await new Promise(resolve => setTimeout(resolve, 12000));
                }

                logger.info(`Attempting to generate content with model: ${modelName}`);

                const model = this.genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: defaultConfig
                });

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                if (!text || text.trim().length === 0) {
                    throw new Error('Empty response from model');
                }

                logger.info(`Successfully generated content with model: ${modelName}`);

                return {
                    data: text,
                    modelUsed: modelName
                };

            } catch (error: any) {
                lastError = error;
                logger.warn(`Model ${modelName} failed: ${error.message}`);

                // If it's a quota/permission error, try next model
                if (error.message?.includes('429') ||
                    error.message?.includes('quota') ||
                    error.message?.includes('permission') ||
                    error.message?.includes('not found')) {
                    continue;
                }

                // For other errors, still try next model but log it
                logger.error(`Unexpected error with ${modelName}:`, error);
            }
        }

        // All models failed
        const errorMsg = `All Gemini models failed. Last error: ${lastError?.message}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    /**
     * Generate JSON content with automatic repair and validation
     */
    async generateJSON<T = any>(
        prompt: string,
        config: GeminiConfig = {}
    ): Promise<{ data: T; modelUsed: string }> {
        // Enhance prompt to ensure JSON-only output
        const jsonPrompt = `${prompt}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown, no explanations, no code blocks
- Do not wrap the response in \`\`\`json or any other formatting
- Ensure all JSON is properly closed (all brackets, braces, quotes)
- If the response is long, prioritize completing the JSON structure over adding more content
- Response must be parseable by JSON.parse()`;

        const response = await this.generateContent(jsonPrompt, config);

        // Try to parse JSON with multiple strategies
        const parsed = this.parseJSONWithRepair(response.data);

        return {
            data: parsed as T,
            modelUsed: response.modelUsed
        };
    }

    /**
     * Parse JSON with automatic repair strategies
     */
    private parseJSONWithRepair(text: string): any {
        // Strategy 1: Direct parse
        try {
            return JSON.parse(text);
        } catch (e) {
            logger.warn('Strategy 1 (direct parse) failed, trying cleanup...');
        }

        // Strategy 2: Remove markdown code blocks
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        try {
            return JSON.parse(cleaned);
        } catch (e) {
            logger.warn('Strategy 2 (markdown removal) failed, trying extraction...');
        }

        // Strategy 3: Extract JSON from text
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                logger.warn('Strategy 3 (extraction) failed, trying repair...');
            }
        }

        // Strategy 4: Try to find array
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try {
                return JSON.parse(arrayMatch[0]);
            } catch (e) {
                logger.warn('Strategy 4 (array extraction) failed, trying truncation repair...');
            }
        }

        // Strategy 5: Repair truncated JSON
        try {
            const repaired = this.repairTruncatedJSON(cleaned);
            return JSON.parse(repaired);
        } catch (e) {
            logger.error('All JSON parsing strategies failed');
            throw new Error(`Failed to parse JSON response: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }

    /**
     * Attempt to repair truncated JSON by closing open structures
     */
    private repairTruncatedJSON(json: string): string {
        let repaired = json.trim();

        // Count opening and closing brackets/braces
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;
        const openQuotes = (repaired.match(/"/g) || []).length;

        // Close unclosed strings
        if (openQuotes % 2 !== 0) {
            repaired += '"';
        }

        // Close unclosed arrays
        for (let i = 0; i < (openBrackets - closeBrackets); i++) {
            repaired += ']';
        }

        // Close unclosed objects
        for (let i = 0; i < (openBraces - closeBraces); i++) {
            repaired += '}';
        }

        logger.info('Attempted JSON repair - added closing brackets/braces');
        return repaired;
    }

    /**
     * Generate trading signal using AI
     */
    async generateTradingSignal(marketData: {
        symbol: string;
        price: number;
        volume?: number;
        indicators?: Record<string, number>;
    }): Promise<{
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        reasoning: string;
        modelUsed: string;
    }> {
        const prompt = `You are an expert cryptocurrency trading AI. Analyze the following market data and provide a trading signal.

Market Data:
- Symbol: ${marketData.symbol}
- Current Price: $${marketData.price}
${marketData.volume ? `- Volume: ${marketData.volume}` : ''}
${marketData.indicators ? `- Technical Indicators: ${JSON.stringify(marketData.indicators, null, 2)}` : ''}

Provide your analysis in the following JSON format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of your decision"
}`;

        const result = await this.generateJSON<{
            action: 'BUY' | 'SELL' | 'HOLD';
            confidence: number;
            reasoning: string;
        }>(prompt, {
            temperature: 0.7, // Lower temperature for more consistent trading signals
            maxOutputTokens: 1024
        });

        return {
            ...result.data,
            modelUsed: result.modelUsed
        };
    }

    /**
     * Check if client is configured
     */
    isConfigured(): boolean {
        return this.apiKey.length > 0;
    }
}

/**
 * Create a Gemini client instance
 */
export function createGeminiClient(apiKey?: string): GeminiClient {
    return new GeminiClient(apiKey);
}

/**
 * Singleton instance for convenience
 */
let geminiInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
    if (!geminiInstance) {
        geminiInstance = createGeminiClient();
    }
    return geminiInstance;
}
