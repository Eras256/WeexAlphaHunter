import { WeexClient } from './packages/engine-compliance/src/weex-client.js';
import { logger } from './packages/core/src/logger.js';

const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_solusdt'];

async function closeAllOrders() {
    logger.info('🧹 Starting cleanup of all open orders and positions...');

    const exchange = new WeexClient('live');

    for (const symbol of SYMBOLS) {
        try {
            logger.info(`\n📊 Processing ${symbol.toUpperCase()}...`);

            // Cancel all normal orders
            logger.info(`   Canceling normal orders...`);
            await exchange.cancelAllOrders(symbol, 'normal');
            await new Promise(resolve => setTimeout(resolve, 200));

            // Cancel all plan orders (stop loss / take profit)
            logger.info(`   Canceling plan orders...`);
            await exchange.cancelAllOrders(symbol, 'plan');
            await new Promise(resolve => setTimeout(resolve, 200));

            logger.info(`   ✅ ${symbol} orders cleared`);
        } catch (error: any) {
            logger.error(`   ❌ Error clearing ${symbol}: ${error.message}`);
        }
    }

    logger.info('\n✅ Cleanup complete!');
    logger.info('💡 Note: To close open positions, you need to manually close them in WEEX web interface.');
    logger.info('   Positions are not the same as orders and require market/limit orders to close.');
}

closeAllOrders().catch(console.error);
