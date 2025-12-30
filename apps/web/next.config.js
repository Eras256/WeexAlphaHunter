/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@wah/core"],
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.ipfscdn.io',
            },
            {
                protocol: 'https',
                hostname: 'ipfs.io',
            },
            {
                protocol: 'https',
                hostname: 'dh20z9nlss3cc.cloudfront.net', // Common crypto icon source
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'ethereum.org',
            }
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
        NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS: process.env.NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS,
        NEXT_PUBLIC_SEPOLIA_STRATEGY_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_SEPOLIA_STRATEGY_REGISTRY_ADDRESS,
    },
};

module.exports = nextConfig;
