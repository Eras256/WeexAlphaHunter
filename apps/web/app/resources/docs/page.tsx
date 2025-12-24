import { Terminal, Copy } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-4 text-sm">Getting Started</h3>
                        <ul className="space-y-4 mb-8 border-l border-white/10 ml-1">
                            <li className="pl-4 text-purple-400 font-semibold border-l-2 border-purple-400 -ml-[2px]">Introduction</li>
                            <li className="pl-4 text-gray-400 hover:text-white cursor-pointer">Architecture</li>
                            <li className="pl-4 text-gray-400 hover:text-white cursor-pointer">Installation</li>
                            <li className="pl-4 text-gray-400 hover:text-white cursor-pointer">Configuration</li>
                        </ul>

                        <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-4 text-sm">Tutorials</h3>
                        <ul className="space-y-4 border-l border-white/10 ml-1">
                            <li className="pl-4 text-gray-400 hover:text-white cursor-pointer">Running a Local Backtest</li>
                            <li className="pl-4 text-gray-400 hover:text-white cursor-pointer">Deploying to Production</li>
                            <li className="pl-4 text-gray-400 hover:text-white cursor-pointer">Custom Strategies</li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-6">WAlphaHunter Documentation</h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Complete guide to the WAlphaHunter algorithmic trading system. Learn how to set up, configure, and extend the platform.
                        </p>

                        <hr className="border-white/10 mb-8" />

                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                            <p className="text-gray-300 mb-4">
                                The fastest way to get started is using our CLI tool. Ensure you have Node.js 20+ installed.
                            </p>

                            <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm border border-white/10 flex justify-between items-center mb-8">
                                <span className="text-green-400">$ npx wah-cli init my-strategy</span>
                                <Copy className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" />
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Core Concepts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white/5 p-6 rounded-lg">
                                    <h3 className="font-bold text-lg mb-2">Engine</h3>
                                    <p className="text-gray-400 text-sm">The central event loop that processes ticks and manages order lifecycles.</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-lg">
                                    <h3 className="font-bold text-lg mb-2">Compliance</h3>
                                    <p className="text-gray-400 text-sm">The module responsible for generating ZK proofs and pushing them to Base.</p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Architecture</h2>
                            <p className="text-gray-300">
                                WAlphaHunter follows a hexagonal architecture, keeping the core domain logic isolated from external adapters like WEEX API and Base blockchain interfaces.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
