import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkBalances() {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) {
        console.log("❌ PRIVATE_KEY not found in .env.local");
        return;
    }

    const wallet = new ethers.Wallet(pk);
    console.log("🔑 Wallet Address:", wallet.address);

    // Base Sepolia
    try {
        const baseProvider = new ethers.JsonRpcProvider('https://sepolia.base.org');
        const baseBal = await baseProvider.getBalance(wallet.address);
        console.log("🔵 Base Sepolia Balance:", ethers.formatEther(baseBal), "ETH");
    } catch (e: any) {
        console.log("❌ Base Sepolia Error:", e.message);
    }

    // Eth Sepolia
    try {
        const ethProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        const ethBal = await ethProvider.getBalance(wallet.address);
        console.log("⚪ Eth Sepolia Balance:", ethers.formatEther(ethBal), "ETH");
    } catch (e: any) {
        console.log("❌ Eth Sepolia Error:", e.message);
    }
}

checkBalances();
