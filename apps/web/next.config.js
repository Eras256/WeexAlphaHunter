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
};

module.exports = nextConfig;
