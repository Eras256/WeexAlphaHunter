
import { WeexClient } from "../packages/engine-compliance/src/weex-client.js";
import { logger } from "../packages/core/src/index.js";
import * as dotenv from 'dotenv';
import * as path from 'path';

const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath, override: true });

async function checkBalance() {
    const client = new WeexClient("balance-check");
    logger.info("📊 READ-ONLY BALANCE CHECK");

    try {
        const account = await client.getAccountInfo();
        console.log("---------------------------------------------------");
        console.log(JSON.stringify(account, null, 2));
        console.log("---------------------------------------------------");

        if (Array.isArray(account)) {
            const usdt = account.find((a: any) => a.asset === 'USDT' || a.currency === 'USDT' || a.coinName === 'USDT');
            if (usdt) {
                logger.info(`✅ USDT FOUND:`);
                logger.info(`   Equity: ${usdt.equity}`);
                logger.info(`   Available: ${usdt.available}`);
                logger.info(`   Frozen: ${usdt.frozen}`);
                logger.info(`   Unrealized PnL: ${usdt.unrealizePnl}`);
            } else {
                logger.warn("⚠️ USDT wallet not found in response.");
            }
        }
    } catch (e: any) {
        logger.error(`Error: ${e.message}`);
    }
}

checkBalance();
