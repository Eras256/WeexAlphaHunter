import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-pro', 'gemini-1.0-pro'];

    console.log("Testing Gemini Models...");

    for (const modelName of models) {
        try {
            console.log(`\nTesting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you online?");
            console.log(`✅ ${modelName} SUCCESS:`, result.response.text().substring(0, 50));
        } catch (e: any) {
            console.log(`❌ ${modelName} FAILED:`, e.message.split('\n')[0]);
        }
    }
}

testGemini();
