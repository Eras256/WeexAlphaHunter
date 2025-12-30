import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: '.env.local' });

async function verifyX() {
    console.log("🐦 Testing X / Twitter API Connection...");

    const appKey = process.env.X_API_KEY;
    const appSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.error("❌ Missing X API Credentials in .env.local");
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
            console.log(`✅ Authenticated as: @${me.data.username} (ID: ${me.data.id})`);
            console.log(`   Name: ${me.data.name}`);
        } else {
            console.error("❌ Authentication Failed.");
        }

        // 2. Search Test
        console.log("🔍 Testing Search...");
        const search = await client.v2.search("Bitcoin", { max_results: 10 });
        if (search.data && search.data.length > 0) {
            console.log(`✅ Search successful! Found ${search.data.length} tweets.`);
        } else {
            console.log("⚠️ Search empty or rate limited.");
        }

    } catch (e) {
        console.error(`❌ API Error: ${e.message}`);
        // console.error(e);
    }
}

verifyX();
