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

interface MarketAnalysisRequest {
    symbol?: string;
    timeframe?: string;
    includeRecommendations?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body: MarketAnalysisRequest = await request.json();

        const symbol = body.symbol || 'BTC/USDT';
        const timeframe = body.timeframe || '24h';
        const includeRecommendations = body.includeRecommendations !== false;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY not configured' },
                { status: 503 }
            );
        }

        const prompt = `You are an expert cryptocurrency market analyst. Provide a comprehensive market analysis for ${symbol} over the ${timeframe} timeframe.

${includeRecommendations ? `
Include:
1. Current market sentiment and trend analysis
2. Key support and resistance levels
3. Volume analysis
4. Risk factors to consider
5. Trading recommendations (at least 3)
6. Potential risks (at least 3)
` : `
Include:
1. Current market sentiment and trend analysis
2. Key support and resistance levels
3. Volume analysis
4. Risk factors to consider
`}

Return your analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence overview of current market conditions",
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "trendStrength": 0.0 to 1.0,
  "analysis": "Detailed analysis (150-200 words)",
  "keyLevels": {
    "support": [number, number],
    "resistance": [number, number]
  },
  ${includeRecommendations ? `
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", ...],
  "risks": ["risk 1", "risk 2", "risk 3", ...]
  ` : ''}
}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown, no explanations
- Do not wrap in code blocks
- Ensure all JSON is properly closed
- All arrays must have at least the minimum number of items specified`;

        let lastError: Error | null = null;

        // Try each model in fallback chain
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.8,
                        topP: 0.9,
                        topK: 40,
                        maxOutputTokens: 4096,
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
                        ...data,
                        symbol,
                        timeframe,
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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC/USDT';
    const timeframe = searchParams.get('timeframe') || '24h';

    // Redirect to POST with default params
    return POST(new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ symbol, timeframe })
    }));
}
