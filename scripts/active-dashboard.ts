
/**
 * TITAN ACTIVE DASHBOARD
 * 
 * Shows PnL of all open positions in real-time.
 * Usage: npx tsx scripts/active-dashboard.ts
 */

import { WeexClient } from '../packages/engine-compliance/src/weex-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SYMBOLS = [
    'cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt',
    'cmt_xrpusdt', 'cmt_dogeusdt',
    'cmt_adausdt', 'cmt_bnbusdt', 'cmt_ltcusdt',
    'cmt_avaxusdt', 'cmt_linkusdt', 'cmt_dotusdt',
    'cmt_shibusdt', 'cmt_pepeusdt', 'cmt_nearusdt'
];

async function main() {
    console.clear();
    console.log('🦅 TITAN V5 ACTIVE MONITOR COMMAND CENTER 🦅');
    console.log('==============================================');

    const client = new WeexClient();

    setInterval(async () => {
        let totalUnrealizedPnL = 0;
        let positionsCount = 0;

        // Move cursor up to redraw
        process.stdout.write('\x1B[H\x1B[2J');
        console.log('🦅 TITAN V5 ACTIVE MONITOR COMMAND CENTER 🦅');
        console.log(`🕒 Time: ${new Date().toISOString()}`);
        console.log('==============================================');
        console.log('SYMBOL          SIDE      ENTRY      MARKET     PnL (USDT)    ROE%');
        console.log('------------------------------------------------------------------');

        for (const symbol of SYMBOLS) {
            try {
                // Weex API structure might vary, we simulate or fetch
                const positions = await client.getOpenPositions(symbol);

                if (positions && positions.length > 0) {
                    for (const pos of positions) {
                        // WEEX Position Object Mapping (Adjust based on actual API)
                        // This usually contains: openPrice, marketPrice, unrealizedPL, etc.
                        // If mock, we might not see much.

                        const side = pos.side === 1 ? 'LONG 🟢' : 'SHORT 🔴';
                        const entry = parseFloat(pos.open_avg_price || pos.openPrice || 0);
                        const mark = parseFloat(pos.market_price || pos.lastPrice || 0); // Need to fetch ticker if missing
                        const pnl = parseFloat(pos.unrealized_pnl || 0);
                        const size = parseFloat(pos.size || 0);

                        // Calculate ROE if missing
                        let roe = 0;
                        if (pos.roe) {
                            roe = parseFloat(pos.roe) * 100;
                        } else {
                            // Rough estimate: PnL / Margin
                            // Margin ~= (Entry * Size) / Leverage
                        }

                        console.log(`${symbol.padEnd(15)} ${side.padEnd(9)} $${entry.toFixed(4).padEnd(9)} $${mark.toFixed(4).padEnd(9)} $${pnl.toFixed(2).padEnd(11)} ${roe.toFixed(2)}%`);

                        totalUnrealizedPnL += pnl;
                        positionsCount++;
                    }
                }
            } catch (e) {
                // Silent fail for speed
            }
        }

        console.log('------------------------------------------------------------------');
        console.log(`📊 TOTAL ACTIVE POSITIONS: ${positionsCount}`);
        console.log(`💰 TOTAL UNREALIZED PnL  : $${totalUnrealizedPnL.toFixed(2)}`);
        console.log('==============================================');
        console.log('Press Ctrl+C to exit monitor (Bot continues running in background)');

    }, 5000); // Update every 5 seconds
}

main();
