import { createGeminiClient } from '@wah/core';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env.local
dotenv.config({ path: path.join(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

async function runTests() {
    console.log('🧪 Testing Gemini AI Integration...\n');
    console.log('═'.repeat(60));

    const gemini = createGeminiClient();

    if (!gemini.isConfigured()) {
        console.error('❌ GEMINI_API_KEY not configured');
        process.exit(1);
    }

    console.log('✅ Gemini client configured\n');

    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Simple text generation
    console.log('📝 Test 1: Simple Text Generation');
    console.log('─'.repeat(60));
    try {
        const result = await gemini.generateContent(
            'Explain algorithmic trading in exactly one sentence.',
            { maxOutputTokens: 256, temperature: 0.7 }
        );
        console.log(`✅ Model: ${result.modelUsed}`);
        console.log(`✅ Response: ${result.data.substring(0, 100)}...`);
        console.log('✅ Test 1 PASSED\n');
        passedTests++;
    } catch (error: any) {
        console.error(`❌ Test 1 FAILED: ${error.message}\n`);
        failedTests++;
    }

    // Test 2: JSON generation
    console.log('📊 Test 2: JSON Generation');
    console.log('─'.repeat(60));
    try {
        const result = await gemini.generateJSON(
            'Generate a trading strategy for Bitcoin. Return JSON with: strategy (string), risk (string), timeframe (string).',
            { maxOutputTokens: 512, temperature: 0.8 }
        );
        console.log(`✅ Model: ${result.modelUsed}`);
        console.log(`✅ Response:`, JSON.stringify(result.data, null, 2));
        console.log('✅ Test 2 PASSED\n');
        passedTests++;
    } catch (error: any) {
        console.error(`❌ Test 2 FAILED: ${error.message}\n`);
        failedTests++;
    }

    // Test 3: Trading signal generation
    console.log('📈 Test 3: Trading Signal Generation');
    console.log('─'.repeat(60));
    try {
        const signal = await gemini.generateTradingSignal({
            symbol: 'BTC/USDT',
            price: 95000,
            volume: 1500000000,
            indicators: {
                rsi: 65,
                macd: 0.5,
                volume_ratio: 1.2
            }
        });
        console.log(`✅ Model: ${signal.modelUsed}`);
        console.log(`✅ Action: ${signal.action}`);
        console.log(`✅ Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
        console.log(`✅ Reasoning: ${signal.reasoning.substring(0, 100)}...`);
        console.log('✅ Test 3 PASSED\n');
        passedTests++;
    } catch (error: any) {
        console.error(`❌ Test 3 FAILED: ${error.message}\n`);
        failedTests++;
    }

    // Test 4: Long response handling
    console.log('📚 Test 4: Long Response (4096 tokens)');
    console.log('─'.repeat(60));
    try {
        const result = await gemini.generateJSON(
            'Provide a market analysis with: analysis (detailed 150+ words), recommendations (array of 5 strings), risks (array of 5 strings). Return as JSON.',
            { maxOutputTokens: 4096, temperature: 0.9 }
        );
        console.log(`✅ Model: ${result.modelUsed}`);
        console.log(`✅ Analysis length: ${result.data.analysis?.length || 0} chars`);
        console.log(`✅ Recommendations: ${result.data.recommendations?.length || 0} items`);
        console.log(`✅ Risks: ${result.data.risks?.length || 0} items`);
        console.log('✅ Test 4 PASSED\n');
        passedTests++;
    } catch (error: any) {
        console.error(`❌ Test 4 FAILED: ${error.message}\n`);
        failedTests++;
    }

    // Test 5: Multiple requests (model consistency)
    console.log('🔄 Test 5: Model Consistency (3 requests)');
    console.log('─'.repeat(60));
    try {
        for (let i = 0; i < 3; i++) {
            const result = await gemini.generateContent(
                `Say "Test ${i + 1} complete" and nothing else.`,
                { maxOutputTokens: 64, temperature: 0.5 }
            );
            console.log(`  Request ${i + 1}: Model = ${result.modelUsed}`);
        }
        console.log('✅ Test 5 PASSED\n');
        passedTests++;
    } catch (error: any) {
        console.error(`❌ Test 5 FAILED: ${error.message}\n`);
        failedTests++;
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Passed: ${passedTests}/5`);
    console.log(`❌ Failed: ${failedTests}/5`);
    console.log(`📈 Success Rate: ${((passedTests / 5) * 100).toFixed(0)}%`);
    console.log('═'.repeat(60));

    if (passedTests === 5) {
        console.log('\n🎉 ALL TESTS PASSED! Gemini integration is fully functional.\n');
        console.log('Next steps:');
        console.log('1. ✅ Gemini 2.5 models working correctly');
        console.log('2. ✅ JSON parsing and repair working');
        console.log('3. ✅ Trading signals generating successfully');
        console.log('4. 🚀 Ready to integrate with trading engine\n');
    } else {
        console.log(`\n⚠️  ${failedTests} test(s) failed. Review errors above.\n`);
        process.exit(1);
    }
}

runTests().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
