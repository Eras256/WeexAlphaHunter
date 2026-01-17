/**
 * Check ALL positions using alternative endpoint
 */

import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function checkAllPositions() {
    console.log("🔍 Checking ALL Open Positions...\n");

    // WeexClient reads credentials from env vars automatically
    const exchange = new WeexClient();

    try {
        // Try the allPosition endpoint
        console.log("Trying /capi/v2/spr/position/allPosition...");
        const result = await (exchange as any).sendSignedRequest('GET', '/capi/v2/spr/position/allPosition');
        console.log("\n📍 All Positions Response:");
        console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.log("allPosition failed:", e.message);
    }

    try {
        // Try history positions
        console.log("\nTrying /capi/v2/spr/position/historyPosition...");
        const result2 = await (exchange as any).sendSignedRequest('GET', '/capi/v2/spr/position/historyPosition?symbol=cmt_btcusdt&pageSize=5');
        console.log("\n📜 History Positions:");
        console.log(JSON.stringify(result2, null, 2));
    } catch (e: any) {
        console.log("historyPosition failed:", e.message);
    }

    // Check each symbol  
    console.log("\n📊 Checking individual symbols for positions...");
    const symbols = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt', 'cmt_xrpusdt', 'cmt_dogeusdt', 'cmt_adausdt', 'cmt_bnbusdt', 'cmt_ltcusdt'];

    for (const sym of symbols) {
        try {
            const result = await (exchange as any).sendSignedRequest('GET', `/capi/v2/spr/position/openPosition?symbol=${sym}`);
            if (result.data && result.data.length > 0) {
                console.log(`\n✅ ${sym}: ${result.data.length} position(s)`);
                console.log(JSON.stringify(result.data, null, 2));
            }
        } catch (e: any) {
            // silent
        }
    }

    // Also try a different endpoint structure
    try {
        console.log("\nTrying /capi/v2/position/allPosition...");
        const result3 = await (exchange as any).sendSignedRequest('GET', '/capi/v2/position/allPosition');
        console.log(JSON.stringify(result3, null, 2));
    } catch (e: any) {
        console.log("Alternative failed:", e.message);
    }
}

checkAllPositions().catch(console.error);
