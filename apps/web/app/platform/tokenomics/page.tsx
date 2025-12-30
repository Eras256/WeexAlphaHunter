'use client';
import { Coins, Percent, Lock, ArrowUpRight, Zap, Vote, BarChart } from "lucide-react";

export default function TokenomicsPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-mono text-xs uppercase tracking-wider">Official Ecosystem Token</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">WXT Powered Economy</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        High-velocity utility token fueling the UNUM consensus engine. Stake WXT to govern the Council of 6 and unlock institutional fee tiers.
                    </p>
                </div>

                {/* LIVE TICKER (Static Sim) */}
                <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-2xl p-6 mb-16 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black text-xl">W</div>
                        <div>
                            <div className="text-sm text-gray-400 uppercase tracking-widest">WXT / USDT</div>
                            <div className="text-3xl font-mono font-bold text-white">$0.0425 <span className="text-green-400 text-lg">+5.2%</span></div>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-4">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase">24h Vol</div>
                            <div className="font-mono">$124.5M</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase">Circulating</div>
                            <div className="font-mono">4.2B WXT</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* Utility 1 */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden group hover:border-indigo-500/60 transition">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <Percent size={100} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-indigo-400">Fee Zero-Point</h3>
                        <p className="text-gray-300 mb-4">
                            Staking &gt;100k WXT activates the <span className="text-white font-bold">Zero-Maker Fee</span> tier on WEEX. Essential for profitable HFT scalping strategies running on Llama.
                        </p>
                    </div>

                    {/* Utility 2 */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden group hover:border-purple-500/60 transition">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <Lock size={100} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-purple-400">Model Access</h3>
                        <p className="text-gray-300 mb-4">
                            Exclusive API keys for the full "Council of 6". Free users get 3 models; WXT holders get full consensus power including DeepSeek and Qwen.
                        </p>
                    </div>

                    {/* Utility 3 */}
                    <div className="bg-gradient-to-br from-pink-900/20 to-black border border-pink-500/30 rounded-2xl p-8 relative overflow-hidden group hover:border-pink-500/60 transition">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <Vote size={100} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-pink-400">AI Governance</h3>
                        <p className="text-gray-300 mb-4">
                            Vote on the "Council weights". WXT holders decide which AI model dictates the master signal during conflicting consensus events.
                        </p>
                    </div>
                </div>

                {/* TIER TABLE */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <BarChart className="w-6 h-6 text-green-400" />
                        Staking Tiers
                    </h2>
                    <div className="border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-4 bg-white/5 border-b border-white/10 p-4 font-bold text-gray-400 text-sm uppercase text-center">
                                <div>Tier</div>
                                <div>Holdings (WXT)</div>
                                <div>Maker/Taker Rebate</div>
                                <div>AI Models</div>
                            </div>
                            {[
                                { name: "Plankton", amt: "0", rebate: "0% / 0%", ai: "3 (Basic)" },
                                { name: "Dolphin", amt: "> 10,000", rebate: "10% / 5%", ai: "4 (+Llama)" },
                                { name: "Shark", amt: "> 50,000", rebate: "30% / 15%", ai: "5 (+DeepSeek)" },
                                { name: "Whale", amt: "> 250,000", rebate: "50% / 25%", ai: "6 (Full Council)" },
                            ].map((tier, i) => (
                                <div key={i} className="grid grid-cols-4 p-4 border-b border-white/5 text-center hover:bg-white/5 transition">
                                    <div className="font-bold text-white">{tier.name}</div>
                                    <div className="font-mono text-gray-400">{tier.amt}</div>
                                    <div className="text-green-400">{tier.rebate}</div>
                                    <div className="text-purple-400">{tier.ai}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
