
import { createGeminiClient, createConsensusEngine, logger } from "../../core/src/index.js";
import { WeexClient } from "../../engine-compliance/src/weex-client.js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function getRecommendation() {
    console.log("🔮 WAlphaHunter Oracle: Analyzing LIVE Market for Voucher Decision...");

    // 1. Get Live Data
    const weex = new WeexClient();
    const symbol = "cmt_btcusdt";

    try {
        const price = await weex.getTicker(symbol);
        console.log(`📊 Current BTC Price: $${price}`);

        const candles = await weex.getCandles(symbol, "15m", 20);

        // Quick Calc RSI
        let rsi = 50;
        if (candles.length > 14) {
            const closes = candles.map((c: any) => typeof c === 'object' ? parseFloat(c.close || c[4]) : parseFloat(c));
            let gains = 0, losses = 0;
            for (let i = 1; i < closes.length; i++) {
                const diff = closes[i] - closes[i - 1];
                if (diff >= 0) gains += diff; else losses -= diff;
            }
            const rs = (gains / 14) / ((losses / 14) || 1);
            rsi = 100 - (100 / (1 + rs));
        }
        console.log(`📉 Technicals: RSI=${rsi.toFixed(2)}`);

        // 2. Ask AI Consensus
        const gemini = createGeminiClient();
        const consensus = createConsensusEngine(gemini);

        console.log("🧠 Consulting Council of 6 AIs...");
        const signal = await consensus.generateConsensusSignal({
            symbol,
            price,
            indicators: { rsi: rsi }
        });

        console.log("\n" + "=".repeat(40));
        console.log(`🤖 RECOMMENDED ACTION: ${signal.action} (${signal.consensusScore}% Consensus)`);
        console.log("=".repeat(40));
        console.log(`Reasoning: ${signal.reasoning.substring(0, 150)}...`);
        console.log("=".repeat(40));

        console.log("\n👉 INSTRUCTIONS FOR VOUCHER:");
        if (signal.action === 'BUY') console.log("🟢 CLICK 'LONG' (Green Button)");
        else if (signal.action === 'SELL') console.log("🔴 CLICK 'SHORT' (Red Button)");
        else console.log("⚪ AI says HOLD. Suggestion: Wait a bit or follow Trend.");

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

getRecommendation();
