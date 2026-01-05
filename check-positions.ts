import { WeexClient } from './packages/engine-compliance/src/weex-client.js';
import { logger } from './packages/core/src/logger.js';

const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt'];

async function checkPositions() {
    logger.info('📊 Checking open positions...\n');

    const exchange = new WeexClient('live');

    for (const symbol of SYMBOLS) {
        try {
            const positions = await exchange.getOpenPositions(symbol);

            if (positions && positions.length > 0) {
                logger.info(`\n💼 ${symbol.toUpperCase()} - Open Positions:`);
                positions.forEach((pos: any, index: number) => {
                    logger.info(`   Position ${index + 1}:`);
                    logger.info(`      Direction: ${pos.side === '1' ? 'LONG' : 'SHORT'}`);
                    logger.info(`      Amount: ${pos.holdAmount || pos.total || 'N/A'}`);
                    logger.info(`      Entry Price: ${pos.openPrice || 'N/A'}`);
                    logger.info(`      Current Price: ${pos.currentPrice || 'N/A'}`);
                    logger.info(`      PnL: ${pos.unrealizedPnl || 'N/A'}`);
                    logger.info(`      Margin: ${pos.margin || 'N/A'}`);
                });
            } else {
                logger.info(`✅ ${symbol.toUpperCase()} - No open positions`);
            }
        } catch (error: any) {
            logger.warn(`⚠️ Could not check ${symbol}: ${error.message}`);
        }
    }

    logger.info('\n📋 Summary complete!');
}

checkPositions().catch(console.error);
