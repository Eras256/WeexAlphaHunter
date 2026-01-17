
import { WeexClient } from '../packages/engine-compliance/src/weex-client';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

async function audit() {
    const client = new WeexClient('production-v1');
    const symbols = [
        'cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt',
        'cmt_xrpusdt', 'cmt_dogeusdt',
        'cmt_adausdt', 'cmt_bnbusdt', 'cmt_ltcusdt'
    ];

    console.log("🔍 AUDITING OPEN POSITIONS...");

    let totalExposure = 0;

    for (const s of symbols) {
        try {
            const positions = await client.getOpenPositions(s);
            if (positions && positions.length > 0) {
                for (const p of positions) {
                    const size = parseFloat(p.openDelegateSize || p.size || '0');
                    if (size > 0) {
                        console.log(`\n🚨 OPEN POSITION: ${s}`);
                        console.log(`   Side: ${p.side === 1 ? 'LONG' : 'SHORT'}`);
                        console.log(`   Size: ${size}`);
                        console.log(`   PnL: ${p.unrealizedPnl || 'N/A'}`);
                        totalExposure += size;
                    }
                }
            }
        } catch (e) {
            console.error(`Error checking ${s}:`, e.message);
        }
    }

    if (totalExposure === 0) {
        console.log("\n✅ NO OPEN POSITIONS. PORTFOLIO IS FLAT.");
    } else {
        console.log(`\n⚠️ TOTAL EXPOSURE DETECTED: ${totalExposure}`);
    }
}

audit();
