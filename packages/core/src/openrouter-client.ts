import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local (so we can read OPENROUTER_API_KEY)
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

/**
 * Minimal OpenRouter client that follows the OpenAI compatible chat completion schema.
 * It is deliberately lightweight – just enough for the MoA engine to call a model.
 */
export class OpenRouterClient {
    private http: AxiosInstance;
    private model: string;

    constructor(model: string) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY not set in environment');
        }
        this.model = model;
        this.http = axios.create({
            baseURL: 'https://openrouter.ai/api/v1', // Ensure this is correct
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/AlphaHunter', // OpenRouter often requires these
                'X-Title': 'AlphaHunter'
            },
            timeout: 15000,
        });
    }

    /**
     * Calls the chat/completions endpoint with a single user message.
     * Returns the raw assistant message string.
     */
    async completions(params: { prompt: string }): Promise<string> {
        const payload = {
            model: this.model,
            messages: [{ role: 'user', content: params.prompt }],
        };
        try {
            const resp = await this.http.post('/chat/completions', payload);
            const content = resp.data?.choices?.[0]?.message?.content;
            if (!content) throw new Error('Empty response');
            return content.trim();
        } catch (e: any) {
            // Enhanced debug logging
            const status = e.response?.status;
            const data = JSON.stringify(e.response?.data || {});
            console.error(`[OpenRouter] Error (${this.model}): Status ${status} | Data: ${data}`);
            throw e;
        }
    }

}
