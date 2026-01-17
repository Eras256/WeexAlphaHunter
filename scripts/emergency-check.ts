
import { WeexClient } from "../packages/engine-compliance/src/weex-client.js";
import { logger } from "../packages/core/src/index.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

async function checkStatus() {
    const client = new WeexClient("live");

    console.log("\n🏥 EMERGENCY STATUS CHECK 🏥");

    // 1. Get Positions
    const pos = await client.getOpenPositions();

    // 2. Get Equity (ALWAYS CHECK THIS)
    const account = await client.getAccountInfo();
    let equity = 0;
    if (Array.isArray(account)) {
        // Fix: WEEX API often returns 'coinName' or 'currency'
        const usdt = account.find((a: any) => a.currency === 'USDT' || a.asset === 'USDT' || a.coinName === 'USDT');
        if (usdt) equity = parseFloat(usdt.equity || usdt.available);
        else if (account.length > 0 && account[0].account_equity) equity = parseFloat(account[0].account_equity);
    }

    console.log(`\n💰 CURRENT EQUITY: $${equity.toFixed(2)}`);

    if (!pos || pos.length === 0) {
        console.log("✅ NO OPEN POSITIONS. YOU ARE SAFE (CASH).");
        return;
    }

    console.log(`⚠️ FOUND ${pos.length} OPEN POSITIONS:\n`);

    let totalUnrealizedPnL = 0;

    for (const p of pos) {
        const side = p.side > 0 ? "LONG 🟢" : "SHORT 🔴";
        const pnl = parseFloat(p.unrealized_pnl || "0");
        totalUnrealizedPnL += pnl;

        console.log(`Position: ${p.symbol} | ${side} | Size: ${p.size}`);
        console.log(`Entry: ${p.open_avg_price} | Current: ${p.close_avg_price || "N/A"}`);
        console.log(`PnL: $${pnl.toFixed(2)}  <-- ${pnl < 0 ? "LOSING" : "WINNING"}`);
        console.log("------------------------------------------");
    }

    console.log(`\n💰 TOTAL UNREALIZED PnL: $${totalUnrealizedPnL.toFixed(2)}`);


}

checkStatus();
