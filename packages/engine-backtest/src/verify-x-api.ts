import { TwitterApi } from 'twitter-api-v2';
import { logger } from '@wah/core';
import * as dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env (try root)
const envPath = path.resolve(__dirname, '../../../../.env.local'); // Assuming src/ is inside packages/engine-backtest
// Backup: try cwd
dotenv.config({ path: envPath });
dotenv.config({ path: '.env.local' }); // Try local just in case

async function verifyX() {
    logger.info("🐦 Testing X / Twitter API Connection...");

    const appKey = process.env.X_API_KEY;
    const appSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        logger.error("❌ Missing X API Credentials.");
        console.log("Keys found:", { appKey: !!appKey, appSecret: !!appSecret, accessToken: !!accessToken, accessSecret: !!accessSecret });
        return;
    }

    const client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });

    try {
        // 1. Verify User (Me)
        const me = await client.v2.me();
        if (me.data) {
            logger.info(`✅ Authenticated as: @${me.data.username} (ID: ${me.data.id})`);
            logger.info(`   Name: ${me.data.name}`);
        } else {
            logger.error("❌ Authentication Failed.");
        }

        // 2. Search Test
        logger.info("🔍 Testing Search (Read Permission)...");
        const search = await client.v2.search("Bitcoin", { max_results: 10 });
        // Checks
        if (search.data && search.data.length > 0) {
            logger.info(`✅ Search successful! Found ${search.data.length} tweets.`);
        } else {
            logger.warn("⚠️ Search empty or rate limited.");
        }

    } catch (e: any) {
        logger.error(`❌ API Error: ${e.message}`);
        console.error(e);
    }
}

verifyX();
