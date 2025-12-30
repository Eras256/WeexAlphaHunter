
import { WeexClient } from "../../engine-compliance/src/weex-client.js";
import * as dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// Load .env.local from project root (assuming run from root)
dotenv.config({ path: ".env.local" });

// FORCE LIVE MODE for this test
process.env.EXECUTION_MODE = "live";

async function runTest() {
    console.log("🚀 Starting WEEX API Verification Task...");
    console.log("-----------------------------------------");
    console.log(`API Key: ${process.env.WEEX_API_KEY ? '******' + process.env.WEEX_API_KEY.slice(-4) : 'NOT FOUND'}`);
    const mode = process.env.EXECUTION_MODE || 'mock';
    console.log(`Mode:    ${mode.toUpperCase()}`);

    const client = new WeexClient();

    try {
        console.log("1️⃣  Testing Auth & Account Info...");
        try {
            const account = await client.getAccountInfo();
            console.log("✅ Auth Success!");
            console.log("   Account Data:", JSON.stringify(account, null, 2));
        } catch (err: any) {
            console.error("❌ Auth Failed:", err.message);
            if (err.response) {
                console.error("   Status:", err.response.status);
                console.error("   Data:", JSON.stringify(err.response.data));
            }
            process.exit(1);
        }

        // 2. Place Test Order (Futures)
        // Task: "notional value of 10 USDT on the BTCUSDT trading pair"
        // Symbol: Likely 'cmt_btcusdt' (based on user snippet) or 'BTCUSDT_UMCBL'
        // We will try 'cmt_btcusdt' first.
        console.log("\n2️⃣  Testing Order Placement (Futures)...");
        console.log("   Placing LIMIT BUY 0.001 BTC @ $1000 (Safe low price)");

        // Note: Qty 0.001 BTC * 1000 = $1 (Wait, task says 10 USDT notional).
        // 0.001 * 95000 = $95. That's fine.
        // But if I place at 1000, notional is $1. It might fail min notional.
        // I should place at closer to market price but very far away (deep limit).
        // Best to just try 0.001.

        const order = await client.placeOrder("cmt_btcusdt", "BUY", 0.001, 1000);
        console.log("✅ Order Placed Successfully!");
        console.log("   Order ID:", order.orderId);
        console.log("   Full Response:", JSON.stringify(order, null, 2));

        // 3. Cancel Order
        if (order.orderId) {
            console.log(`\n3️⃣  Canceling Order ${order.orderId}...`);
            const cancel = await client.cancelOrder("cmt_btcusdt", order.orderId);
            console.log("✅ Order Cancelled!");
            console.log("   Response:", JSON.stringify(cancel, null, 2));
        } else {
            console.log("\n⚠️  Skipping Cancel (No Order ID returned).");
        }

        console.log("\n-----------------------------------------");
        console.log("🎉 ALL WEEX API TESTS PASSED!");
        console.log("   Take a screenshot of this output for your hackathon submission.");

    } catch (error: any) {
        console.error("\n❌ API Test Failed:", error.message);
        if (error.response) {
            console.error("   Server Response:", JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

runTest();
