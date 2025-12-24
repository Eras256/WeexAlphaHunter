import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
    weex: {
        apiKey: process.env.WEEX_API_KEY || "",
        secretKey: process.env.WEEX_SECRET_KEY || "",
        passphrase: process.env.WEEX_PASSPHRASE || "",
        isTest: process.env.EXECUTION_MODE !== 'live',
        isProduction: process.env.EXECUTION_MODE === 'live'
    },
    ai: {
        geminiKey: process.env.GEMINI_API_KEY || ""
    },
    system: {
        logLevel: process.env.LOG_LEVEL || 'info',
        initialCapital: Number(process.env.INITIAL_CAPITAL) || 10000
    }
};
