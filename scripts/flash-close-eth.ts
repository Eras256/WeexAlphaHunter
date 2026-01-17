
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const envPath = path.resolve(rootDir, '.env');
const envLocalPath = path.resolve(rootDir, '.env.local');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config({ path: envPath });
}

async function flashCloseEth() {
    console.log("⚡ STARTING FLASH CLOSE (100% ETH Position)...");
    console.log("----------------------------------------");

    const exchange = new WeexClient();
    exchange.mode = 'live';

    // The flashClosePosition method in WeexClient hits /capi/v2/order/closePositions
    // which closes ALL positions for that symbol.
    try {
        const result = await exchange.flashClosePosition('cmt_ethusdt');
        console.log("✅ Flash Close Request Sent:", JSON.stringify(result));

        if (result && result.code === '00000') {
            console.log("🎉 SUCCESS: ETH Position Closed. Profit Secured.");
        } else {
            console.log("⚠️ Response Code not 00000. Check Weex Dashboard.");
        }
    } catch (e: any) {
        console.error("❌ Flash Close Failed:", e.message);
        if (e.response) {
            console.error("   Details:", JSON.stringify(e.response.data));
        }
    }
}

flashCloseEth();
