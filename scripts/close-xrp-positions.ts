/**
 * CLOSE ALL XRP POSITIONS
 * Closes both LONG and SHORT positions on cmt_xrpusdt
 */

import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import { logger, sleep } from '../packages/core/src/index.js';

async function main() {
    console.log("🔥 CLOSING ALL XRP POSITIONS 🔥");

    const client = new WeexClient();
    client.mode = 'live';

    const symbol = 'cmt_xrpusdt';

    console.log(`\n🔍 Fetching current XRP positions...`);

    try {
        // Get current positions
        const positions = await client.getOpenPositions(symbol);
        console.log(`   Found ${positions?.length || 0} position(s)`);

        if (!positions || positions.length === 0) {
            console.log("   ✅ No open positions found for XRP");
            return;
        }

        for (const pos of positions) {
            console.log(`   📊 Position: ${pos.holdSide || pos.side} | Size: ${pos.available || pos.size}`);
        }

        // Close all positions for this symbol
        console.log(`\n🚀 Sending FLASH CLOSE for ${symbol}...`);

        const body = {
            symbol: symbol,
            client_oid: `close_xrp_${Date.now()}`
        };

        const res = await (client as any).sendSignedRequest('POST', '/capi/v2/order/closePositions', body);

        console.log("   ✅ RESPONSE:", JSON.stringify(res.data));

        if (res.data?.success || res.data?.code === '00000') {
            console.log("   🎉 SUCCESS! XRP positions closing...");
        }

        // Wait and verify
        await sleep(2000);

        const remaining = await client.getOpenPositions(symbol);
        if (!remaining || remaining.length === 0) {
            console.log("\n✅ ALL XRP POSITIONS CLOSED SUCCESSFULLY");
        } else {
            console.log(`\n⚠️ ${remaining.length} position(s) still open. May need manual intervention.`);
        }

    } catch (e: any) {
        console.log(`   ❌ FAILED: ${e.message}`);
        if (e.response) {
            console.log("   📌 Status:", e.response.status);
            console.log("   📌 Data:", JSON.stringify(e.response.data));
        }
    }

    console.log("\n✅ XRP Close Script Complete.");
}

main();
