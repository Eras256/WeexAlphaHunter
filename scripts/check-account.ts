
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import { logger } from '../packages/core/src/index.js';

async function main() {
    console.log("🕵️ DETECTING CONNECTED ACCOUNT IDENTITY 🕵️");
    const client = new WeexClient();
    client.mode = 'live';

    try {
        console.log("📡 Fetching Account Balance & Details...");
        // This usually returns the balance list, but sometimes metadata too
        const res = await client.getAccountInfo();
        console.log("✅ API Connectivity: GOOD");

        console.log("\n💰 WALLET BALANCES (Bot's view):");
        if (Array.isArray(res)) {
            // Find USDT
            const usdt = res.find((a: any) => a.asset === 'USDT' || a.currency === 'USDT' || a.coinName === 'USDT');
            if (usdt) {
                console.log(`   💵 USDT Equity:    $${usdt.equity}`);
                console.log(`   🔓 USDT Available: $${usdt.available}`);
                console.log(`   📈 Unrealized PnL: $${usdt.unrealizePnl}`);
            }
            console.log("\n📄 Full Asset List:", JSON.stringify(res, null, 2));
        } else if (res?.data) {
            console.log("   (Wrapped Response):", JSON.stringify(res.data, null, 2));
        } else {
            console.log("   (Raw Response):", JSON.stringify(res, null, 2));
        }

        console.log("\n❓ DIAGNOSIS:");
        console.log("   Compare the 'USDT Equity' above with what you see in your browser.");
        console.log("   If they are different, you are logged into a DIFFERENT account in the browser.");

    } catch (e: any) {
        console.error("❌ Failed to fetch account info. API Keys might be invalid or IP blocked.");
        console.error("   Error:", e.message);
    }
}

main();
