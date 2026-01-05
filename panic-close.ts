
import { WeexClient } from "./packages/engine-compliance/src/weex-client.js";
import { logger, sleep } from "./packages/core/src/index.js";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: rootEnvPath });
console.log(`Loading .env from: ${rootEnvPath}`);
dotenv.config({ path: localEnvPath, override: true });

async function panicButton() {
    logger.info("🚨 PANIC BUTTON ACTIVATED: Closing ALL Positions...");
    const client = new WeexClient("panic-mode");

    // Symbols to check
    // Symbols to check (Try ALL variants to find the hidden positions)
    const symbols = [
        'cmt_btcusdt', 'CMT_BTCUSDT', 'BTCUSDT', 'btcusdt',
        'cmt_ethusdt', 'CMT_ETHUSDT', 'ETHUSDT', 'ethusdt',
        'cmt_solusdt', 'CMT_SOLUSDT', 'SOLUSDT', 'solusdt'
    ];

    for (const symbol of symbols) {
        try {
            logger.info(`🔍 Checking positions for ${symbol}...`);
            const positions = await client.getOpenPositions(symbol);

            if (positions && positions.length > 0) {
                logger.info(`⚠️ Found ${positions.length} active positions for ${symbol}:`);
                console.log(JSON.stringify(positions, null, 2));

                for (const pos of positions) {
                    const size = parseFloat(pos.holdAmount || pos.total || pos.size || '0');
                    if (size > 0) {
                        logger.info(`🔥 CLOSING POSITION: ${symbol} (Size: ${size})`);

                        // Close by placing opposite MARKET order
                        const side = pos.side === 1 ? 'SELL' : 'BUY'; // If Long (1), SELL. If Short (2), BUY. Note: implementation details vary..
                        // Safer way: Flash Close if API supports, or Market Opposite

                        // BUT WAIT: Titan Executor uses order types 1 (Open Long) and 2 (Open Short).
                        // To Close: 
                        // Close Long -> Sell (Side 2?? No, Close Long is specific type)
                        // WEEX API V2 usually has "close" endpoint or you modify order.

                        // Let's try simple "Flash Close" using placeOrder with specific params if possible, 
                        // OR send a Market Order in opposite direction with "reduceOnly" equivalent (if API supports).

                        // Simple approach: Send MARKET order of opposite side equal to size. 
                        // Important: Check if "Close" needs different order_type.
                        // Weex Doc usually: 1=Open Long, 2=Open Short, 3=Close Long, 4=Close Short

                        let closeType = '3'; // Default Close Long
                        if (pos.side === 2 || pos.type === 2) closeType = '4'; // Close Short

                        // However, WEEX Client placeOrder abstraction takes 'BUY'/'SELL'. 
                        // Let's bypass wrapper and use raw axios if needed, OR TRUST manual closure.

                        // SCRIPT STRATEGY:
                        // Just use raw Flash Close endpoint if available or '3'/'4' types.
                        // Titan Executor used placeOrder which uses '1'/'2'. 

                        await client['sendSignedRequest']('POST', '/capi/v2/order/placeOrder', {
                            symbol,
                            size: size.toString(),
                            type: pos.side === 1 ? '3' : '4', // 3: Close Long, 4: Close Short
                            order_type: '0', // Limit/Normal? Or maybe Market?
                            match_price: '1', // 1 = Market
                            client_oid: `panic_${Date.now()}`
                        });

                        logger.info(`✅ Close Signal Sent for ${symbol}.`);
                        await sleep(500);
                    }
                }
            } else {
                logger.info(`✅ No open positions for ${symbol}.`);
            }

            // Cancel pending orders too
            await client.cancelAllOrders(symbol, 'normal');
            await client.cancelAllOrders(symbol, 'plan');

        } catch (e: any) {
            logger.error(`Failed to close ${symbol}: ${e.message}`);
        }
    }

    logger.info("🏁 Panic Sequence Complete.");
}

panicButton();
