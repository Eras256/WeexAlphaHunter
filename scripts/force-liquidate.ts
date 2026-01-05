
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import { logger, sleep } from '../packages/core/src/index.js';

async function main() {
    console.log("🔥 STARTING FORCE LIQUIDATION 🔥");
    const client = new WeexClient();
    client.mode = 'live'; // Force Live Mode

    // Standard symbol identifiers for WEEX futures
    const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt'];

    for (const symbol of SYMBOLS) {
        console.log(`\n🔍 Checking positions for ${symbol}...`);

        let positions: any[] = [];

        // --- Try V2 Endpoint ---
        try {
            console.log("   👉 Trying V2 Endpoint (/capi/v2/spr/position/openPosition)...");
            const res = await (client as any).sendSignedRequest('GET', `/capi/v2/spr/position/openPosition?symbol=${symbol}`);

            // Log raw response for diagnostics
            const raw = JSON.stringify(res.data);
            console.log(`   🔍 Raw V2 Response: ${raw.substring(0, 100)}...`);

            if (res.data?.data) {
                // normalize if data is array or object
                const d = res.data.data;
                if (Array.isArray(d)) positions = positions.concat(d);
                else positions.push(d);
            } else if (Array.isArray(res.data)) {
                positions = positions.concat(res.data);
            }
        } catch (e: any) {
            console.warn("   ⚠️ V2 Failed:", e.response?.data || e.message);
        }

        // --- Try V1 Endpoint ---
        // Some accounts/pairs use V1 Perpetual endpoints
        if (positions.length === 0) {
            try {
                console.log("   👉 Trying V1 Endpoint (/capi/v1/perpetual/position/openPosition)...");
                const res = await (client as any).sendSignedRequest('GET', `/capi/v1/perpetual/position/openPosition?symbol=${symbol}`);

                const raw = JSON.stringify(res.data);
                console.log(`   🔍 Raw V1 Response: ${raw.substring(0, 100)}...`);

                if (res.data?.data) {
                    const d = res.data.data;
                    if (Array.isArray(d)) positions = positions.concat(d);
                    else positions.push(d);
                } else if (Array.isArray(res.data)) {
                    positions = positions.concat(res.data);
                }
            } catch (e: any) {
                console.warn("   ⚠️ V1 Failed:", e.response?.data || e.message);
            }
        }

        console.log(`   Found ${positions.length} positions for ${symbol}.`);

        // --- Close Positions ---
        for (const pos of positions) {
            console.log(`   ⚠️ POSITION FOUND: ${JSON.stringify(pos)}`);

            // WEEX API: 
            // type: 1=Open Long, 2=Open Short, 3=Close Long, 4=Close Short
            // side (in position info): usually 1=Long, 2=Short

            let closeType = '0';
            const s = (pos.side || pos.holdSide || '').toString();

            if (s === '1') {
                console.log("   ➡️ Closing LONG position...");
                closeType = '3';
            } else if (s === '2') {
                console.log("   ➡️ Closing SHORT position...");
                closeType = '4';
            } else {
                console.log("   ➡️ Unknown side, checking 'type' field...");
                // Some APIs return type=1 for long...
                if (pos.type === 1) closeType = '3';
                else if (pos.type === 2) closeType = '4';
                else {
                    console.warn("   ❓ Cannot determine side. defaulting to market close of amount.");
                    // This might fail if type is required
                }
            }

            // Find quantity
            const amount = pos.amount || pos.total || pos.available || pos.size;

            const body = {
                client_oid: `panic_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                symbol: symbol,
                size: amount.toString(), // Must be string
                type: closeType,
                order_type: '0',
                match_price: '1', // Market price
                price: '0'
            };

            console.log(`   💣 Sending Close Order:`, body);

            try {
                const res = await (client as any).sendSignedRequest('POST', '/capi/v2/order/placeOrder', body);
                console.log("   ✅ Close Response:", res.data);
            } catch (e: any) {
                console.error("   ❌ Close Failed:", e.response?.data || e.message);
            }

            await sleep(500);
        }
    }

    console.log("\n✅ Force Liquidation Loop Complete.");
}

main();
