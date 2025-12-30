import { ethers } from 'ethers';

async function checkOwner() {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const contractAddress = '0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC';

    const abi = ['function owner() view returns (address)'];
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const owner = await contract.owner();
    console.log("Contract Owner:", owner);
    console.log("Your Wallet:   0xf05E0458e954D3232A117169A5226b2A7ef589AB");
    console.log("Match:", owner.toLowerCase() === '0xf05E0458e954D3232A117169A5226b2A7ef589AB'.toLowerCase() ? 'YES ✅' : 'NO ❌');
}

checkOwner();
