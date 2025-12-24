import { Trophy, FileCheck } from "lucide-react";

export default function HackathonPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="bg-gradient-to-r from-purple-900 to-black rounded-3xl p-12 mb-16 border border-purple-500/30 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                            <Trophy className="text-yellow-400 w-5 h-5" />
                            <span className="text-sm font-bold tracking-wider uppercase">WEEX Alpha Awakens Submission</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Hackathon Artifacts</h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            This page serves as the official repository of evidence for the WEEX Alpha Awakens Hackathon judges.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-purple-500/50 transition">
                        <FileCheck className="w-10 h-10 text-purple-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Backtest Results</h3>
                        <p className="text-gray-400 mb-6">
                            Comprehensive PDF report showing 5-year performance across 10 cryptocurrency pairs.
                        </p>
                        <button className="text-purple-400 font-bold hover:text-white transition">Download PDF &rarr;</button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-purple-500/50 transition">
                        <FileCheck className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Architecture Diagram</h3>
                        <p className="text-gray-400 mb-6">
                            High-level system design showing the interaction between the Next.js frontend, Node.js engine, and Base blockchain.
                        </p>
                        <button className="text-blue-400 font-bold hover:text-white transition">View Diagram &rarr;</button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-purple-500/50 transition">
                        <FileCheck className="w-10 h-10 text-green-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Video Walkthrough</h3>
                        <p className="text-gray-400 mb-6">
                            5-minute demo video showcasing the live trading dashboard and compliance verification process.
                        </p>
                        <button className="text-green-400 font-bold hover:text-white transition">Watch Video &rarr;</button>
                    </div>

                </div>

            </div>
        </div>
    );
}
