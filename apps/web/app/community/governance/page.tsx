import { Vote, FileText, CheckCircle2 } from "lucide-react";

export default function GovernancePage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">DAO Governance</h1>
                    <p className="text-xl text-gray-400">The protocol is owned and steered by WXT holders.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Proposal */}
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">Active</span>
                            <span className="text-gray-500 text-sm">Proposal #14</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-4">Increase Max Leverage for Momentum Strategy</h3>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            This proposal seeks to increase the maximum allowed leverage for the ETH/USDT Momentum Alpha bot from 5x to 10x, based on recent backtest data showing improved Sharpe ratio with managed risk.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>For</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[84%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Against</span>
                                    <span>16%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[16%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">Vote "For"</button>
                            <button className="flex-1 border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition">Vote "Against"</button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <Vote className="w-5 h-5 text-purple-400" /> Voting Power
                            </h4>
                            <div className="text-3xl font-bold mb-1">0 WXT</div>
                            <p className="text-sm text-gray-500 mb-4">You need to connect your wallet to vote.</p>
                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded transition">Connect Wallet</button>
                        </div>

                        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" /> Recent Passed
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-gray-400">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                    <span>Add ARB/USDT market support</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-400">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                    <span>Reduce platform fees by 0.01%</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
