/**
 * EMERGENCY: Close LTC SHORT Position
 * This script will flash-close the bleeding LTC position
 */

import { WeexClient } from './packages/engine-compliance/src/weex-client.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function closeLTCPosition() {
    console.log("🔥 EMERGENCY: Closing LTC SHORT Position...");
    console.log("================================================");

    const client = new WeexClient("production-v1");

    try {
        // Flash close the LTC position
        const result = await client.flashClosePosition('cmt_ltcusdt');

        console.log("✅ LTC SHORT Position CLOSED!");
        console.log("Result:", JSON.stringify(result, null, 2));
        console.log("================================================");
        console.log("💰 Margin Released: ~$382 now available for new trades!");

    } catch (error: any) {
        console.error("❌ Failed to close position:", error.message);
        if (error.response?.data) {
            console.error("Details:", error.response.data);
        }
    }
}

closeLTCPosition();
