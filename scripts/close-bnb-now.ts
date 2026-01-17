
import { WeexClient } from "../packages/engine-compliance/src/weex-client.js";
import { logger } from "../packages/core/src/index.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

async function closeBNB() {
    const client = new WeexClient("live");

    console.log("🔪 FLASH CLOSING BNB POSITION...");

    // Try both variants just in case
    const symbols = ["cmt_bnbusdt", "BNBUSDT"];

    let closed = false;
    for (const s of symbols) {
        try {
            const positions = await client.getOpenPositions();
            const bnbPos = positions.find((p: any) => p.symbol.toLowerCase() === s.toLowerCase());

            if (bnbPos) {
                console.log(`🎯 Found BNB Position: ${bnbPos.symbol} | Size: ${bnbPos.size}`);
                await client.closePosition(bnbPos.symbol);
                console.log(`✅ CLOSED ${bnbPos.symbol} SUCCESSFULLY.`);
                closed = true;
                break;
            }
        } catch (e: any) {
            console.error(`⚠️ Error checking/closing ${s}: ${e.message}`);
        }
    }

    if (!closed) {
        console.log("ℹ️ No Open BNB Position found. Maybe it hit SL/TP already?");
    }
}

closeBNB();
