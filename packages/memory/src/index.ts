/**
 * TITAN V5: RAG MEMORY SYSTEM
 * 
 * Retrieval-Augmented Generation for Trading Decisions
 * Stores past trades and their outcomes to learn from history
 * 
 * @version 1.0.0
 */

import { ChromaClient, Collection } from 'chromadb';
import { pipeline, env } from '@xenova/transformers';

// Disable remote model downloads - use local cache only when available
env.allowRemoteModels = true;
env.cacheDir = './data/models/transformers';

export interface TradeMemory {
    id: string;
    timestamp: number;
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    entryPrice: number;
    exitPrice?: number;
    pnl?: number;
    marketConditions: {
        trend: string;
        volatility: number;
        adx: number;
        rsi: number;
        volume24h: number;
    };
    aiConfidence: number;
    modelUsed: string;
    outcome: 'WIN' | 'LOSS' | 'PENDING';
    reasoning: string;
}

export interface SimilarTrade {
    trade: TradeMemory;
    similarity: number;
    lesson: string;
}

export class TitanMemory {
    private client: ChromaClient;
    private collection: Collection | null = null;
    private embedder: any = null;
    private initialized = false;

    constructor() {
        this.client = new ChromaClient({
            path: './data/chromadb'
        });
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        console.log('🧠 Initializing Titan Memory (RAG)...');

        // Initialize embedding model
        console.log('   📦 Loading embedding model (all-MiniLM-L6-v2)...');
        this.embedder = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2',
            { quantized: true }
        );
        console.log('   ✅ Embedding model loaded');

        // Get or create collection
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: 'titan_trades',
                metadata: {
                    description: 'Historical trading decisions and outcomes',
                    version: 'v5'
                }
            });
            console.log(`   📊 Collection loaded: ${await this.collection.count()} memories`);
        } catch (error) {
            console.error('   ⚠️ ChromaDB not running, using in-memory fallback');
            // Fallback to ephemeral client
            this.client = new ChromaClient();
            this.collection = await this.client.getOrCreateCollection({
                name: 'titan_trades'
            });
        }

        this.initialized = true;
        console.log('✅ Titan Memory ready');
    }

    /**
     * Generate embedding for trade context
     */
    private async embed(text: string): Promise<number[]> {
        const output = await this.embedder(text, {
            pooling: 'mean',
            normalize: true
        });
        return Array.from(output.data);
    }

    /**
     * Create searchable text from trade memory
     */
    private tradeToText(trade: TradeMemory): string {
        return `
            Symbol: ${trade.symbol}
            Action: ${trade.action}
            Trend: ${trade.marketConditions.trend}
            Volatility: ${trade.marketConditions.volatility.toFixed(2)}
            ADX: ${trade.marketConditions.adx.toFixed(2)}
            RSI: ${trade.marketConditions.rsi.toFixed(2)}
            Confidence: ${trade.aiConfidence}
            Outcome: ${trade.outcome}
            PnL: ${trade.pnl ?? 'pending'}
            Reasoning: ${trade.reasoning}
        `.trim();
    }

    /**
     * Store a new trade in memory
     */
    async remember(trade: TradeMemory): Promise<void> {
        if (!this.collection) {
            await this.initialize();
        }

        const text = this.tradeToText(trade);
        const embedding = await this.embed(text);

        await this.collection!.add({
            ids: [trade.id],
            embeddings: [embedding],
            metadatas: [{
                symbol: trade.symbol,
                action: trade.action,
                outcome: trade.outcome,
                pnl: trade.pnl ?? 0,
                timestamp: trade.timestamp,
                confidence: trade.aiConfidence
            }],
            documents: [JSON.stringify(trade)]
        });

        console.log(`🧠 Remembered: ${trade.symbol} ${trade.action} → ${trade.outcome}`);
    }

    /**
     * Recall similar trades from memory
     */
    async recall(currentConditions: {
        symbol: string;
        trend: string;
        volatility: number;
        adx: number;
        rsi: number;
        proposedAction: 'BUY' | 'SELL' | 'HOLD';
    }, topK: number = 5): Promise<SimilarTrade[]> {
        if (!this.collection) {
            await this.initialize();
        }

        const count = await this.collection!.count();
        if (count === 0) {
            return [];
        }

        // Create query text
        const queryText = `
            Symbol: ${currentConditions.symbol}
            Action: ${currentConditions.proposedAction}
            Trend: ${currentConditions.trend}
            Volatility: ${currentConditions.volatility.toFixed(2)}
            ADX: ${currentConditions.adx.toFixed(2)}
            RSI: ${currentConditions.rsi.toFixed(2)}
        `.trim();

        const queryEmbedding = await this.embed(queryText);

        const results = await this.collection!.query({
            queryEmbeddings: [queryEmbedding],
            nResults: Math.min(topK, count),
            where: { symbol: currentConditions.symbol }
        });

        if (!results.documents?.[0]) {
            return [];
        }

        return results.documents[0].map((doc, i) => {
            const trade: TradeMemory = JSON.parse(doc as string);
            const similarity = 1 - (results.distances?.[0]?.[i] ?? 0);

            // Generate lesson from trade
            let lesson = '';
            if (trade.outcome === 'WIN' && trade.action === currentConditions.proposedAction) {
                lesson = `✅ Similar winning trade: ${trade.action} with ${trade.pnl?.toFixed(2)}% profit`;
            } else if (trade.outcome === 'LOSS' && trade.action === currentConditions.proposedAction) {
                lesson = `⚠️ WARNING: Similar trade LOST ${Math.abs(trade.pnl ?? 0).toFixed(2)}%. Consider HOLD.`;
            } else if (trade.outcome === 'WIN' && trade.action !== currentConditions.proposedAction) {
                lesson = `💡 In similar conditions, ${trade.action} won instead of ${currentConditions.proposedAction}`;
            } else {
                lesson = `📊 Historical reference: ${trade.action} → ${trade.outcome}`;
            }

            return { trade, similarity, lesson };
        });
    }

    /**
     * Get memory statistics
     */
    async getStats(): Promise<{
        totalTrades: number;
        wins: number;
        losses: number;
        avgPnlWins: number;
        avgPnlLosses: number;
    }> {
        if (!this.collection) {
            await this.initialize();
        }

        const all = await this.collection!.get();
        const trades: TradeMemory[] = (all.documents ?? [])
            .map(d => JSON.parse(d as string));

        const wins = trades.filter(t => t.outcome === 'WIN');
        const losses = trades.filter(t => t.outcome === 'LOSS');

        return {
            totalTrades: trades.length,
            wins: wins.length,
            losses: losses.length,
            avgPnlWins: wins.length > 0
                ? wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0) / wins.length
                : 0,
            avgPnlLosses: losses.length > 0
                ? losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0) / losses.length
                : 0
        };
    }

    /**
     * Check if we should avoid a trade based on past failures
     */
    async shouldAvoid(conditions: {
        symbol: string;
        proposedAction: 'BUY' | 'SELL';
        trend: string;
        volatility: number;
        adx: number;
        rsi: number;
    }): Promise<{ avoid: boolean; reason: string; confidence: number }> {
        const similar = await this.recall({
            ...conditions,
            proposedAction: conditions.proposedAction
        }, 10);

        if (similar.length < 3) {
            return {
                avoid: false,
                reason: 'Insufficient historical data',
                confidence: 0.3
            };
        }

        // Count outcomes for similar trades with same action
        const sameAction = similar.filter(s => s.trade.action === conditions.proposedAction);
        const losses = sameAction.filter(s => s.trade.outcome === 'LOSS');
        const lossRate = sameAction.length > 0 ? losses.length / sameAction.length : 0;

        if (lossRate > 0.6) {
            const avgLoss = losses.reduce((sum, l) => sum + Math.abs(l.trade.pnl ?? 0), 0) / losses.length;
            return {
                avoid: true,
                reason: `High loss rate (${(lossRate * 100).toFixed(0)}%) in similar conditions. Avg loss: ${avgLoss.toFixed(2)}%`,
                confidence: lossRate
            };
        }

        return {
            avoid: false,
            reason: `Win rate ${((1 - lossRate) * 100).toFixed(0)}% in similar conditions`,
            confidence: 1 - lossRate
        };
    }

    /**
     * Update trade outcome after position closes
     */
    async updateOutcome(tradeId: string, exitPrice: number, pnl: number): Promise<void> {
        if (!this.collection) {
            await this.initialize();
        }

        const result = await this.collection!.get({ ids: [tradeId] });
        if (result.documents?.[0]) {
            const trade: TradeMemory = JSON.parse(result.documents[0] as string);
            trade.exitPrice = exitPrice;
            trade.pnl = pnl;
            trade.outcome = pnl > 0 ? 'WIN' : 'LOSS';

            // Delete and re-add with updated data
            await this.collection!.delete({ ids: [tradeId] });
            await this.remember(trade);
        }
    }
}

// Singleton instance
let memoryInstance: TitanMemory | null = null;

export function getTitanMemory(): TitanMemory {
    if (!memoryInstance) {
        memoryInstance = new TitanMemory();
    }
    return memoryInstance;
}

export default TitanMemory;
