
import axios from 'axios';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env directly
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function rawTest() {
    console.log("🛠️  RAW AXIOS TEST for WEEX 521 Error...");

    // Credentials
    const apiKey = process.env.WEEX_API_KEY!;
    const apiSecret = process.env.WEEX_SECRET_KEY!;
    const passphrase = process.env.WEEX_PASSPHRASE!;

    // Endpoint
    const baseUrl = "https://api-contract.weex.com";
    const endpoint = "/capi/v2/order/uploadAiLog";

    // Payload
    const body = {
        orderId: "702096693205664150",
        stage: "DEBUG_CHECK",
        model: "TEST_BOT_RAW",
        input: { check: true },
        output: { result: "ok" },
        explanation: "Raw connectivity check"
    };

    // Sign
    const timestamp = Date.now().toString();
    const bodyStr = JSON.stringify(body);
    const payloadSignature = `${timestamp}POST${endpoint}${bodyStr}`;
    const signature = crypto.createHmac('sha256', apiSecret).update(payloadSignature).digest('base64');

    try {
        console.log(`📤 POST ${baseUrl}${endpoint}`);
        const response = await axios.post(baseUrl + endpoint, body, {
            headers: {
                'Content-Type': 'application/json',
                'ACCESS-KEY': apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': passphrase,
                'locale': 'en-US'
            }
        });

        console.log("✅ SUCCESS (200 OK)!");
        console.log("Response:", JSON.stringify(response.data, null, 2));
        console.log("\n🎉 CONGRATS! Your IP is whitelisted. No need to message Admin.");

    } catch (error: any) {
        if (error.response) {
            console.log(`\n❌ HTTP ERROR: ${error.response.status} ${error.response.statusText}`);
            console.log("Headers:", JSON.stringify(error.response.headers, null, 2));
            try {
                console.log("Body:", JSON.stringify(error.response.data, null, 2));
            } catch (e) {
                console.log("Body (Raw):", error.response.data);
            }

            // Generate Admin Message
            if (error.response.status === 521 || error.response.status === 403) {
                console.log("\n📋 SEND THIS TO ADMIN:");
                console.log(`Hi Admin, getting Error ${error.response.status} on uploadAiLog.`);
                console.log(`IP: [Your IP]`);
                console.log(`UID: ${process.env.WEEX_UID}`);
                console.log(`Response: ${JSON.stringify(error.response.data)}`);
            }
        } else {
            console.log("❌ Network/Code Error:", error.message);
        }
    }
}

rawTest();
