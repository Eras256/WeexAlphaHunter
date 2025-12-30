'use client';
import Link from "next/link";
import { Handshake, Star, Server, Database, Cpu, Globe } from "lucide-react";

export default function PartnersPage() {
    const integrations = [
        {
            name: "WEEX Exchange",
            role: "Liquidity & Execution",
            desc: "Direct market access via ultra-low latency API. Provides deep liquidity for our HFT scalping and zero-fee trading tiers for WXT stakers.",
            icon: <Globe className="w-8 h-8 text-green-400" />,
            color: "green"
        },
        {
            name: "Google DeepMind",
            role: "Contextual Intelligence",
            desc: "Gemini powers our macro-analysis engine, processing 1M+ token context windows for news correlation.",
            icon: <Cpu className="w-8 h-8 text-blue-400" />,
            color: "blue"
        },
        {
            name: "DeepSeek",
            role: "Logic Engine",
            desc: "DeepSeek serves as the primary reasoning core for complex arbitrage strategies, offering SOTA logic performance.",
            icon: <Database className="w-8 h-8 text-purple-400" />,
            color: "purple"
        },
        {
            name: "X (Twitter)",
            role: "Social Data Firehose",
            desc: "Enterprise API access allows real-time ingestion of millions of tweets for sentiment analysis and alpha generation.",
            icon: <Server className="w-8 h-8 text-white" />,
            color: "gray"
        },
        {
            name: "Base",
            role: "Verifiable Layer",
            desc: "Secured by Ethereum, powered by Coinbase. Base Sepolia serves as our immutable ledger for trade verification.",
            icon: <Star className="w-8 h-8 text-blue-500" />,
            color: "blue"
        },
        {
            name: "Groq",
            role: "HFT Inference",
            desc: "Powering Llama with 300+ tokens/sec speeds for our high-frequency market making strategies.",
            icon: <ZapIcon className="w-8 h-8 text-orange-400" />,
            color: "orange"
        }
    ];

    // Helper map for dynamic colors since Tailwind doesn't support dynamic template literals well without safelisting
    const colorMap: Record<string, string> = {
        green: "hover:border-green-500/30 text-green-400",
        blue: "hover:border-blue-500/30 text-blue-400",
        purple: "hover:border-purple-500/30 text-purple-400",
        gray: "hover:border-gray-500/30 text-gray-400",
        orange: "hover:border-orange-500/30 text-orange-400",
    };

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                        Strategic Integrations
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        WAlphaHunter is not just a bot; it's a composite system orchestrated across the industry's most powerful infrastructure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {integrations.map(p => (
                        <div key={p.name} className={`bg-gray-900/50 border border-white/10 rounded-xl p-8 flex flex-col items-center text-center hover:bg-gray-900 transition duration-300 group ${colorMap[p.color] || ''}`}>
                            <div className={`w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5`}>
                                {p.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">{p.name}</h3>
                            <p className={`text-sm font-bold uppercase tracking-wider mb-4 ${colorMap[p.color]?.split(' ').pop()}`}>{p.role}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-24 p-8 bg-blue-900/10 border border-blue-500/20 rounded-2xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Official WEEX API Partner</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        Our system is optimized specifically for the WEEX matching engine, featuring direct co-location benefits and priority rate limits.
                    </p>
                    <a href="https://www.weex.com" target="_blank" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                        Open WEEX Account
                    </a>
                </div>

            </div>
        </div>
    );
}

function ZapIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
