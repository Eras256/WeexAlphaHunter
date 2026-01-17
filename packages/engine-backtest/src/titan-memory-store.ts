
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * TITAN V5 MEMORY CORE (Native TypeScript Implementation)
 * Replaces ChromaDB to avoid Python dependency hell in restricted environments.
 * Uses In-Memory Vector Search + JSON Persistence.
 */

interface MemoryFragment {
    id: string;
    embedding: number[]; // 768-dim vector from DeepSeek
    metadata: {
        timestamp: number;
        symbol: string;
        action: 'BUY' | 'SELL';
        outcome: 'WIN' | 'LOSS' | 'PENDING';
        pnl: number;
        context: string; // "RSI: 30, Trend: BULLISH..."
    };
}

export class TitanMemoryStore {
    private memories: MemoryFragment[] = [];
    private dbPath: string;
    private initialized: boolean = false;

    constructor(baseDir: string = './data') {
        this.dbPath = path.join(baseDir, 'titan_memory_v5.json');
        // Ensure data dir exists
        if (!fs.existsSync(baseDir)) {
            try { fs.mkdirSync(baseDir, { recursive: true }); } catch (e) { }
        }
    }

    public async init() {
        if (this.initialized) return;

        try {
            if (fs.existsSync(this.dbPath)) {
                const raw = fs.readFileSync(this.dbPath, 'utf-8');
                this.memories = JSON.parse(raw);
                console.log(`🧠 [TitanMemory] Loaded ${this.memories.length} neural patterns from disk.`);
            } else {
                console.log(`🧠 [TitanMemory] No existing memory found. Starting fresh tabula rasa.`);
                this.memories = [];
                this.save();
            }
            this.initialized = true;
        } catch (error) {
            console.error(`❌ [TitanMemory] Load Failed: ${error}`);
            this.memories = [];
        }
    }

    private save() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.memories, null, 2));
        } catch (e) {
            console.error(`❌ [TitanMemory] Save Failed: ${e}`);
        }
    }

    /**
     * Store a new trading experience
     */
    public async remember(
        embedding: number[],
        metadata: MemoryFragment['metadata']
    ): Promise<string> {
        const id = uuidv4();
        const fragment: MemoryFragment = { id, embedding, metadata };

        this.memories.push(fragment);
        this.save(); // Persist immediately

        return id;
    }

    /**
     * Update an existing memory (e.g., when a trade closes and we know the outcome)
     */
    public async updateOutcome(id: string, outcome: 'WIN' | 'LOSS', pnl: number) {
        const mem = this.memories.find(m => m.id === id);
        if (mem) {
            mem.metadata.outcome = outcome;
            mem.metadata.pnl = pnl;
            this.save();
            console.log(`🧠 [TitanMemory] Updated memory ${id.substring(0, 8)} -> ${outcome} ($${pnl})`);
        }
    }

    /**
     * Find similar historical situations using Cosine Similarity
     */
    public async recall(queryEmbedding: number[], limit: number = 5): Promise<MemoryFragment[]> {
        if (this.memories.length === 0) return [];

        // Calculate similarity for all memories
        const scored = this.memories.map(mem => {
            return {
                memory: mem,
                score: this.cosineSimilarity(queryEmbedding, mem.embedding)
            };
        });

        // Sort by similarity (descending)
        scored.sort((a, b) => b.score - a.score);

        // Return top N
        return scored.slice(0, limit).map(s => s.memory);
    }

    /**
     * Determine Win Rate in similar situations
     */
    public async analyzeScenario(queryEmbedding: number[]): Promise<{
        winRate: number,
        confidence: number,
        similarCount: number,
        advice: string
    }> {
        const similar = await this.recall(queryEmbedding, 10);
        if (similar.length === 0) {
            return { winRate: 0.5, confidence: 0, similarCount: 0, advice: "New Situation" };
        }

        const closedTrades = similar.filter(m => m.metadata.outcome !== 'PENDING');
        if (closedTrades.length === 0) {
            return { winRate: 0.5, confidence: 0, similarCount: similar.length, advice: "No historical outcomes yet" };
        }

        const wins = closedTrades.filter(m => m.metadata.outcome === 'WIN').length;
        const winRate = wins / closedTrades.length;

        // Confidence grows with sample size (max at 10 samples)
        const confidence = Math.min(1.0, closedTrades.length / 10);

        return {
            winRate,
            confidence,
            similarCount: closedTrades.length,
            advice: winRate > 0.6 ? "BULLISH HISTORY" : winRate < 0.4 ? "BEARISH HISTORY" : "UNCERTAIN HISTORY"
        };
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
    }
}
