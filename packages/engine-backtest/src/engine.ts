import { Trade, AccountState, logger, generateUUID, hashDecision } from '@wah/core';
import { Strategy, Candle, BacktestConfig } from './strategy.js';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export class BacktestEngine {
    private trades: Trade[] = [];
    private account: AccountState;

    constructor(
        private config: BacktestConfig,
        private strategy: Strategy
    ) {
        this.account = {
            balance: config.initialCapital,
            equity: config.initialCapital,
            positions: []
        };
    }

    // Very simplified simulation loop
    // In production this would stream data. Here we load fully for Hackathon speed.
    public async run(dataPath: string) {
        logger.info(`Starting Backtest on ${dataPath} with $${this.config.initialCapital}`);

        // Load Data
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true });

        // Fee Model (WEEX)
        // Taker Fee: 0.06% normally. 0.03% if WXT is enabled.
        const feeRate = this.config.useWxtDiscount ? 0.0003 : 0.0006;

        for (const record of records) {
            const candle: Candle = {
                timestamp: new Date(record.timestamp).getTime(),
                open: parseFloat(record.open),
                high: parseFloat(record.high),
                low: parseFloat(record.low),
                close: parseFloat(record.close),
                volume: parseFloat(record.volume)
            };

            // 1. Update Portfolio (Mark to Market)
            this.updateEquity(candle.close);

            // 2. Ask Strategy
            // NOTE: In a real system, we'd pass computed features here
            const decision = await this.strategy.onCandle(candle, this.account, {});

            // 3. Execute
            if (decision.action === 'BUY' && this.account.positions.length === 0) {
                // Full send for hackathon (simplified sizing)
                const size = (this.account.equity * 0.95) / candle.close;
                const cost = size * candle.close;
                const fee = cost * feeRate;

                if (this.account.balance > (cost + fee)) {
                    this.account.balance -= (cost + fee);
                    this.account.positions.push({
                        symbol: "BTC/USDT", // Hardcoded for demo
                        entryPrice: candle.close,
                        qty: size,
                        side: "LONG",
                        unrealizedPnl: 0
                    });

                    // Log Trade Entry
                    this.trades.push({
                        tradeId: generateUUID(),
                        symbol: "BTC/USDT",
                        side: "BUY",
                        price: candle.close,
                        qty: size,
                        timestamp: new Date(candle.timestamp).toISOString(),
                        commission: fee,
                        aiDecisionId: generateUUID(), // Mocked connection to AI log
                        aiConfidence: 0.85 + (Math.random() * 0.1) // Mock high confidence
                    });
                }
            }
            else if (decision.action === 'SELL' && this.account.positions.length > 0) {
                const pos = this.account.positions[0];
                const revenue = pos.qty * candle.close;
                const fee = revenue * feeRate;
                const pnl = revenue - (pos.qty * pos.entryPrice) - fee;

                this.account.balance += revenue - fee;
                this.account.positions = []; // Closed

                // Update trade log (find the open trade and close it)
                const openTrade = this.trades[this.trades.length - 1]; // Simply last one for demo
                openTrade.exitPrice = candle.close;
                openTrade.pnl = pnl;
                openTrade.exitReason = "STRATEGY_SIGNAL";
            }
        }

        this.finalize();
    }

    private updateEquity(currentPrice: number) {
        let unrealized = 0;
        for (const pos of this.account.positions) {
            pos.unrealizedPnl = (currentPrice - pos.entryPrice) * pos.qty;
            unrealized += pos.unrealizedPnl;
        }
        this.account.equity = this.account.balance + unrealized;
    }

    private finalize() {
        logger.info(`Backtest Complete. Final Equity: $${this.account.equity.toFixed(2)}`);

        // Export CSV
        const csvData = stringify(this.trades, { header: true });
        fs.writeFileSync('data/backtest/trades_v2.csv', csvData);
    }
}
