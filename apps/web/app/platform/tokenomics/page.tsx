import { Coins, Percent, Lock, ArrowUpRight } from "lucide-react";

export default function TokenomicsPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">WXT Tokenomics</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        The native utility token of the WEEX ecosystem fuels the WAlphaHunter engine. Hold WXT to unlock premium features and reduce trading costs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* Utility 1 */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Percent size={100} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-indigo-400">Fee Discounts</h3>
                        <p className="text-gray-300 mb-4">
                            Staking WXT provides up to <span className="text-white font-bold">50% reduction</span> in trading fees on the WEEX platform, directly increasing net profitability of high-frequency strategies.
                        </p>
                    </div>

                    {/* Utility 2 */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Lock size={100} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-purple-400">Strategy Access</h3>
                        <p className="text-gray-300 mb-4">
                            Exclusive access to "Alpha" tier strategies powered by advanced GEMINI models. Only available to WXT holders with &gt; 10,000 WXT staked.
                        </p>
                    </div>

                    {/* Utility 3 */}
                    <div className="bg-gradient-to-br from-pink-900/40 to-black border border-pink-500/30 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Coins size={100} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-pink-400">Governance</h3>
                        <p className="text-gray-300 mb-4">
                            Vote on new strategy parameters, risk limits, and protocol upgrades. Your WXT represents your voice in the DAO.
                        </p>
                    </div>
                </div>

                {/* Token Distribution Chart (Simulated) */}
                <div className="bg-white/5 rounded-3xl p-12 border border-white/10">
                    <h2 className="text-3xl font-bold mb-8">Supply Allocation</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-right text-gray-400">Ecosystem</div>
                            <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[40%]"></div>
                            </div>
                            <div className="w-16 font-mono">40%</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-right text-gray-400">Team</div>
                            <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[20%]"></div>
                            </div>
                            <div className="w-16 font-mono">20%</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-right text-gray-400">Investors</div>
                            <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500 w-[15%]"></div>
                            </div>
                            <div className="w-16 font-mono">15%</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-right text-gray-400">Treasury</div>
                            <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[25%]"></div>
                            </div>
                            <div className="w-16 font-mono">25%</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
