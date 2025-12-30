
import { createBlockchainClient, logger } from '@wah/core';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function diagnose() {
    console.log("🔍 Diagnosing Blockchain Connection...");

    const blockchain = createBlockchainClient('baseSepolia');
    if (!blockchain) {
        console.error("❌ Failed to initialize blockchain client.");
        return;
    }

    try {
        const balance = await blockchain.getBalance();
        console.log(`💰 Wallet Balance: ${balance} ETH`);

        // We can't access private properties easily, but we can try a read-only call
        // checking the owner or authorized status requires ABI access which is private in BlockchainClient
        // taking a shortcut: try to call getStats() which is public view

        try {
            const stats = await blockchain.getStats();
            console.log(`✅ Connection to Contract Successful!`);
            console.log(`   Total Trades Recorded: ${stats.totalTrades}`);
            console.log(`   Total AI Decisions: ${stats.totalDecisions}`);
        } catch (e: any) {
            console.error(`❌ Contract Call Failed: ${e.message}`);
            if (e.code === 'CALL_EXCEPTION') {
                console.error("   Reason: Contract might not exist at this address or ABI mismatch.");
            }
        }

    } catch (e: any) {
        console.error(`❌ Diagnostic Failed: ${e.message}`);
    }
}

diagnose();
