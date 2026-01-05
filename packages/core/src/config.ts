import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
// Load .env from root
const rootDir = path.resolve(__dirname, '../../../');
console.log('[Config] Loading .env from:', rootDir);
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });

console.log('[Config] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log('[Config] GEMINI_API_KEY length:', process.env.GEMINI_API_KEY.length);
    console.log('[Config] GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY.substring(0, 4) + '...');
} else {
    console.warn('[Config] GEMINI_API_KEY is MISSING in process.env');
}

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
