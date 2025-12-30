import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TRADE_VERIFIER_ABI = [
    "function submitTradeProof(bytes32 _tradeHash, bytes32 _aiDecisionHash, string memory _symbol, string memory _exchangeOrderId, uint256 _price, uint256 _quantity, bool _isBuy, uint16 _aiConfidence) external"
];

async function debugSubmit() {
    const pk = process.env.PRIVATE_KEY!;
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(pk, provider);
    const contract = new ethers.Contract('0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC', TRADE_VERIFIER_ABI, wallet);

    const tradeHash = ethers.keccak256(ethers.toUtf8Bytes('debug-trade-' + Date.now()));
    const aiDecisionHash = ethers.keccak256(ethers.toUtf8Bytes('debug-decision-' + Date.now()));

    const args = [
        tradeHash,
        aiDecisionHash,
        "BTC/USDT",
        "mock_debug_123",
        BigInt(9500000000000), // 95000 * 1e8
        BigInt(100000),        // 0.001 * 1e8
        true,
        5000
    ];

    console.log("Wallet:", wallet.address);
    console.log("Args:", args);

    try {
        // Try static call first to see the revert reason
        await contract.submitTradeProof.staticCall(...args);
        console.log("Static call passed, proceeding to send...");

        const tx = await contract.submitTradeProof(...args, { gasLimit: 500000 });
        console.log("TX:", tx.hash);
        await tx.wait();
        console.log("✅ Success!");
    } catch (error: any) {
        console.log("❌ Error:", error.message);
        // Try to decode revert reason
        if (error.reason) {
            console.log("Revert Reason:", error.reason);
        }
        if (error.data) {
            console.log("Error Data:", error.data);
        }
    }
}

debugSubmit();
