import React from "react";
import Link from "next/link";
import { Github, Twitter, MessageCircle, Mail, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                WAH
                            </span>
                            <span className="text-white font-medium tracking-wide">WAlphaHunter</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            The first Trading Proof-of-Work system. Powered by GEMINI, optimized with WXT, and verifiable on Base.
                            Redefining algorithmic trading transparency.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-twitter hover:text-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-500" /> Platform
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                                    Trading Engine
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                                    Proof Verification
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                                    WXT Token
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                                    Leaderboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> Developers
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                                    GitHub Specs
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                                    API Status
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                                    Bounty Program
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-pink-500" /> Stay Updated
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Get the latest updates on strategies, governance, and hackathon news.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 flex-1 transition-colors hover:bg-white/10"
                            />
                            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} WAlphaHunter. Built for WEEX Alpha Awakens.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
