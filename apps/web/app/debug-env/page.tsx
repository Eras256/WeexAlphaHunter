'use client';

export default function EnvDebugPage() {
    const envVars = {
        NEXT_PUBLIC_BASE_RPC_URL: process.env.NEXT_PUBLIC_BASE_RPC_URL,
        NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
        NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS: process.env.NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS,
        NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS: process.env.NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS,
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Environment Variables Debug</h1>
            <div className="bg-gray-900 p-6 rounded-lg">
                <pre className="text-sm">
                    {JSON.stringify(envVars, null, 2)}
                </pre>
            </div>
        </div>
    );
}
