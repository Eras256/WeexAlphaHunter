
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import { logger, sleep } from '../packages/core/src/index.js';

async function main() {
    console.log("🔥 STARTING BRUTE FORCE BLIND CLOSE 🔥");
    console.log("⚠️ WARNING: This script indiscriminately attempts to close positions.");

    const client = new WeexClient();
    client.mode = 'live';

    const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt'];

    for (const symbol of SYMBOLS) {
        console.log(`\n🔍 PROCESSING ${symbol.toUpperCase()}...`);

        // 1. Cancel Open Orders first
        console.log("   🧹 Cancelling active orders...");
        await client.cancelAllOrders(symbol, 'normal');
        await client.cancelAllOrders(symbol, 'plan');

        // 2. Try to fetch positions (might fail 521)
        // If it fails, we assume we might have a position and try to close.

        console.log("   💣 Attempting BLIND CLOSE via Market Type...");

        // Try to close LONG (by selling flat) and SHORT (by buying flat)
        // Order Type 1 = Buying, 2 = Selling
        // Position Close Type: often managed by 'type' param in order endpoint
        // 1: Open Long, 2: Open Short, 3: Close Long, 4: Close Short

        // Attempt to Close Long (Type 3)
        // We guess a size. If we have 2100 equity, we might have substantial size.
        // We will loop through 'Close All' logic if possible
        // Does placeOrder support "Close All"? No.
        // But flash close is manual.

        // Strategy: Try to execute a 'Close Long' order with a tiny size to see if it accepts
        // Then try 'Close Short'

        const tryClose = async (sideCode: string, name: string) => {
            // Use MINIMUM sizes to test
            const size = symbol.includes('btc') ? '0.001' : symbol.includes('eth') ? '0.01' : '1';

            const body = {
                client_oid: `blind_${Date.now()}_${sideCode}`,
                symbol: symbol,
                size: size,
                type: sideCode,
                order_type: '0', // Normal
                match_price: '1', // Market
                price: '0'
            };

            try {
                // Ignore "No position" errors, catch success
                const res = await (client as any).sendSignedRequest('POST', '/capi/v2/order/placeOrder', body);

                if (res.data?.code === '00000') {
                    console.log(`   ✅ SUCCESS: ${name} Order Placed! (Size: ${size})`);
                    console.log("   ⚠️ REPEATING to clear more inventory...");
                    // Assuming we might have more, user can re-run.
                } else {
                    const msg = res.data?.msg || JSON.stringify(res.data);
                    if (msg.includes('position')) console.log(`   ℹ️ No ${name} position found.`);
                    else console.log(`   🔸 ${name} Result: ${msg}`);
                }
            } catch (e: any) {
                // 521 errors might appear here too
                console.log(`   ❌ ${name} Endpoint Error: ${e.message}`);
            }
        };

        await tryClose('3', 'CLOSE LONG');
        await sleep(200);
        await tryClose('4', 'CLOSE SHORT');

        await sleep(500);
    }

    console.log("\n✅ Brute Force Sequence Complete.");
    console.log("👉 Check 'Available Balance' in the main bot logs to see if it freed up.");
}

main();
