import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env.local');

console.log("🔍 Debugging .env.local loading...\n");

if (fs.existsSync(envPath)) {
    const buffer = fs.readFileSync(envPath);
    let content = buffer.toString('utf8');

    // Check encoding
    if (content.indexOf('\0') !== -1) {
        console.log("⚠️ UTF-16 detected, converting...");
        content = buffer.toString('utf16le');
    }

    // Manual parse with detailed logging
    const lines = content.split(/\r?\n/);
    const xKeys = {};

    lines.forEach((line, idx) => {
        if (line.trim().startsWith('X_')) {
            const match = line.match(/^\s*(X_[\w_]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                const value = match[2] || '';
                xKeys[key] = value;
                console.log(`Line ${idx + 1}: ${key} = ${value ? '***' + value.substring(value.length - 4) : '(empty)'}`);
            } else {
                console.log(`Line ${idx + 1}: Failed to parse: "${line.substring(0, 30)}..."`);
            }
        }
    });

    console.log("\n📊 Summary:");
    console.log("X_API_KEY:", xKeys.X_API_KEY ? `✅ Found (${xKeys.X_API_KEY.length} chars)` : "❌ Missing");
    console.log("X_API_SECRET:", xKeys.X_API_SECRET ? `✅ Found (${xKeys.X_API_SECRET.length} chars)` : "❌ Missing");
    console.log("X_ACCESS_TOKEN:", xKeys.X_ACCESS_TOKEN ? `✅ Found (${xKeys.X_ACCESS_TOKEN.length} chars)` : "❌ Missing");
    console.log("X_ACCESS_TOKEN_SECRET:", xKeys.X_ACCESS_TOKEN_SECRET ? `✅ Found (${xKeys.X_ACCESS_TOKEN_SECRET.length} chars)` : "❌ Missing");
    console.log("X_BEARER_TOKEN:", xKeys.X_BEARER_TOKEN ? `✅ Found (${xKeys.X_BEARER_TOKEN.length} chars)` : "❌ Missing");

    // Load into process.env
    Object.keys(xKeys).forEach(k => {
        if (xKeys[k]) process.env[k] = xKeys[k];
    });

    // Also try standard dotenv
    dotenv.config({ path: envPath });

    console.log("\n🧪 Testing Authentication...");
    testAuth(xKeys);

} else {
    console.error("❌ .env.local not found!");
}

async function testAuth(keys) {
    const key = keys.X_API_KEY || process.env.X_API_KEY;
    const secret = keys.X_API_SECRET || process.env.X_API_SECRET;

    if (!key || !secret) {
        console.error("❌ Cannot test: Missing credentials");
        return;
    }

    try {
        const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
        const res = await fetch('https://api.twitter.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: 'grant_type=client_credentials'
        });

        const json = await res.json();

        if (json.access_token) {
            console.log("✅ Authentication SUCCESSFUL!");
            console.log("   Your X API credentials are VALID.");
        } else {
            console.error("❌ Authentication FAILED");
            console.log("Response:", JSON.stringify(json, null, 2));
        }
    } catch (e) {
        console.error("❌ Network error:", e.message);
    }
}
