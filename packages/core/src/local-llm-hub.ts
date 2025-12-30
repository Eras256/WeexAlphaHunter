import { logger } from './logger.js';
import axios from 'axios';

/**
 * LOCAL LLM HUB (2025 Architecture)
 * 
 * Manages connections to high-performance local inference servers (Ollama, vLLM, Llama.cpp).
 * Prioritizes 2025 State-of-the-Art models:
 * - DeepSeek-V3 (Reasoning)
 * - Qwen 2.5/3 (Coding/Logic)
 * - Llama 4 / 3.3 (General)
 */
export class LocalLlmHub {
    private endpoints = [
        "http://localhost:11434/api/generate", // Ollama
        "http://localhost:8080/completion",    // Llama.cpp
        "http://localhost:1234/v1/completions" // LM Studio
    ];

    private activeModel = "DeepSeek-V3-Distill-Q4_K_M"; // Preferred 2025 Model

    constructor() { }

    /**
     * Checks if a local inference server is running.
     * Returns the endpoint if alive, else null.
     */
    async findLocalProvider(): Promise<string | null> {
        for (const endpoint of this.endpoints) {
            try {
                // Quick ping (timeout 500ms)
                await axios.get(endpoint.replace('/api/generate', '').replace('/completion', ''), { timeout: 500 });
                return endpoint;
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    /**
     * Generates reasoning using Local AI.
     * If no local AI is found, simulates a "Quantized Logic Core" response (Fallback).
     */
    async generateReasoning(context: string): Promise<string> {
        const provider = await this.findLocalProvider();

        if (provider) {
            try {
                // Real local inference call
                const response = await axios.post(provider, {
                    model: this.activeModel,
                    prompt: `[INST] You are a specialized crypto trading bot. Analyze this context and provide a concise reasoning: ${context} [/INST]`,
                    stream: false,
                    temperature: 0.2
                }, { timeout: 10000 });

                return response.data.response || response.data.content || "Local AI Error";
            } catch (e) {
                logger.warn(`Local LLM failed despite ping: ${(e as Error).message}`);
            }
        }

        // SIMULATION / FALLBACK (The "Quantized Logic Core")
        // simulating a structured reasoning process based on the input context string.
        return this.simulateThinking(context);
    }

    /**
     * "Simulated Thinking"
     * Parses the math context and generates a plausible AI response.
     * This ensures the system always has "Thoughts" even without 24GB VRAM.
     */
    private simulateThinking(context: string): string {
        // Extract basic signals from the context string
        const rsiMatch = context.match(/RSI \(14\): (\d+\.\d+)/);
        const rsi = rsiMatch ? parseFloat(rsiMatch[1]) : 50;

        const trendMatch = context.match(/Computed Trend: (\w+)/);
        const trend = trendMatch ? trendMatch[1] : "NEUTRAL";

        // Generate "Chain of Thought"
        const steps = [
            `1. [Perception] Analyzed market data. RSI is ${rsi}. Trend is ${trend}.`,
            `2. [Reflection] ${rsi > 70 ? "Market is Overheated." : rsi < 30 ? "Market is Undervalued." : "Market is Balanced."}`,
            `3. [Strategy] ${trend === "UPTRAIL" ? "Momentum supports longs." : "Momentum supports shorts/hedging."}`,
            `4. [Decision] Aligning with ${rsi < 45 ? "Accumulation" : rsi > 55 ? "Distribution" : "Observation"} protocol.`
        ];

        return steps.join(" ");
    }
}
