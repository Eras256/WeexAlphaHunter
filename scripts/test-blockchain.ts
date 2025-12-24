import { createBlockchainClient } from '@wah/core';
import dotenv from 'dotenv';

dotenv.config();

async function testBlockchainIntegration() {
    console.log('🧪 Testing Blockchain Integration...\n');

    // Create client for Base Sepolia
    const client = createBlockchainClient('baseSepolia');

    if (!client) {
        console.log('❌ Blockchain client not configured.');
        console.log('   Please deploy contracts first and update .env.local');
        console.log('   Run: npm run deploy:base-sepolia');
        return;
    }

    try {
        // Check wallet balance
        console.log('💰 Checking wallet balance...');
        const balance = await client.getBalance();
        console.log(`   Balance: ${balance} ETH\n`);

        if (parseFloat(balance) < 0.001) {
            console.log('⚠️  Low balance! Get testnet ETH from:');
            console.log('   https://www.coinbase.com/faucets\n');
        }

        // Check gas price
        console.log('⛽ Checking gas price...');
        const gasPrice = await client.getGasPrice();
        console.log(`   Gas Price: ${gasPrice} gwei\n`);

        // Get stats
        console.log('📊 Getting blockchain stats...');
        const stats = await client.getStats();
        console.log(`   Total Trades: ${stats.totalTrades}`);
        console.log(`   Total Decisions: ${stats.totalDecisions}\n`);

        // Test trade proof submission (commented out to avoid spending gas)
        console.log('📝 Test trade proof submission (dry run)...');
        const testTrade = {
            tradeId: `test-${Date.now()}`,
            aiDecisionId: `ai-${Date.now()}`,
            symbol: 'BTC/USDT',
            price: 95000,
            qty: 0.1,
            side: 'BUY' as const,
            aiConfidence: 0.92
        };
        console.log('   Trade data prepared:', testTrade);
        console.log('   (Uncomment code to actually submit)\n');

        // Uncomment to actually submit:
        // const txHash = await client.submitTradeProof(testTrade);
        // console.log('✅ Trade proof submitted!');
        // console.log(`   Transaction: https://sepolia.basescan.org/tx/${txHash}\n`);

        console.log('✅ Blockchain integration test complete!');
        console.log('\n📚 Next steps:');
        console.log('   1. Uncomment the submission code to test real transactions');
        console.log('   2. Integrate into your trading engine');
        console.log('   3. Monitor gas costs and optimize batch submissions');

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   - Ensure contracts are deployed');
        console.error('   - Check .env.local has correct addresses');
        console.error('   - Verify you have testnet ETH');
        console.error('   - Check RPC URL is accessible');
    }
}

// Run test
testBlockchainIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
