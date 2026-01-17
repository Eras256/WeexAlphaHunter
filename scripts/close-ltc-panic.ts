
import { WeexClient } from '../packages/engine-compliance/src/weex-client';
import { logger } from '../packages/logger/src';

// Force credentials from environment
const client = new WeexClient({
    apiKey: process.env.WEEX_API_KEY || '',
    secretKey: process.env.WEEX_SECRET_KEY || '',
    passphrase: process.env.WEEX_PASSPHRASE || '',
    isSimulation: false
});

async function closeLTC() {
    console.log('🚨 PANIC: Closing LTC Position IMMEDIATELY...');

    // Exact symbol usually needed
    const symbols = ['cmt_ltcusdt', 'LTCUSDT', 'ltcusdt'];

    for (const sym of symbols) {
        try {
            console.log(`Trying Flash Close on ${sym}...`);
            await client.flashClosePosition(sym);
            console.log(`✅ Flash Close triggered for ${sym}`);
        } catch (e: any) {
            console.error(`Error on ${sym}:`, e.message);
        }
    }
}

closeLTC();
