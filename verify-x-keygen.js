import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

async function verifyKeys() {
    console.log("🔑 Authenticating X API Keys...");

    const key = process.env.X_API_KEY;
    const secret = process.env.X_API_SECRET;

    if (!key || !secret) {
        console.error("❌ Missing X_API_KEY or X_API_SECRET.");
        return;
    }

    // 1. Exchange Keys for Bearer Token (App-Only Auth)
    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
        const tokenRes = await fetch('https://api.twitter.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: 'grant_type=client_credentials'
        });

        const tokenJson = await tokenRes.json();

        if (tokenJson.token_type === 'bearer' && tokenJson.access_token) {
            console.log("✅ Authenticated! Keys are valid.");
            console.log("   Received temporary Bearer Token.");

            // 2. Perform Test Search
            const bearer = tokenJson.access_token;
            console.log("🔍 Testing Search with new token...");
            const searchRes = await fetch('https://api.twitter.com/2/tweets/search/recent?query=WEEX&max_results=10', {
                headers: { 'Authorization': `Bearer ${bearer}` }
            });

            const searchJson = await searchRes.json();
            if (searchJson.data) {
                console.log(`✅ Search Test PASSED! Found ${searchJson.data.length} tweets about WEEX.`);
                console.log(`   Sample: ${searchJson.data[0].text.substring(0, 50)}...`);
            } else {
                console.log("⚠️ Search returned empty (Normal for test). Keys are VALID.");
                if (searchJson.status === 403) console.log("   (Note: Free Tier Limitation on Search)");
            }
        } else {
            console.error("❌ Authentication Failed. Check Keys.");
            console.log(JSON.stringify(tokenJson, null, 2));
        }

    } catch (e) {
        console.error(`❌ Network Error: ${e.message}`);
    }
}

verifyKeys();
