
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Load env
const envPath = path.resolve(rootDir, '.env');
const envLocalPath = path.resolve(rootDir, '.env.local');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config({ path: envPath });
}

async function cancelAllOrders() {
    console.log("🧹 STARTING EMERGENCY ORDER CLEANUP...");
    console.log("----------------------------------------");

    const exchange = new WeexClient();
    exchange.mode = 'live'; // FORCE LIVE MODE

    const symbols = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt', 'cmt_xrpusdt', 'cmt_dogeusdt', 'cmt_adausdt', 'cmt_bnbusdt', 'cmt_ltcusdt'];

    for (const symbol of symbols) {
        try {
            console.log(`[${symbol}] 🔍 Checking for open orders...`);

            // 1. Cancel Normal Orders
            const result = await exchange.cancelAllOrders(symbol, 'normal');
            console.log(`[${symbol}] ✅ Normal Orders Cancelled:`, JSON.stringify(result));

            // 2. Cancel Plan Orders (Stop Loss / Take Profit pendings)
            const resultPlan = await exchange.cancelAllOrders(symbol, 'plan');
            console.log(`[${symbol}] ✅ Plan Orders Cancelled:`, JSON.stringify(resultPlan));

            // 3. FLASH CLOSE POSITION (Emergency Exit)
            console.log(`[${symbol}] 🚨 Attempting Flash Close...`);
            try {
                await exchange.flashClosePosition(symbol);
                console.log(`[${symbol}] ✅ Position Closed!`);
            } catch (closeErr: any) {
                console.log(`[${symbol}] ℹ️ No position to close or failed: ${closeErr.message}`);
            }

        } catch (e: any) {
            console.error(`[${symbol}] ❌ Error cancelling:`, e.message || e);
        }
    }

    console.log("----------------------------------------");
    console.log("✨ CLEANUP COMPLETE. PLEASE CHECK AVAILABLE BALANCE.");
}

cancelAllOrders();
