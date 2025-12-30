const { ethers } = require('ethers');

async function testConnection() {
    const RPC_URL = 'https://black-frequent-ensemble.ethereum-sepolia.quiknode.pro/8f94f6c86a9f17de0bf3bfd2f290d22dcd097180';
    const CONTRACT_ADDRESS = '0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC';

    const ABI = [
        "function getStats() external view returns (uint256 totalTrades, uint256 totalDecisions, uint256 totalSubmitters)"
    ];

    console.log('Testing connection to Ethereum Sepolia...');
    console.log('RPC:', RPC_URL);
    console.log('Contract:', CONTRACT_ADDRESS);

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const stats = await contract.getStats();
        console.log('\n✅ SUCCESS!');
        console.log('Total Trades:', stats.totalTrades.toString());
        console.log('Total Decisions:', stats.totalDecisions.toString());
        console.log('Total Submitters:', stats.totalSubmitters.toString());
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }
}

testConnection();
