/**
 * TITAN V5 "APEX PREDATOR" - Unified Interface
 * 
 * Combines:
 * - RAG Memory (Trade Pattern Recall) - NOW USING VECTOR STORE
 * - Whale Sentinel (On-Chain Intelligence)
 * 
 * Self-contained implementation to avoid cross-package TS issues
 * 
 * @version 5.1.0 (Vector Enhanced)
 */

import { logger } from '../../core/src/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { TitanMemoryStore } from './titan-memory-store.js'; // 🧠 INTEGRATION

// Path for persistent memory storage (Legacy JSON)
const MEMORY_FILE_PATH = path.join(process.cwd(), 'data', 'titan_v5_memory.json');


// ============================================================================
// TYPES
// ============================================================================

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

export interface WhaleSignal {
    symbol: string;
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    reason: string;
    recentTxs: number;
    netFlow: number;
}

export interface V5Analysis {
    memoryCheck: {
        shouldAvoid: boolean;
        avoidReason: string | null;
        confidence: number;
        similarTrades: SimilarTrade[];
    };
    whaleSignal: WhaleSignal;
    whaleContrarian: {
        isContrarian: boolean;
        warning: string | null;
    };
    recommendation: {
        proceed: boolean;
        adjustedConfidence: number;
        warnings: string[];
        enhancements: string[];
    };
}

// ============================================================================
// SIMPLE IN-MEMORY STORAGE (Legacy / Quick Lookup)
// ============================================================================

class SimpleMemory {
    private trades: TradeMemory[] = [];
    private maxSize = 1000;

    constructor() {
        this.load();
    }

    private load() {
        try {
            if (fs.existsSync(MEMORY_FILE_PATH)) {
                const data = fs.readFileSync(MEMORY_FILE_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    this.trades = parsed;
                    logger.info(`🧠 [V5 Memory] Loaded ${this.trades.length} memories from disk.`);
                }
            } else {
                logger.info(`🧠 [V5 Memory] No existing memory file. Starting fresh.`);
            }
        } catch (e: any) {
            logger.warn(`⚠️ [V5 Memory] Failed to load memory: ${e.message}`);
        }
    }

    private save() {
        try {
            const dir = path.dirname(MEMORY_FILE_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(this.trades, null, 2));
        } catch (e: any) {
            logger.error(`⚠️ [V5 Memory] Failed to save memory: ${e.message}`);
        }
    }

    add(trade: TradeMemory): void {
        this.trades.push(trade);
        if (this.trades.length > this.maxSize) {
            this.trades.shift();
        }
        this.save();
    }

    findSimilar(conditions: {
        symbol: string;
        action: 'BUY' | 'SELL' | 'HOLD';
        trend: string;
        volatility: number;
        adx: number;
        rsi: number;
    }, topK: number = 5): SimilarTrade[] {
        const matching = this.trades
            .filter(t => t.symbol === conditions.symbol && t.outcome !== 'PENDING')
            .map(trade => {
                let score = 0;
                if (trade.action === conditions.action) score += 0.3;
                if (trade.marketConditions.trend === conditions.trend) score += 0.2;

                const volDiff = Math.abs(trade.marketConditions.volatility - conditions.volatility);
                score += Math.max(0, 0.15 - volDiff * 0.01);

                const adxDiff = Math.abs(trade.marketConditions.adx - conditions.adx);
                score += Math.max(0, 0.15 - adxDiff * 0.01);

                const rsiDiff = Math.abs(trade.marketConditions.rsi - conditions.rsi);
                score += Math.max(0, 0.2 - rsiDiff * 0.01);

                let lesson = '';
                if (trade.outcome === 'WIN' && trade.action === conditions.action) {
                    lesson = `✅ Similar winning trade: ${trade.action} with ${trade.pnl?.toFixed(2)}% profit`;
                } else if (trade.outcome === 'LOSS' && trade.action === conditions.action) {
                    lesson = `⚠️ WARNING: Similar trade LOST ${Math.abs(trade.pnl ?? 0).toFixed(2)}%`;
                } else {
                    lesson = `📊 Reference: ${trade.action} → ${trade.outcome}`;
                }

                return { trade, similarity: score, lesson };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);

        return matching;
    }

    getStats(): { totalTrades: number; wins: number; losses: number; avgPnlWins: number; avgPnlLosses: number } {
        const wins = this.trades.filter(t => t.outcome === 'WIN');
        const losses = this.trades.filter(t => t.outcome === 'LOSS');

        return {
            totalTrades: this.trades.length,
            wins: wins.length,
            losses: losses.length,
            avgPnlWins: wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0,
            avgPnlLosses: losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0
        };
    }

    updateOutcome(tradeId: string, exitPrice: number, pnl: number): void {
        const trade = this.trades.find(t => t.id === tradeId);
        if (trade) {
            trade.exitPrice = exitPrice;
            trade.pnl = pnl;
            trade.outcome = pnl > 0 ? 'WIN' : 'LOSS';
            this.save();
        }
    }
}


// ============================================================================
// WHALE SENTINEL (API-based) - Multi-Symbol Support
// ============================================================================

type TrackableSymbol = 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'DOGE' | 'LTC' | 'ADA' | 'BNB';

const SYMBOL_MAP: Record<string, TrackableSymbol> = {
    'btc': 'BTC', 'btcusdt': 'BTC', 'cmt_btcusdt': 'BTC',
    'eth': 'ETH', 'ethusdt': 'ETH', 'cmt_ethusdt': 'ETH',
    'sol': 'SOL', 'solusdt': 'SOL', 'cmt_solusdt': 'SOL',
    'xrp': 'XRP', 'xrpusdt': 'XRP', 'cmt_xrpusdt': 'XRP',
    'doge': 'DOGE', 'dogeusdt': 'DOGE', 'cmt_dogeusdt': 'DOGE',
    'ltc': 'LTC', 'ltcusdt': 'LTC', 'cmt_ltcusdt': 'LTC',
    'ada': 'ADA', 'adausdt': 'ADA', 'cmt_adausdt': 'ADA',
    'bnb': 'BNB', 'bnbusdt': 'BNB', 'cmt_bnbusdt': 'BNB'
};

const WHALE_THRESHOLDS: Record<TrackableSymbol, number> = {
    'BTC': 10_000_000,
    'ETH': 5_000_000,
    'BNB': 2_000_000,
    'SOL': 2_000_000,
    'XRP': 1_000_000,
    'ADA': 1_000_000,
    'LTC': 1_000_000,
    'DOGE': 500_000
};


class WhaleSentinel {
    private cache: Map<string, { data: WhaleSignal; timestamp: number }> = new Map();
    private cacheTTL = 120000; // 2 minutes

    parseSymbol(rawSymbol: string): TrackableSymbol | null {
        const normalized = rawSymbol.toLowerCase().replace('cmt_', '').replace('usdt', '');
        return SYMBOL_MAP[normalized] || SYMBOL_MAP[rawSymbol.toLowerCase()] || null;
    }

    async getWhaleSignal(symbol: TrackableSymbol): Promise<WhaleSignal> {
        const cacheKey = `signal_${symbol}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }

        const result: WhaleSignal = {
            symbol,
            signal: 'NEUTRAL',
            confidence: 0.3,
            reason: 'Set WHALE_ALERT_API_KEY for live whale tracking',
            recentTxs: 0,
            netFlow: 0
        };

        const apiKey = process.env.WHALE_ALERT_API_KEY;
        if (apiKey) {
            try {
                const now = Math.floor(Date.now() / 1000);
                const oneHourAgo = now - 3600;
                const minValue = WHALE_THRESHOLDS[symbol] || 500_000;

                const response = await fetch(
                    `https://api.whale-alert.io/v1/transactions?api_key=${apiKey}` +
                    `&min_value=${minValue}&start=${oneHourAgo}&end=${now}&currency=${symbol.toLowerCase()}`,
                    { signal: AbortSignal.timeout(5000) }
                );

                if (response.ok) {
                    const data = await response.json();
                    const txs = data.transactions || [];
                    let exchangeInflow = 0;
                    let exchangeOutflow = 0;

                    for (const tx of txs) {
                        if (tx.to?.owner_type === 'exchange') {
                            exchangeInflow += tx.amount_usd || 0;
                        }
                        if (tx.from?.owner_type === 'exchange') {
                            exchangeOutflow += tx.amount_usd || 0;
                        }
                    }

                    const netFlow = exchangeInflow - exchangeOutflow;
                    const significantFlow = symbol === 'BTC' ? 50_000_000 : 20_000_000;

                    if (netFlow > significantFlow) {
                        result.signal = 'BEARISH';
                        result.confidence = Math.min(0.9, 0.5 + netFlow / (significantFlow * 10));
                        result.reason = `$${(netFlow / 1e6).toFixed(1)}M ${symbol} flowing INTO exchanges (sell pressure)`;
                    } else if (netFlow < -significantFlow) {
                        result.signal = 'BULLISH';
                        result.confidence = Math.min(0.9, 0.5 + Math.abs(netFlow) / (significantFlow * 10));
                        result.reason = `$${(Math.abs(netFlow) / 1e6).toFixed(1)}M ${symbol} flowing OUT of exchanges (accumulation)`;
                    } else {
                        result.signal = 'NEUTRAL';
                        result.confidence = 0.5;
                        result.reason = `Balanced ${symbol} whale activity`;
                    }
                    result.recentTxs = txs.length;
                    result.netFlow = netFlow;
                }
            } catch (error) { }
        }

        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    }

    isContrarian(whaleSignal: WhaleSignal, proposedAction: 'BUY' | 'SELL'): { isContrarian: boolean; warning: string | null } {
        if (whaleSignal.confidence < 0.6) return { isContrarian: false, warning: null };
        if (proposedAction === 'BUY' && whaleSignal.signal === 'BEARISH') return { isContrarian: true, warning: `🐋 WHALE WARNING: ${whaleSignal.reason}` };
        if (proposedAction === 'SELL' && whaleSignal.signal === 'BULLISH') return { isContrarian: true, warning: `🐋 WHALE WARNING: ${whaleSignal.reason}` };
        return { isContrarian: false, warning: null };
    }
}


// ============================================================================
// TITAN V5 CORE (Unified + Vector Memory)
// ============================================================================

interface PendingTrade {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    entryPrice: number;
    timestamp: number;
}

export class TitanV5Core {
    private memory: SimpleMemory;
    private vectorMemory: TitanMemoryStore; // 🧠 Vector Brain
    private whaleSentinel: WhaleSentinel;
    private pendingTrades: Map<string, PendingTrade> = new Map();
    private initialized = false;

    constructor() {
        this.memory = new SimpleMemory();
        this.vectorMemory = new TitanMemoryStore(path.resolve(process.cwd(), 'data'));
        this.whaleSentinel = new WhaleSentinel();
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        logger.info('🦅 Initializing TITAN V5 "APEX PREDATOR"...');

        // Init Vector Memory
        await this.vectorMemory.init();
        logger.info('   🧠 TITAN MEMORY: Vector Store Active (Native TS)');

        logger.info('   🐋 Whale Sentinel: ' + (process.env.WHALE_ALERT_API_KEY ? 'API Active' : 'No API key (neutral mode)'));

        this.initialized = true;
        logger.info('✅ TITAN V5 ready');
    }

    async analyze(params: {
        symbol: string;
        proposedAction: 'BUY' | 'SELL' | 'HOLD';
        trend: string;
        volatility: number;
        adx: number;
        rsi: number;
        aiConfidence: number;
    }): Promise<V5Analysis> {
        if (!this.initialized) await this.initialize();

        const warnings: string[] = [];
        const enhancements: string[] = [];

        // 1. Memory Analysis (Legacy Lookup)
        let memoryCheck = {
            shouldAvoid: false,
            avoidReason: null as string | null,
            confidence: 0.5,
            similarTrades: [] as SimilarTrade[]
        };

        if (params.proposedAction !== 'HOLD') {
            const similar = this.memory.findSimilar({
                symbol: params.symbol,
                action: params.proposedAction,
                trend: params.trend,
                volatility: params.volatility,
                adx: params.adx,
                rsi: params.rsi
            });

            memoryCheck.similarTrades = similar;

            const sameAction = similar.filter(s => s.trade.action === params.proposedAction);
            const losses = sameAction.filter(s => s.trade.outcome === 'LOSS');

            if (sameAction.length >= 3) {
                const lossRate = losses.length / sameAction.length;
                if (lossRate > 0.6) {
                    memoryCheck.shouldAvoid = true;
                    memoryCheck.avoidReason = `${(lossRate * 100).toFixed(0)}% loss rate in similar conditions`;
                    memoryCheck.confidence = lossRate;
                    warnings.push(`🧠 MEMORY: ${memoryCheck.avoidReason}`);
                } else {
                    const wins = sameAction.filter(s => s.trade.outcome === 'WIN');
                    if (wins.length > 0) {
                        enhancements.push(`🧠 MEMORY: ${wins.length}/${sameAction.length} similar trades won`);
                    }
                }
            }
        }

        // 2. Whale Analysis
        const symbolBase = this.whaleSentinel.parseSymbol(params.symbol);
        let whaleSignal: WhaleSignal = {
            symbol: symbolBase || 'BTC',
            signal: 'NEUTRAL',
            confidence: 0.3,
            reason: symbolBase ? 'Checking whale activity...' : 'Symbol not tracked for whales',
            recentTxs: 0,
            netFlow: 0
        };
        let whaleContrarian = { isContrarian: false, warning: null as string | null };

        if (symbolBase && params.proposedAction !== 'HOLD') {
            whaleSignal = await this.whaleSentinel.getWhaleSignal(symbolBase);
            whaleContrarian = this.whaleSentinel.isContrarian(whaleSignal, params.proposedAction);

            if (whaleContrarian.isContrarian && whaleContrarian.warning) {
                warnings.push(whaleContrarian.warning);
            } else if (whaleSignal.confidence > 0.6) {
                if ((params.proposedAction === 'BUY' && whaleSignal.signal === 'BULLISH') ||
                    (params.proposedAction === 'SELL' && whaleSignal.signal === 'BEARISH')) {

                    if (whaleSignal.signal === 'BEARISH') {
                        const threshold = WHALE_THRESHOLDS[symbolBase] || 1000000;
                        if (Math.abs(whaleSignal.netFlow) > (threshold * 2)) {
                            enhancements.push(`🦈 SHARK ATTACK: Massive Institutional Selling ($${(Math.abs(whaleSignal.netFlow) / 1000000).toFixed(1)}M) - AGGRESSIVE SHORT`);
                        } else {
                            enhancements.push(`🐋 WHALE CONFIRMS: ${whaleSignal.reason}`);
                        }
                    } else {
                        enhancements.push(`🐋 WHALE CONFIRMS: ${whaleSignal.reason}`);
                    }
                }
            }
        }

        // 3. Recommendation
        let adjustedConfidence = params.aiConfidence;
        let proceed = true;

        if (memoryCheck.shouldAvoid && memoryCheck.confidence > 0.6) {
            adjustedConfidence *= (1 - memoryCheck.confidence * 0.3);
            if (memoryCheck.confidence > 0.75) proceed = false;
        }
        if (whaleContrarian.isContrarian && whaleSignal.confidence > 0.7) {
            adjustedConfidence *= 0.8;
        }
        if (enhancements.length > 0) {
            adjustedConfidence = Math.min(0.95, adjustedConfidence * 1.1);
        }
        if (warnings.length >= 2 && params.aiConfidence < 0.7) {
            proceed = false;
        }

        return {
            memoryCheck,
            whaleSignal,
            whaleContrarian,
            recommendation: { proceed, adjustedConfidence, warnings, enhancements }
        };
    }

    rememberTrade(trade: TradeMemory): void {
        this.memory.add(trade);

        // 🧠 SAVE TO VECTOR MEMORY
        const trendNum = trade.marketConditions.trend === 'BULLISH' ? 1 : trade.marketConditions.trend === 'BEARISH' ? -1 : 0;
        const vector = [
            trade.marketConditions.rsi / 100,
            trade.marketConditions.adx / 100,
            trendNum,
            0
        ];

        this.vectorMemory.remember(vector, {
            ...trade,
            timestamp: trade.timestamp,
            symbol: trade.symbol,
            action: trade.action,
            outcome: trade.outcome,
            pnl: trade.pnl || 0,
            context: trade.reasoning
        });

        this.pendingTrades.set(trade.id, {
            symbol: trade.symbol,
            action: trade.action,
            entryPrice: trade.entryPrice,
            timestamp: trade.timestamp
        });
        logger.info(`🧠 V5 Remembered: ${trade.symbol} ${trade.action} → ${trade.outcome}`);

        const now = Date.now();
        for (const [id, pending] of this.pendingTrades.entries()) {
            if (now - pending.timestamp > 86400000) this.pendingTrades.delete(id);
        }
    }

    updateTradeOutcome(tradeId: string, exitPrice: number, pnl: number): void {
        this.memory.updateOutcome(tradeId, exitPrice, pnl);
        const outcome = pnl > 0 ? 'WIN' : 'LOSS';
        this.vectorMemory.updateOutcome(tradeId, outcome, pnl);
        this.pendingTrades.delete(tradeId);
        logger.info(`🧠 V5 Outcome: Trade ${tradeId.substring(0, 8)} → ${outcome} (${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%)`);
    }

    resolveSymbolTrades(symbol: string, exitPrice: number): number {
        let resolved = 0;
        const normalizedSymbol = symbol.toLowerCase();

        for (const [tradeId, pending] of Array.from(this.pendingTrades.entries())) {
            if (pending.symbol.toLowerCase() === normalizedSymbol) {
                let pnl = 0;
                if (pending.action === 'BUY') {
                    pnl = ((exitPrice - pending.entryPrice) / pending.entryPrice) * 100;
                } else if (pending.action === 'SELL') {
                    pnl = ((pending.entryPrice - exitPrice) / pending.entryPrice) * 100;
                }
                this.updateTradeOutcome(tradeId, exitPrice, pnl);
                resolved++;
            }
        }
        return resolved;
    }

    getPendingCount(): number {
        return this.pendingTrades.size;
    }

    getMemoryStats() {
        const stats = this.memory.getStats();
        return { ...stats, pendingTrades: this.pendingTrades.size };
    }
}

// Singleton
let v5Instance: TitanV5Core | null = null;

export function getTitanV5(): TitanV5Core {
    if (!v5Instance) {
        v5Instance = new TitanV5Core();
    }
    return v5Instance;
}

export default TitanV5Core;
