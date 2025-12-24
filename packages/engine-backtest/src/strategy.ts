import { Trade, AccountState } from '@wah/core';

export interface BacktestConfig {
    initialCapital: number;
    useWxtDiscount: boolean; // 50% fee discount
    startDate: string;
    endDate: string;
    pairs: string[];
}

export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export abstract class Strategy {
    abstract name: string;

    /**
     * Core logic: Accept candle + features, return Action
     */
    abstract onCandle(
        candle: Candle,
        account: AccountState,
        features: Record<string, number>,
        aiDecision?: any
    ): Promise<{ action: "BUY" | "SELL" | "HOLD"; size?: number }>;
}
