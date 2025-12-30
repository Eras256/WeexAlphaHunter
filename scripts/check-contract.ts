import { ethers } from 'ethers';

async function checkContract() {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const contractAddress = '0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC';

    const code = await provider.getCode(contractAddress);
    console.log("Contract Address:", contractAddress);
    console.log("Has Code:", code !== '0x' ? 'YES ✅' : 'NO ❌');
    console.log("Code Length:", code.length, "bytes");
}

checkContract();
