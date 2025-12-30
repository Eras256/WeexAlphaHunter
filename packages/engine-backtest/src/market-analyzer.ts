import { createGeminiClient, logger } from '@wah/core';
import { WeexClient } from '../../engine-compliance/src/weex-client.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

interface MarketSnapshot {
    symbol: string;
    timestamp: string;
    price: number;
    volume: number;
    change24h: number;
}

interface MarketAnalysis {
    timestamp: string;
    symbol: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    trendStrength: number;
    summary: string;
    analysis: string;
    recommendations: string[];
    risks: string[];
    keyLevels: {
        support: number[];
        resistance: number[];
    };
}

/**
 * Automated Market Analysis Service
 * 
 * Generates comprehensive market analysis using Gemini AI
 * for multiple cryptocurrency pairs
 */
class MarketAnalyzer {
    private gemini = createGeminiClient();
    private outputDir: string;

    constructor() {
        this.outputDir = path.join(process.cwd(), '../../data/analysis');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Fetch real market data from WEEX API
     */
    private async getRealMarketSnapshot(symbol: string): Promise<MarketSnapshot | null> {
        try {
            // We use a temporary public client to fetch data without needing API keys for this step if possible, 
            // but WeexClient handles auth if keys are present.
            const client = new WeexClient("mock"); // Using 'mock' mode client but we will override getTicker to force fetch

            // 1. Get Ticker for Price
            // WeexClient.getTicker tries HTTP request even in mock mode if implemented correctly, 
            // but let's implement a direct fetch here to be 100% sure we get REAL data.
            const tickerUrl = `https://api-contract.weex.com/capi/v2/market/ticker?symbol=${symbol}`;
            const tickerRes = await fetch(tickerUrl);
            const tickerData = await tickerRes.json();

            // 2. Get 24h Stats (often in ticker or separate endpoint)
            // WEEX Ticker response format: { symbol, last, high_24h, low_24h, volume_24h, priceChangePercent ... }
            if (!tickerData || !tickerData.data) {
                logger.warn(`Failed to fetch ticker for ${symbol}`);
                return null;
            }

            const data = tickerData.data;
            const currentPrice = parseFloat(data.last);
            const volume24h = parseFloat(data.volume_24h || data.base_volume || '0');
            const change24h = parseFloat(data.priceChangePercent || '0') * 100; // Typically decimal 0.05 -> 5%

            return {
                symbol,
                timestamp: new Date().toISOString(),
                price: currentPrice,
                volume: volume24h,
                change24h: change24h
            };
        } catch (error) {
            logger.error(`Error fetching real data for ${symbol}: ${error}`);
            return null;
        }
    }

    /**
     * Analyze a single market using Gemini AI
     */
    async analyzeMarket(symbol: string): Promise<MarketAnalysis | null> {
        try {
            const snapshot = await this.getRealMarketSnapshot(symbol);
            if (!snapshot) {
                logger.warn(`Skipping analysis for ${symbol} due to missing data`);
                return null;
            }

            logger.info(`📊 Analyzing ${symbol}...`);
            logger.info(`  Price: $${snapshot.price.toFixed(2)}`);
            logger.info(`  24h Change: ${snapshot.change24h > 0 ? '+' : ''}${snapshot.change24h.toFixed(2)}%`);

            const prompt = `You are an expert cryptocurrency market analyst. Analyze ${symbol} with the following data:

Current Price: $${snapshot.price.toFixed(2)}
24h Volume: $${snapshot.volume.toFixed(0)}
24h Change: ${snapshot.change24h > 0 ? '+' : ''}${snapshot.change24h.toFixed(2)}%

Provide a comprehensive market analysis in JSON format:
{
  "summary": "Brief 2-3 sentence overview",
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "trendStrength": 0.0 to 1.0,
  "analysis": "Detailed analysis (150-200 words)",
  "keyLevels": {
    "support": [number, number],
    "resistance": [number, number]
  },
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "risks": ["risk1", "risk2", "risk3", "risk4", "risk5"]
}

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks.`;

            const result = await this.gemini.generateJSON<{
                summary: string;
                sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
                trendStrength: number;
                analysis: string;
                keyLevels: {
                    support: number[];
                    resistance: number[];
                };
                recommendations: string[];
                risks: string[];
            }>(prompt, {
                temperature: 0.8,
                maxOutputTokens: 4096
            });

            logger.info(`  ✅ Analysis complete (Model: ${result.modelUsed})`);
            logger.info(`  Sentiment: ${result.data.sentiment}`);
            logger.info(`  Trend Strength: ${(result.data.trendStrength * 100).toFixed(0)}%`);

            return {
                timestamp: snapshot.timestamp,
                symbol,
                ...result.data
            };

        } catch (error: any) {
            logger.error(`  ❌ Failed to analyze ${symbol}: ${error.message}`);
            return null;
        }
    }

    /**
     * Run automated analysis for multiple markets
     */
    async runAutomatedAnalysis(symbols: string[]) {
        logger.info('🤖 Starting Automated Market Analysis\n');
        logger.info('═'.repeat(60));

        if (!this.gemini.isConfigured()) {
            logger.error('❌ GEMINI_API_KEY not configured');
            process.exit(1);
        }

        const analyses: MarketAnalysis[] = [];
        const timestamp = new Date().toISOString().split('T')[0];

        for (const symbol of symbols) {
            const analysis = await this.analyzeMarket(symbol);

            if (analysis) {
                analyses.push(analysis);
            }

            // Rate limiting: 2 seconds between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Save results
        const outputFile = path.join(this.outputDir, `market_analysis_${timestamp}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(analyses, null, 2));

        // Generate summary report
        logger.info('\n' + '═'.repeat(60));
        logger.info('📈 MARKET ANALYSIS SUMMARY');
        logger.info('═'.repeat(60));

        const bullish = analyses.filter(a => a.sentiment === 'BULLISH').length;
        const bearish = analyses.filter(a => a.sentiment === 'BEARISH').length;
        const neutral = analyses.filter(a => a.sentiment === 'NEUTRAL').length;

        logger.info(`Total Markets Analyzed: ${analyses.length}`);
        logger.info(`Bullish Sentiment: ${bullish}`);
        logger.info(`Bearish Sentiment: ${bearish}`);
        logger.info(`Neutral Sentiment: ${neutral}`);
        logger.info(`\nReport saved to: ${outputFile}`);
        logger.info('═'.repeat(60));

        // Display individual analyses
        logger.info('\n📊 DETAILED ANALYSIS:\n');

        for (const analysis of analyses) {
            logger.info(`${analysis.symbol}:`);
            logger.info(`  Sentiment: ${analysis.sentiment}`);
            logger.info(`  Summary: ${analysis.summary}`);
            logger.info(`  Top Recommendation: ${analysis.recommendations[0]}`);
            logger.info(`  Key Risk: ${analysis.risks[0]}`);
            logger.info('');
        }

        logger.info('✅ Automated analysis complete!\n');
    }
}

// Main execution
async function main() {
    const analyzer = new MarketAnalyzer();

    const symbols = [
        'cmt_btcusdt',
        'cmt_ethusdt',
        'cmt_solusdt',
        'cmt_bnbusdt',
        'cmt_xrpusdt'
    ];

    await analyzer.runAutomatedAnalysis(symbols);
}

main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
