import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import Google Font
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/providers/ThirdwebProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // Initialize font

export const metadata: Metadata = {
    title: "WAlphaHunter - WEEX Finalist",
    description: "Trading Proof-of-Work System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <Navbar />
                    <main className="min-h-screen pt-20"> {/* Add padding for fixed navbar */}
                        {children}
                    </main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
