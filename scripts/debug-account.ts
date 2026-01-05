
import { WeexClient } from "../packages/engine-compliance/src/weex-client.js";
import { logger } from "../packages/core/src/index.js";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: rootEnvPath });
console.log(`Loading .env from: ${rootEnvPath}`);
dotenv.config({ path: localEnvPath, override: true });

async function debugAccount() {
    logger.info("🕵️ STARTING ACCOUNT DIAGNOSTIC...");
    const client = new WeexClient("debug-mode");

    try {
        // 1. Check Account Balance / Assets
        logger.info("\n📊 1. FETCHING ACCOUNT INFO (Raw):");
        const account = await client.getAccountInfo();
        console.log(JSON.stringify(account, null, 2));

        // 2. Check Positions with different casing
        const symbols = ['cmt_btcusdt', 'CMT_BTCUSDT'];

        for (const sym of symbols) {
            logger.info(`\n🔍 2. CHECKING POSITIONS FOR: ${sym}`);
            try {
                const positions = await client.getOpenPositions(sym);
                console.log(`Response for ${sym}:`);
                console.log(JSON.stringify(positions, null, 2));
            } catch (e: any) {
                console.log(`Error checking ${sym}: ${e.message}`);
            }
        }

        // 3. Check Pending Orders
        logger.info(`\n📋 3. CHECKING OPEN ORDERS FOR: cmt_btcusdt`);
        const orders = await client.getOpenOrders('cmt_btcusdt');
        console.log(JSON.stringify(orders, null, 2));

    } catch (e: any) {
        logger.error(`Diagnostic Failed: ${e.message}`);
    }
}

debugAccount();
