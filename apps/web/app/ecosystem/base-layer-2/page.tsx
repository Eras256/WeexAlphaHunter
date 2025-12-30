import Link from "next/link";
import { Copy, CheckCircle, ExternalLink, Network, Shield } from "lucide-react";

export default function BaseLayerPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                                <Network className="text-white w-6 h-6" />
                            </div>
                            <span className="text-blue-400 tracking-wider font-bold">HYBRID L1 + L2 ARCHITECTURE</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">Speed Meets Security</h1>
                        <p className="text-xl text-gray-400 leading-relaxed mb-8">
                            WAlphaHunter utilizes a dual-chain architecture. We execute trades with sub-second latency on <strong>Base (L2)</strong> for institutional speed, while anchoring final settlement and audit logs on <strong>Ethereum (L1)</strong> for immutable security.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://base.org" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                                Base L2
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                            <Link href="https://ethereum.org" className="px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
                                Ethereum L1
                                <Shield className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Visual/Stats */}
                    <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 rounded-3xl border border-blue-500/30 w-full animate-fade-in-up">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                                <div className="text-3xl font-bold text-blue-400 mb-1">Base</div>
                                <div className="text-xs text-gray-400 uppercase">Execution Layer</div>
                                <div className="mt-2 text-sm text-white">0.5s Latency</div>
                            </div>
                            <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                                <div className="text-3xl font-bold text-gray-200 mb-1">Eth L1</div>
                                <div className="text-xs text-gray-400 uppercase">Settlement Layer</div>
                                <div className="mt-2 text-sm text-white">Max Security</div>
                            </div>
                            <div className="bg-black/50 p-6 rounded-xl border border-white/10 col-span-2 flex justify-between items-center">
                                <div>
                                    <div className="text-3xl font-bold text-green-400 mb-1">100%</div>
                                    <div className="text-xs text-gray-400 uppercase">Verifiable Proofs</div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contract Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BASE SEPOLIA */}
                    <div className="bg-white/5 border border-blue-500/30 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-blue-400">Execution Verifier (Base L2)</h3>
                                <p className="text-gray-400 text-sm">High-frequency trade logging</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Network className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="flex items-center bg-black rounded-lg px-4 py-3 border border-white/10 font-mono text-xs text-gray-300">
                            <span className="break-all">{process.env.NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS || "Loading..."}</span>
                            <Link href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS}`} target="_blank" className="ml-4 hover:text-white transition">
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* ETHEREUM SEPOLIA */}
                    <div className="bg-white/5 border border-gray-500/30 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-200">Settlement Verifier (Eth L1)</h3>
                                <p className="text-gray-400 text-sm">Final audit & security anchor</p>
                            </div>
                            <div className="p-2 bg-gray-500/10 rounded-lg">
                                <Shield className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center bg-black rounded-lg px-4 py-3 border border-white/10 font-mono text-xs text-gray-300">
                            <span className="break-all">{process.env.NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS || "Loading..."}</span>
                            <Link href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS}`} target="_blank" className="ml-4 hover:text-white transition">
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
