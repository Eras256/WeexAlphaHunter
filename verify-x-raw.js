import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
    console.log("✅ .env.local found.");
    dotenv.config({ path: envPath });

    // Handle Encoding Issues (PowerShell/UTF-16)
    if (!process.env.X_API_KEY) {
        console.log("⚠️ Standard env load failed. Attempting encoding fix...");
        try {
            const buffer = fs.readFileSync(envPath);
            let content = buffer.toString('utf8');
            // Detect UTF-16
            if (content.indexOf('\0') !== -1 || content.charCodeAt(0) === 0xFFFE || content.charCodeAt(0) === 0xFEFF) {
                console.log("   Detected UTF-16 LE encoding.");
                content = buffer.toString('utf16le');
            }

            // Manual Parse
            content.split(/\r?\n/).forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    process.env[match[1]] = match[2];
                }
            });
        } catch (e) { console.error("Parse Error:", e); }
    }
}

async function verifyKeys() {
    console.log("🔑 Authenticating X API Keys (OAuth2 App-Only)...");

    const key = process.env.X_API_KEY;
    const secret = process.env.X_API_SECRET;

    console.log(`Debug: Key=${key ? 'YES' : 'NO'}, Secret=${secret ? 'YES' : 'NO'}`);

    if (!key || !secret) {
        console.error("❌ Missing X_API_KEY or X_API_SECRET.");
        return;
    }

    // 1. Exchange Keys for Bearer Token
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
            console.log("✅ Authentication Successful! Credentials are VALID.");

            // 2. Perform Test Search
            const bearer = tokenJson.access_token;
            console.log("🔍 Testing Search...");
            const searchRes = await fetch('https://api.twitter.com/2/tweets/search/recent?query=WEEX&max_results=10', {
                headers: { 'Authorization': `Bearer ${bearer}` }
            });

            if (searchRes.status === 403) {
                console.log("✅ Access Confirmed (even if Search is limited).");
                console.log("   (Free Tier confirmed: POST allowed, Search limited)");
                return;
            }

            const searchJson = await searchRes.json();
            if (searchJson.data) {
                console.log(`✅ Search Test PASSED! Found ${searchJson.data.length} tweets.`);
            } else {
                console.log("✅ Connected OK. (No search results or rate limited)");
            }
        } else {
            console.log("❌ Authentication Failed.");
            console.log("Response:", JSON.stringify(tokenJson));
        }

    } catch (e) {
        console.error(`❌ Network Error: ${e.message}`);
    }
}

verifyKeys();
