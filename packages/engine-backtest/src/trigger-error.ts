
import { WeexClient } from "../../engine-compliance/src/weex-client.js";
import { logger } from "../../core/src/index.js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load env
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function triggerError() {
    console.log("🛠️  Triggering Forced 521 Error on Log Upload Endpoint...");

    const weex = new WeexClient("live"); // Force Live Mode

    // Fake Log Payload
    const fakeLog = {
        orderId: "702096693205664150", // Use a real-ish ID from your logs
        stage: "TEST_ERROR_TRIGGER",
        model: "TEST_BOT_V1",
        input: { test: true },
        output: { action: "BUY" },
        explanation: "Testing Endpoint Connectivity for Admin Report"
    };

    try {
        console.log("📤 Sending Log Request...");
        await weex.uploadAiLog(fakeLog);
        console.log("✅ WOHA! Weird. It worked? (No error triggered)");
    } catch (e: any) {
        // This is what we want capturing
        console.log("\n❌ CAPTURED ERROR:");
        console.log("----------------------------------------");
        if (e.response) {
            console.log(`STATUS CODE: ${e.response.status}`);
            console.log(`STATUS TEXT: ${e.response.statusText}`);
            console.log(`HEADERS:`, JSON.stringify(e.response.headers, null, 2));
            console.log(`DATA:`, typeof e.response.data === 'string' ? e.response.data.substring(0, 200) : JSON.stringify(e.response.data));

            // Build the exact message for the user
            console.log("\n📋 COPY THIS FOR ADMIN:");
            console.log("----------------------------------------");
            console.log(`Hello config/admin, I am getting error ${e.response.status} on endpoint /capi/v2/order/uploadAiLog`);
            console.log(`Response Body: ${JSON.stringify(e.response.data)}`);
            console.log("----------------------------------------");
        } else {
            console.log("Error Message:", e.message);
        }
    }
}

triggerError();
