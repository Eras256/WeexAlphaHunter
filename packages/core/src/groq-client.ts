import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

export class GroqClient {
    private http: AxiosInstance;
    private model: string;

    constructor(model: string = 'llama3-8b-8192') {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('GROQ_API_KEY not set in environment');
        }
        this.model = model;
        this.http = axios.create({
            baseURL: 'https://api.groq.com/openai/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // Groq is fast
        });
    }

    async completions(params: { prompt: string }): Promise<string> {
        if (!process.env.GROQ_API_KEY) return "HOLD"; // Fail safe

        const payload = {
            model: this.model,
            messages: [{ role: 'user', content: params.prompt }],
            temperature: 0.6
        };
        try {
            const resp = await this.http.post('/chat/completions', payload);
            const content = resp.data?.choices?.[0]?.message?.content;
            return content ? content.trim() : '';
        } catch (e: any) {
            console.error(`[Groq] Error (${this.model}): Status ${e.response?.status} | Msg: ${JSON.stringify(e.response?.data)}`);
            throw e;
        }
    }
}
