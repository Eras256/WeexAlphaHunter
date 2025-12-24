import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const contractAddress = "0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC";
    const [signer] = await ethers.getSigners();

    console.log("📍 Signer Address:", signer.address);

    const TradeVerifier = await ethers.getContractFactory("TradeVerifier");
    const tradeVerifier = TradeVerifier.attach(contractAddress);

    const owner = await tradeVerifier.owner();
    console.log("👑 Contract Owner:", owner);

    const isAuthorized = await tradeVerifier.authorizedSubmitters(signer.address);
    console.log("✅ Is Signer Authorized?", isAuthorized);

    if (!isAuthorized) {
        console.log("⚠️ Authorizing signer...");
        if (owner.toLowerCase() === signer.address.toLowerCase()) {
            const tx = await tradeVerifier.authorizeSubmitter(signer.address);
            await tx.wait();
            console.log("🎉 Signer authorized!");
        } else {
            console.log("❌ Signer is NOT owner. Cannot authorize self.");
        }
    }
}

main().catch(console.error);
