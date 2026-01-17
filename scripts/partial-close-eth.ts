
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const envPath = path.resolve(rootDir, '.env');
const envLocalPath = path.resolve(rootDir, '.env.local');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config({ path: envPath });
}

async function closeHalfEth() {
    console.log("✂️ STARTING PARTIAL CLOSE (50% ETH Position)...");
    console.log("----------------------------------------");

    const exchange = new WeexClient();
    exchange.mode = 'live';

    // 1. Get current ETH position
    const positions = await exchange.getOpenPositions('cmt_ethusdt');

    // Check if we have positions in response (Weex format varies)
    // Response might be direct array or wrapped
    let ethPos = null;
    if (Array.isArray(positions)) {
        ethPos = positions.find((p: any) => p.symbol === 'cmt_ethusdt' && parseFloat(p.openPrice) > 0);
    }

    if (!ethPos) {
        console.log("⚠️ No Active ETH Position found via API check (or API format mismatch).");
        console.log("   Trying blind close of 50%...");
        // Fallback: If we can't read exact size, we can't calc 50%.
        // We will try to place a MARKET SELL for a safe amount (e.g. 0.1 ETH) or try Flash Close.
        // But Flash Close closes 100%. We want 50%.
        console.log("❌ Cannot safely calculate 50% without reading position size. Aborting auto-partial.");
        return;
    }

    const totalSize = Math.abs(parseFloat(ethPos.holdAmount || ethPos.totalAmount || ethPos.amount)); // Need exact field
    // Usually 'holdAmount' in Weex V2

    if (!totalSize || totalSize <= 0) {
        console.log("❌ Position size is 0 or unreadable:", JSON.stringify(ethPos));
        return;
    }

    const closeSize = totalSize / 2;
    console.log(`📊 Found Position: ${totalSize} ETH. Closing: ${closeSize} ETH...`);

    // Place Market Order to Close (Opposite Side)
    // If Long (side=1), we Short (side=2) to close.
    // ethPos.side might be '1' (Long) or '2' (Short)
    const closeSide = ethPos.side === '1' ? 'SELL' : 'BUY';

    try {
        const result = await exchange.placeOrder(
            'cmt_ethusdt',
            closeSide,
            closeSize, // Quantity to close
            undefined, // Market price
            undefined // No SL/TP on the closing order itself
        );
        console.log("✅ Partial Close Order Sent:", JSON.stringify(result));
    } catch (e: any) {
        console.error("❌ Partial Close Failed:", e.message);
    }
}

closeHalfEth();
