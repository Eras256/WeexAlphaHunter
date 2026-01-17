
/**
 * TITAN EMERGENCY CLEANUP TOOL
 * 
 * This script forcefully connects to WEEX and obliterates ALL open orders
 * (Normal + Plan/Algo) for all watched symbols to free up order slots.
 * 
 * Usage: npx tsx scripts/emergency-cleanup.ts
 */

import { WeexClient } from '../packages/engine-compliance/src/weex-client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const WATCHED_SYMBOLS = [
    'cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt',
    'cmt_xrpusdt', 'cmt_dogeusdt', 'cmt_adausdt',
    'cmt_bnbusdt', 'cmt_ltcusdt'
];

async function main() {
    console.log('🚨 TITAN EMERGENCY CLEANUP PROTOCOL INITIATED 🚨');
    console.log('==============================================');

    const client = new WeexClient();

    // Validate Keys
    try {
        console.log('🔑 Validating API Connection...');
        const balance = await client.getAccountInfo();
        const usdt = balance.find((b: any) => b.coinName === 'USDT');
        console.log(`✅ Connection Successful. Equity: $${usdt?.equity || '0.00'}`);
    } catch (e) {
        console.error('❌ Failed to connect to WEEX. Check .env keys.');
        console.error(e);
        process.exit(1);
    }

    console.log(`\n🧹 Starting Deep Clean for ${WATCHED_SYMBOLS.length} symbols...`);
    let totalCancelled = 0;

    for (const symbol of WATCHED_SYMBOLS) {
        process.stdout.write(`   Targeting ${symbol}... `);

        try {
            // 1. Cancel Normal Orders (Limit/Market pending)
            // Note: Weex API often requires specific order IDs, but cancel-all endpoints exist
            // We will try to fetch current orders first to be precise

            // Method A: Blind Cancel All (If supported, or implemented in client)
            await client.cancelAllOrders(symbol);

            // Method B: Fetch and Destroy Plan Orders (StopLoss/TakeProfit often stick here)
            await client.cancelAllOrders(symbol, 'plan');

            process.stdout.write('✅ SENT KILL SIGNAL\n');
            totalCancelled++;
        } catch (error: any) {
            process.stdout.write('⚠️  ERROR\n');
            console.error(`      -> ${error.message || JSON.stringify(error)}`);
        }

        // Anti-rate limit pause
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n==============================================');
    console.log(`🏁 Protocol Complete.`);
    console.log(`ℹ️  It is recommended to wait 60 seconds before restarting the bot.`);
}

main().catch(console.error);
