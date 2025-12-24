
import { createThirdwebClient, getRpcClient } from "thirdweb";
import { eth_blockNumber } from "thirdweb/rpc";
import { baseSepolia, sepolia, ethereum } from "../lib/chains";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables manually since we are running a standalone script
const envPath = path.resolve(__dirname, "../../../.env.local");
dotenv.config({ path: envPath });

async function testConnection(chain: any, name: string) {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

    if (!secretKey && !clientId) {
        console.error("❌ ERROR: No keys found in environment.");
        process.exit(1);
    }

    const client = createThirdwebClient(
        secretKey ? { secretKey } : { clientId: clientId || "" }
    );

    console.log(`\nTesting connection to ${name} (Chain ID: ${chain.id})...`);
    console.log(`RPC URL: ${chain.rpc}`);

    try {
        const rpcRequest = getRpcClient({ client, chain });
        const blockNumber = await eth_blockNumber(rpcRequest);
        console.log(`✅ SUCCESS: Connected! Latest Block: ${blockNumber}`);
        return true;
    } catch (error: any) {
        console.error(`❌ FAILED: Could not connect to ${name}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("🔍 Starting Backend Chain Validation...\n");
    console.log("Loading env from:", path.resolve(__dirname, "../../.env.local"));

    // Test Base Sepolia
    await testConnection(baseSepolia, "Base Sepolia");

    // Test Sepolia
    await testConnection(sepolia, "Sepolia");

    // Test Ethereum Mainnet
    await testConnection(ethereum, "Ethereum Mainnet");
}

main().catch(console.error);
