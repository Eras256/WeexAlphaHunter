import Link from "next/link";
import { Handshake, Star } from "lucide-react";

export default function PartnersPage() {
    const partners = [
        {
            name: "WEEX",
            role: "Primary Exchange",
            desc: "The global trading platform providing deep liquidity and the WXT ecosystem.",
            badge: "Strategic"
        },
        {
            name: "Google Cloud",
            role: "Infrastructure",
            desc: "Powering our GEMINI models on Vertex AI for unparalleled inference speed.",
            badge: "Tech"
        },
        {
            name: "Base",
            role: "Blockchain",
            desc: "The secure foundation for our decentralized verification layer.",
            badge: "Network"
        }
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Partner Network</h1>
                    <p className="text-xl text-gray-400">
                        Building the future of algorithmic trading with industry leaders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {partners.map(p => (
                        <div key={p.name} className="bg-gray-900 border border-white/10 rounded-xl p-8 flex flex-col items-center text-center hover:border-white/30 transition shadow-lg shadow-black/50">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Star className="w-8 h-8 text-yellow-500" />
                            </div>
                            <span className="bg-white/10 text-xs px-2 py-1 rounded mb-4 text-gray-300">{p.badge}</span>
                            <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                            <p className="text-purple-400 text-sm font-semibold mb-4">{p.role}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <h3 className="text-2xl font-bold mb-6">Interested in partnering?</h3>
                    <Link href="/community/join" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition duration-200">
                        Contact Us
                    </Link>
                </div>

            </div>
        </div>
    );
}
