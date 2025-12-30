"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Shield, Cpu, Users, BookOpen } from "lucide-react";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import { base, baseSepolia, ethereum, sepolia } from "@/lib/chains";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const menuItems = [
        {
            title: "Platform",
            icon: <Cpu className="w-4 h-4 mr-2" />,
            items: [
                { name: "Dashboard", href: "/dashboard" },
                { name: "UNUM AI Engine", href: "/platform/ai-engine", badge: "6 Models" },
                { name: "AI Tools & Analytics", href: "/ai-tools" },
                { name: "Trading Strategies", href: "/platform/strategies" },
                { name: "WXT Tokenomics", href: "/platform/tokenomics" },
            ],
        },
        {
            title: "Ecosystem",
            icon: <Shield className="w-4 h-4 mr-2" />,
            items: [
                { name: "Architecture (L1/L2)", href: "/ecosystem/base-layer-2" },
                { name: "WEEX Integration", href: "/ecosystem/partners", badge: "Live" },
                { name: "Compliance & Proofs", href: "/ecosystem/compliance" },
                { name: "X (Twitter) Social", href: "/ecosystem/social", badge: "New" },
            ],
        },
        {
            title: "Resources",
            icon: <BookOpen className="w-4 h-4 mr-2" />,
            items: [
                { name: "Documentation", href: "/resources/docs" },
                { name: "API Reference", href: "/resources/api" },
                { name: "Hackathon Proofs", href: "/resources/hackathon-proofs" },
                { name: "Live Performance", href: "/resources/performance", badge: "Real-time" },
            ],
        },
        {
            title: "Community",
            icon: <Users className="w-4 h-4 mr-2" />,
            items: [
                { name: "Join Community", href: "/community/join" },
                { name: "Latest Updates", href: "/community/updates" },
                { name: "Governance", href: "/community/governance" },
            ],
        },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                WAH
                            </span>
                            <span className="text-white font-medium tracking-wide">WAlphaHunter</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {menuItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="relative group block h-20 flex items-center"
                                    onMouseEnter={() => setActiveDropdown(item.title)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        {item.title}
                                        <ChevronDown className="ml-1 w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                                    </button>

                                    {/* Dropdown */}
                                    <div
                                        className={`absolute top-full left-0 w-56 rounded-md shadow-lg bg-black border border-white/10 ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ${activeDropdown === item.title
                                            ? "opacity-100 translate-y-0 visible"
                                            : "opacity-0 translate-y-2 invisible"
                                            }`}
                                    >
                                        <div className="py-2 px-2">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1 border-b border-white/5 flex items-center">
                                                {item.icon}
                                                {item.title}
                                            </div>
                                            {item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className="block px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors flex items-center justify-between group"
                                                >
                                                    <span>{subItem.name}</span>
                                                    {subItem.badge && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                                                            {subItem.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button / Connect Wallet */}
                    <div className="hidden md:block">
                        {client && (
                            <ConnectButton
                                client={client}
                                chains={[baseSepolia, base, sepolia, ethereum]}
                                theme={"dark"}
                                connectModal={{
                                    size: "compact",
                                    title: "Join WAlphaHunter",
                                    showThirdwebBranding: false,
                                }}
                                connectButton={{
                                    label: "Connect Wallet",
                                }}
                                detailsButton={{
                                    style: { minWidth: "140px" }
                                }}
                                accountAbstraction={{
                                    chain: baseSepolia,
                                    sponsorGas: false
                                }}
                            />
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {menuItems.map((item) => (
                            <div key={item.title} className="space-y-1">
                                <div className="px-3 py-2 text-base font-medium text-white bg-white/5 mx-2 rounded-md flex items-center">
                                    {item.icon}
                                    {item.title}
                                </div>
                                {item.items.map((subItem) => (
                                    <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className="block px-3 py-2 ml-4 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/10"
                                    >
                                        {subItem.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                        <div className="pt-4 pb-2 flex justify-center">
                            {client && (
                                <ConnectButton
                                    client={client}
                                    chains={[base, baseSepolia, ethereum, sepolia]}
                                    theme={"dark"}
                                    connectButton={{
                                        label: "Connect Wallet",
                                        style: { width: "100%" }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
