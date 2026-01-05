import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

console.log('--- WAlphaHunter Environment Diagnostic ---');
const rootDir = process.cwd();
console.log('CWD:', rootDir);

const envPath = path.resolve(rootDir, '.env');
const localEnvPath = path.resolve(rootDir, '.env.local');

console.log('Checking .env at:', envPath);
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log('.env exists. Size:', content.length, 'bytes');
    if (content.length < 10) {
        console.log('WARNING: .env seems empty or very small!');
        console.log('Content preview:', content);
    }
} else {
    console.log('ERROR: .env file NOT FOUND!');
}

console.log('Checking .env.local at:', localEnvPath);
if (fs.existsSync(localEnvPath)) {
    const content = fs.readFileSync(localEnvPath, 'utf-8');
    console.log('.env.local exists. Size:', content.length, 'bytes');
} else {
    console.log('.env.local NOT FOUND (Optional)');
}

// Load .env
console.log('Loading .env...');
const result1 = dotenv.config({ path: envPath });
if (result1.error) console.log('Error loading .env:', result1.error.message);

// Load .env.local
console.log('Loading .env.local...');
const result2 = dotenv.config({ path: localEnvPath, override: true });
if (result2.error) console.log('Error loading .env.local:', result2.error.message);

// Check Keys
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
    console.log('✅ GEMINI_API_KEY Found!');
    console.log('   Length:', geminiKey.length);
    console.log('   Prefix:', geminiKey.substring(0, 5) + '...');
} else {
    console.log('❌ GEMINI_API_KEY is MISSING in process.env');
}

const groqKey = process.env.GROQ_API_KEY;
if (groqKey) console.log('✅ GROQ_API_KEY Found');
else console.log('⚠️ GROQ_API_KEY Missing');

const openRouterKey = process.env.OPENROUTER_API_KEY;
if (openRouterKey) console.log('✅ OPENROUTER_API_KEY Found');
else console.log('⚠️ OPENROUTER_API_KEY Missing');

console.log('--- End Diagnostic ---');
