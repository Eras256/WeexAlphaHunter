
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import { logger, sleep } from '../packages/core/src/index.js';

async function main() {
    console.log("🔥 ATTEMPTING 'FLASH CLOSE ALL' ENDPOINT 🔥");

    const client = new WeexClient();
    client.mode = 'live';

    const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt'];

    for (const symbol of SYMBOLS) {
        console.log(`\n🔍 FLASH CLOSING ${symbol.toUpperCase()}...`);

        // Endpoint: /capi/v2/order/closePositions
        // Body: { symbol: 'cmt_btcusdt' } (if symbol is omitted, closes ALL?)
        // Docs say symbol is optional for 'close all', but let's be safe.

        const body = {
            symbol: symbol,
            client_oid: `flash_${Date.now()}`
        };

        try {
            console.log(`   👉 Sending POST /capi/v2/order/closePositions for ${symbol}...`);
            const res = await (client as any).sendSignedRequest('POST', '/capi/v2/order/closePositions', body);

            console.log("   ✅ RESPONSE:", JSON.stringify(res.data));

            if (res.data?.success || res.data?.code === '00000') {
                console.log("   🎉 SUCCESS! Position should be closed.");
            }
        } catch (e: any) {
            console.log(`   ❌ FAILED: ${e.message}`);
            if (e.response) {
                console.log("   📌 Status:", e.response.status);
                console.log("   📌 Data:", JSON.stringify(e.response.data));
            }
        }

        await sleep(1000);
    }

    console.log("\n✅ Flash Close Sequence Complete.");
}

main();
