import { type Chain } from "thirdweb";
import {
    base as basePreset,
    baseSepolia as baseSepoliaPreset,
    ethereum as ethereumPreset,
    sepolia as sepoliaPreset
} from "thirdweb/chains";

// ==========================================
// Base Sepolia (Testnet)
// ==========================================
// We extend the preset to keep internal config (multicall, etc) but override RPC
export const baseSepolia: Chain = {
    ...baseSepoliaPreset,
    rpc: "https://sepolia.base.org",
    // Explicit icon to ensure it shows in UI
    icon: {
        url: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
        width: 200,
        height: 200,
        format: "png"
    }
};

// ==========================================
// Base Mainnet
// ==========================================
export const base: Chain = {
    ...basePreset,
    rpc: "https://mainnet.base.org",
    icon: {
        url: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
        width: 200,
        height: 200,
        format: "png"
    }
};

// ==========================================
// Ethereum Sepolia (Testnet)
// ==========================================
export const sepolia: Chain = {
    ...sepoliaPreset,
    rpc: "https://ethereum-sepolia.publicnode.com",
    icon: {
        url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        width: 200,
        height: 200,
        format: "png"
    }
};

// ==========================================
// Ethereum Mainnet
// ==========================================
export const ethereum: Chain = {
    ...ethereumPreset,
    rpc: "https://ethereum-rpc.publicnode.com",
    icon: {
        url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        width: 200,
        height: 200,
        format: "png"
    }
};
