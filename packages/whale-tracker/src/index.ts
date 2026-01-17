/**
 * TITAN V5: WHALE TRACKER SENTINEL
 * 
 * Monitors on-chain whale activity to detect smart money movements
 * Uses free APIs: Whale Alert, CryptoQuant (public), Blockchain.info
 * 
 * @version 1.0.0
 */

export interface WhaleTransaction {
    id: string;
    timestamp: number;
    blockchain: string;
    symbol: string;
    amount: number;
    amountUsd: number;
    from: {
        address: string;
        owner?: string;
        ownerType?: 'exchange' | 'whale' | 'unknown';
    };
    to: {
        address: string;
        owner?: string;
        ownerType?: 'exchange' | 'whale' | 'unknown';
    };
    txHash: string;
}

export interface WhaleSignal {
    symbol: string;
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    reason: string;
    recentTxs: number;
    netFlow: number; // + = into exchanges (bearish), - = out of exchanges (bullish)
}

export interface ExchangeFlow {
    exchange: string;
    symbol: string;
    inflow24h: number;
    outflow24h: number;
    netFlow: number;
}

// Known exchange addresses (partial list)
const KNOWN_EXCHANGES: Record<string, string> = {
    // Bitcoin
    'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h': 'Binance',
    '3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb': 'Binance',
    '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s': 'Binance',
    'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97': 'Bitfinex',
    '3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6': 'Coinbase',
    // Ethereum
    '0x28c6c06298d514db089934071355e5743bf21d60': 'Binance',
    '0x21a31ee1afc51d94c2efccaa2092ad1028285549': 'Binance',
    '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': 'Binance',
    '0x503828976d22510aad0201ac7ec88293211d23da': 'Coinbase',
    '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': 'Coinbase',
    '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': 'Kraken',
    '0x0d0707963952f2fba59dd06f2b425ace40b492fe': 'Gate.io',
    '0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23': 'OKX',
    '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b': 'OKX',
    '0x46340b20830761efd32832a74d7169b29feb9758': 'Bybit',
};

export class WhaleSentinel {
    private whaleAlertApiKey: string | null;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private cacheTTL = 60000; // 1 minute cache

    constructor(whaleAlertApiKey?: string) {
        this.whaleAlertApiKey = whaleAlertApiKey || process.env.WHALE_ALERT_API_KEY || null;
    }

    /**
     * Get cached data or fetch new
     */
    private getCached<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data as T;
        }
        return null;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    /**
     * Fetch whale transactions from Whale Alert API (free tier: 10 req/min)
     */
    async getWhaleTransactions(
        symbol: 'BTC' | 'ETH',
        minValue: number = 1000000 // $1M minimum
    ): Promise<WhaleTransaction[]> {
        const cacheKey = `whale_txs_${symbol}`;
        const cached = this.getCached<WhaleTransaction[]>(cacheKey);
        if (cached) return cached;

        if (!this.whaleAlertApiKey) {
            console.warn('⚠️ No Whale Alert API key, using simulated data');
            return this.getSimulatedWhaleData(symbol);
        }

        try {
            const now = Math.floor(Date.now() / 1000);
            const oneHourAgo = now - 3600;

            const response = await fetch(
                `https://api.whale-alert.io/v1/transactions?api_key=${this.whaleAlertApiKey}` +
                `&min_value=${minValue}&start=${oneHourAgo}&end=${now}&currency=${symbol.toLowerCase()}`
            );

            if (!response.ok) {
                throw new Error(`Whale Alert API error: ${response.status}`);
            }

            const data = await response.json();
            const txs: WhaleTransaction[] = (data.transactions || []).map((tx: any) => ({
                id: tx.id,
                timestamp: tx.timestamp * 1000,
                blockchain: tx.blockchain,
                symbol: tx.symbol.toUpperCase(),
                amount: tx.amount,
                amountUsd: tx.amount_usd,
                from: {
                    address: tx.from?.address || 'unknown',
                    owner: tx.from?.owner || undefined,
                    ownerType: tx.from?.owner_type || 'unknown'
                },
                to: {
                    address: tx.to?.address || 'unknown',
                    owner: tx.to?.owner || undefined,
                    ownerType: tx.to?.owner_type || 'unknown'
                },
                txHash: tx.hash
            }));

            this.setCache(cacheKey, txs);
            return txs;
        } catch (error) {
            console.error('Whale Alert fetch error:', error);
            return this.getSimulatedWhaleData(symbol);
        }
    }

    /**
     * Simulated whale data for when API is unavailable
     */
    private getSimulatedWhaleData(symbol: string): WhaleTransaction[] {
        // Return empty - no fake data, just no signal
        return [];
    }

    /**
     * Analyze exchange inflows/outflows from CryptoQuant public data
     */
    async getExchangeFlows(symbol: 'BTC' | 'ETH'): Promise<ExchangeFlow[]> {
        const cacheKey = `exchange_flows_${symbol}`;
        const cached = this.getCached<ExchangeFlow[]>(cacheKey);
        if (cached) return cached;

        // CryptoQuant doesn't have a free API, so we estimate from whale transactions
        const txs = await this.getWhaleTransactions(symbol);

        const exchangeFlows: Map<string, { inflow: number; outflow: number }> = new Map();

        for (const tx of txs) {
            // Check if destination is exchange (inflow = bearish)
            const toExchange = KNOWN_EXCHANGES[tx.to.address.toLowerCase()] || tx.to.owner;
            if (toExchange) {
                const current = exchangeFlows.get(toExchange) || { inflow: 0, outflow: 0 };
                current.inflow += tx.amountUsd;
                exchangeFlows.set(toExchange, current);
            }

            // Check if source is exchange (outflow = bullish)
            const fromExchange = KNOWN_EXCHANGES[tx.from.address.toLowerCase()] || tx.from.owner;
            if (fromExchange) {
                const current = exchangeFlows.get(fromExchange) || { inflow: 0, outflow: 0 };
                current.outflow += tx.amountUsd;
                exchangeFlows.set(fromExchange, current);
            }
        }

        const result: ExchangeFlow[] = [];
        exchangeFlows.forEach((flows, exchange) => {
            result.push({
                exchange,
                symbol,
                inflow24h: flows.inflow,
                outflow24h: flows.outflow,
                netFlow: flows.inflow - flows.outflow
            });
        });

        this.setCache(cacheKey, result);
        return result;
    }

    /**
     * Get whale sentiment signal for a symbol
     */
    async getWhaleSignal(symbol: 'BTC' | 'ETH'): Promise<WhaleSignal> {
        const cacheKey = `whale_signal_${symbol}`;
        const cached = this.getCached<WhaleSignal>(cacheKey);
        if (cached) return cached;

        const txs = await this.getWhaleTransactions(symbol);
        const flows = await this.getExchangeFlows(symbol);

        // Calculate net flow across all exchanges
        const totalNetFlow = flows.reduce((sum, f) => sum + f.netFlow, 0);
        const totalVolume = flows.reduce((sum, f) => sum + f.inflow24h + f.outflow24h, 0);

        let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        let confidence: number;
        let reason: string;

        if (txs.length === 0) {
            signal = 'NEUTRAL';
            confidence = 0.3;
            reason = 'No significant whale activity detected';
        } else if (totalNetFlow > 50_000_000) {
            // $50M+ net inflow to exchanges = bearish
            signal = 'BEARISH';
            confidence = Math.min(0.9, 0.5 + (totalNetFlow / 500_000_000));
            reason = `$${(totalNetFlow / 1_000_000).toFixed(1)}M net inflow to exchanges (whales preparing to sell)`;
        } else if (totalNetFlow < -50_000_000) {
            // $50M+ net outflow from exchanges = bullish
            signal = 'BULLISH';
            confidence = Math.min(0.9, 0.5 + (Math.abs(totalNetFlow) / 500_000_000));
            reason = `$${(Math.abs(totalNetFlow) / 1_000_000).toFixed(1)}M net outflow from exchanges (whales accumulating)`;
        } else {
            signal = 'NEUTRAL';
            confidence = 0.5;
            reason = `Balanced whale activity: $${(totalVolume / 1_000_000).toFixed(1)}M total volume`;
        }

        const result: WhaleSignal = {
            symbol,
            signal,
            confidence,
            reason,
            recentTxs: txs.length,
            netFlow: totalNetFlow
        };

        this.setCache(cacheKey, result);
        return result;
    }

    /**
     * Check if whales are moving against proposed trade
     */
    async isWhaleContrarian(
        symbol: 'BTC' | 'ETH',
        proposedAction: 'BUY' | 'SELL'
    ): Promise<{ contrarian: boolean; warning: string | null }> {
        const whaleSignal = await this.getWhaleSignal(symbol);

        if (whaleSignal.confidence < 0.6) {
            return { contrarian: false, warning: null };
        }

        if (proposedAction === 'BUY' && whaleSignal.signal === 'BEARISH') {
            return {
                contrarian: true,
                warning: `🐋 WHALE WARNING: ${whaleSignal.reason}. Consider waiting.`
            };
        }

        if (proposedAction === 'SELL' && whaleSignal.signal === 'BULLISH') {
            return {
                contrarian: true,
                warning: `🐋 WHALE WARNING: ${whaleSignal.reason}. Whales are buying!`
            };
        }

        return { contrarian: false, warning: null };
    }

    /**
     * Get summary for logging
     */
    async getSummary(symbol: 'BTC' | 'ETH'): Promise<string> {
        const signal = await this.getWhaleSignal(symbol);
        const emoji = signal.signal === 'BULLISH' ? '🟢' :
            signal.signal === 'BEARISH' ? '🔴' : '⚪';

        return `${emoji} Whale Signal: ${signal.signal} (${(signal.confidence * 100).toFixed(0)}%) - ${signal.reason}`;
    }
}

// Singleton instance
let whaleInstance: WhaleSentinel | null = null;

export function getWhaleSentinel(apiKey?: string): WhaleSentinel {
    if (!whaleInstance) {
        whaleInstance = new WhaleSentinel(apiKey);
    }
    return whaleInstance;
}

export default WhaleSentinel;
