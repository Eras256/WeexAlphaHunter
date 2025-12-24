import { Newspaper } from "lucide-react";

export default function UpdatesPage() {
    const updates = [
        { date: "Dec 19, 2024", title: "GEMINI Integration Complete", category: "Engineering" },
        { date: "Dec 15, 2024", title: "WXT Tokenomics Whitepaper Released", category: "Governance" },
        { date: "Dec 10, 2024", title: "Verification Layer Live on Base Sepolia", category: "Release" },
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <h1 className="text-4xl font-bold mb-12 flex items-center gap-3">
                    <Newspaper className="text-purple-400" /> Latest Updates
                </h1>

                <div className="space-y-8">
                    {updates.map((u, i) => (
                        <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-8 hover:border-white/30 transition cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-purple-400 text-sm font-bold uppercase tracking-wider">{u.category}</span>
                                <span className="text-gray-500 text-sm">{u.date}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{u.title}</h3>
                            <p className="text-gray-400">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
