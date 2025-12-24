import { createGeminiClient } from './packages/core/dist/gemini.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function quickTest() {
    console.log('🧪 Quick Gemini Test\n');

    const gemini = createGeminiClient();

    if (!gemini.isConfigured()) {
        console.error('❌ GEMINI_API_KEY not set in .env.local');
        process.exit(1);
    }

    console.log('✅ API Key configured\n');

    try {
        console.log('Testing simple generation...');
        const result = await gemini.generateContent('Say "Hello from Gemini!" and nothing else.', {
            maxOutputTokens: 64,
            temperature: 0.5
        });

        console.log(`✅ Model: ${result.modelUsed}`);
        console.log(`✅ Response: ${result.data}`);
        console.log('\n🎉 Gemini integration working!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

quickTest();
