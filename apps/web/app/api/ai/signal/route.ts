import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
];

interface TradingSignalRequest {
    symbol: string;
    price: number;
    volume?: number;
    indicators?: Record<string, number>;
}

export async function POST(request: NextRequest) {
    try {
        const body: TradingSignalRequest = await request.json();

        if (!body.symbol || !body.price) {
            return NextResponse.json(
                { error: 'Missing required fields: symbol, price' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY not configured' },
                { status: 503 }
            );
        }

        const prompt = `You are an expert cryptocurrency trading AI. Analyze the following market data and provide a trading signal.

Market Data:
- Symbol: ${body.symbol}
- Current Price: $${body.price}
${body.volume ? `- Volume: ${body.volume}` : ''}
${body.indicators ? `- Technical Indicators: ${JSON.stringify(body.indicators, null, 2)}` : ''}

Provide your analysis in the following JSON format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of your decision"
}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown, no explanations, no code blocks
- Do not wrap the response in \`\`\`json or any other formatting
- Ensure all JSON is properly closed
- Response must be parseable by JSON.parse()`;

        let lastError: Error | null = null;

        // Try each model in fallback chain
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 40,
                        maxOutputTokens: 1024,
                    }
                });

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                // Parse JSON
                let cleaned = text.trim();
                if (cleaned.startsWith('```json')) {
                    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
                } else if (cleaned.startsWith('```')) {
                    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
                }

                const data = JSON.parse(cleaned);

                return NextResponse.json({
                    success: true,
                    data: {
                        action: data.action,
                        confidence: data.confidence,
                        reasoning: data.reasoning,
                        modelUsed: modelName,
                        timestamp: new Date().toISOString()
                    }
                });

            } catch (error: any) {
                lastError = error;
                console.warn(`Model ${modelName} failed:`, error.message);
                continue;
            }
        }

        // All models failed
        return NextResponse.json(
            {
                error: 'All AI models failed',
                details: lastError?.message
            },
            { status: 500 }
        );

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
