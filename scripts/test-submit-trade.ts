import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TRADE_VERIFIER_ABI = [
    "function submitTradeProof(bytes32 _tradeHash, bytes32 _aiDecisionHash, string memory _symbol, string memory _exchangeOrderId, uint256 _price, uint256 _quantity, bool _isBuy, uint16 _aiConfidence) external"
];

async function testSubmitTrade() {
    const pk = process.env.PRIVATE_KEY!;
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(pk, provider);
    const contract = new ethers.Contract('0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC', TRADE_VERIFIER_ABI, wallet);

    console.log("Wallet:", wallet.address);
    console.log("Testing submitTradeProof...");

    const tradeHash = ethers.keccak256(ethers.toUtf8Bytes('test-trade-' + Date.now()));
    const aiDecisionHash = ethers.keccak256(ethers.toUtf8Bytes('test-decision-' + Date.now()));
    const symbol = "BTC/USDT";
    const exchangeOrderId = "mock_123456";
    const price = BigInt(95000 * 1e8); // $95,000 scaled
    const quantity = BigInt(0.001 * 1e8); // 0.001 BTC scaled
    const isBuy = true;
    const aiConfidence = 5000; // 50%

    try {
        const tx = await contract.submitTradeProof(
            tradeHash,
            aiDecisionHash,
            symbol,
            exchangeOrderId,
            price,
            quantity,
            isBuy,
            aiConfidence,
            { gasLimit: 500000 }
        );
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

testSubmitTrade();
