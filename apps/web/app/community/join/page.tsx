import { Users, Mail, ArrowRight, Rss } from "lucide-react";

export default function JoinCommunityPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">Join the Hunt</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We are building the largest decentralized community of algorithmic traders. Connect with us to shape the future of WAlphaHunter.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-10 text-center">
                        <Mail className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Official Newsletter</h3>
                        <p className="text-gray-400 mb-8">
                            Get weekly alpha reports, strategy updates, and governance news delivered directly to your inbox.
                        </p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="you@example.com" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex-1 text-white focus:outline-none focus:border-indigo-500" />
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition">Subscribe</button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-10 text-center flex flex-col justify-between">
                        <div>
                            <Users className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Be a Contributor</h3>
                            <p className="text-gray-400 mb-8">
                                Are you a quant, developer, or designer? Help us build the ultimate trading engine and earn WXT.
                            </p>
                        </div>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2">
                            View Open Roles <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
