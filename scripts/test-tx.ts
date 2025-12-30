import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TRADE_VERIFIER_ABI = [
    "function recordAIDecision(bytes32 _decisionHash, string memory _reasoning, uint16 _confidence) external",
    "function submitTradeProof(bytes32 _tradeHash, bytes32 _aiDecisionHash, string memory _symbol, string memory _exchangeOrderId, uint256 _price, uint256 _quantity, bool _isBuy, uint16 _aiConfidence) external"
];

async function testTransaction() {
    const pk = process.env.PRIVATE_KEY!;
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(pk, provider);
    const contract = new ethers.Contract('0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC', TRADE_VERIFIER_ABI, wallet);

    console.log("Wallet:", wallet.address);
    console.log("Testing recordAIDecision...");

    const decisionHash = ethers.keccak256(ethers.toUtf8Bytes('test-decision-' + Date.now()));
    const reasoning = "Test reasoning from diagnostic script";
    const confidence = 5000; // 50% scaled to uint16

    try {
        const tx = await contract.recordAIDecision(decisionHash, reasoning, confidence, {
            gasLimit: 500000
        });
        console.log("TX Hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ SUCCESS! Block:", receipt.blockNumber);
    } catch (error: any) {
        console.log("❌ FAILED:", error.message);
        if (error.data) {
            console.log("Revert Data:", error.data);
        }
    }
}

testTransaction();
