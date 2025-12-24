import { createGeminiClient, logger } from '@wah/core';
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
     * Generate market snapshot with simulated data
     */
    private generateMarketSnapshot(symbol: string): MarketSnapshot {
        const basePrices: Record<string, number> = {
            'BTC/USDT': 95000,
            'ETH/USDT': 3500,
            'SOL/USDT': 150,
            'BNB/USDT': 600,
            'XRP/USDT': 2.5
        };

        const basePrice = basePrices[symbol] || 100;
        const variation = (Math.random() - 0.5) * 0.05; // ±5%

        return {
            symbol,
            timestamp: new Date().toISOString(),
            price: basePrice * (1 + variation),
            volume: 1000000000 + Math.random() * 500000000,
            change24h: (Math.random() - 0.5) * 10 // ±5%
        };
    }

    /**
     * Analyze a single market using Gemini AI
     */
    async analyzeMarket(symbol: string): Promise<MarketAnalysis | null> {
        try {
            const snapshot = this.generateMarketSnapshot(symbol);

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
        'BTC/USDT',
        'ETH/USDT',
        'SOL/USDT',
        'BNB/USDT',
        'XRP/USDT'
    ];

    await analyzer.runAutomatedAnalysis(symbols);
}

main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
