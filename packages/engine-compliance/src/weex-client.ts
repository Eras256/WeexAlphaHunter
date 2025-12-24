import { logger, sleep } from '@wah/core';
import axios from 'axios';

export class WeexClient {
    private mode: "mock" | "live";

    constructor(private runId: string) {
        this.mode = (process.env.EXECUTION_MODE as "mock" | "live") || "mock";
        logger.info(`Initialized WEEX Client in [${this.mode.toUpperCase()}] mode.`);
    }

    async placeOrder(symbol: string, side: "BUY" | "SELL", qty: number) {
        const timestamp = new Date().toISOString();

        // 1. MOCK MODE (For Submission Video)
        if (this.mode === 'mock') {
            logger.info(`[MOCK] Placing Order: ${side} ${qty} ${symbol}`);
            await sleep(500); // Simulate network latency
            return {
                status: "FILLED",
                orderId: `MOCK-${Date.now()}`,
                avgPrice: side === 'BUY' ? 95000 : 96000,
                simulated: true
            };
        }

        // 2. LIVE MODE (Requires Keys)
        const apiKey = process.env.WEEX_API_KEY;
        if (!apiKey) {
            logger.error("Missing WEEX_API_KEY for LIVE mode.");
            throw new Error("Missing WEEX_API_KEY");
        }

        try {
            // Real API call would go here (Signed Request)
            // const signature = sign(timestamp + method + path...);
            // const res = await axios.post(...)
            throw new Error("WEEX API Live Implementation Pending Keys");
        } catch (error) {
            logger.error("Live Order Failed", error);
            return { status: "FAILED", error: "Keys Invalid" };
        }
    }
}
