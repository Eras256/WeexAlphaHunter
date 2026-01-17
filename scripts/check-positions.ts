/**
 * Quick script to check current open positions on WEEX
 */

import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function checkPositions() {
    console.log("🔍 Checking WEEX Open Positions...\n");

    // WeexClient reads credentials from env vars automatically
    const exchange = new WeexClient();

    // Symbols to check
    const symbols = [
        'cmt_btcusdt',
        'cmt_ethusdt',
        'cmt_solusdt',
        'cmt_xrpusdt',
        'cmt_dogeusdt',
        'cmt_adausdt',
        'cmt_bnbusdt',
        'cmt_ltcusdt'
    ];

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║               CURRENT OPEN POSITIONS                           ║");
    console.log("╠════════════════════════════════════════════════════════════════╣");

    let totalUnrealizedPnl = 0;
    let totalPositions = 0;

    for (const symbol of symbols) {
        try {
            const positions = await exchange.getOpenPositions(symbol);

            if (positions && positions.length > 0) {
                for (const pos of positions) {
                    totalPositions++;
                    const side = pos.holdSide || pos.side || 'UNKNOWN';
                    const size = pos.total || pos.available || pos.size || '0';
                    const entryPrice = pos.openPriceAvg || pos.averageOpenPrice || pos.entryPrice || '0';
                    const unrealizedPnl = parseFloat(pos.unrealizedPL || pos.unrealizedPnl || '0');
                    const leverage = pos.leverage || '1';
                    const marginMode = pos.marginMode || 'cross';

                    totalUnrealizedPnl += unrealizedPnl;

                    const pnlColor = unrealizedPnl >= 0 ? '🟢' : '🔴';
                    const sideEmoji = side.toLowerCase() === 'long' ? '📈' : '📉';

                    console.log(`║ ${sideEmoji} ${symbol.toUpperCase().padEnd(15)} │ ${side.toUpperCase().padEnd(5)} │ Size: ${parseFloat(size).toFixed(4).padEnd(10)}`);
                    console.log(`║    Entry: $${parseFloat(entryPrice).toFixed(2).padEnd(10)} │ Leverage: ${leverage}x │ ${marginMode}`);
                    console.log(`║    ${pnlColor} Unrealized PnL: $${unrealizedPnl.toFixed(2)}`);
                    console.log("╟────────────────────────────────────────────────────────────────╢");
                }
            }
        } catch (e: any) {
            // Silent fail for symbols without positions
        }
    }

    if (totalPositions === 0) {
        console.log("║   No open positions found                                      ║");
    }

    console.log("╠════════════════════════════════════════════════════════════════╣");
    const totalColor = totalUnrealizedPnl >= 0 ? '🟢' : '🔴';
    console.log(`║ ${totalColor} TOTAL POSITIONS: ${totalPositions.toString().padEnd(3)} │ TOTAL PnL: $${totalUnrealizedPnl.toFixed(2).padEnd(10)} ║`);
    console.log("╚════════════════════════════════════════════════════════════════╝");

    // Also get account info
    console.log("\n📊 Account Summary:");
    try {
        const accountInfo = await exchange.getAccountInfo();
        if (Array.isArray(accountInfo)) {
            const usdt = accountInfo.find((a: any) => a.coinName === 'USDT');
            if (usdt) {
                console.log(`   💰 Equity: $${parseFloat(usdt.equity).toFixed(2)}`);
                console.log(`   💵 Available: $${parseFloat(usdt.available).toFixed(2)}`);
                console.log(`   🔒 Frozen: $${parseFloat(usdt.frozen).toFixed(2)}`);
                console.log(`   📈 Unrealized PnL: $${parseFloat(usdt.unrealizePnl || '0').toFixed(2)}`);
            }
        }
    } catch (e: any) {
        console.log("   Error fetching account info:", e.message);
    }
}

checkPositions().catch(console.error);
