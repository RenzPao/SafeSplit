import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/contexts/ToastContext";
import WalletModal from "@/components/WalletModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeSplit | Trustless Milestone Escrow on Stellar Soroban",
  description: "SafeSplit provides institutional-grade, milestone-based decentralized escrow and arbitration on the Stellar Soroban smart contract network.",
  keywords: ["Escrow", "Stellar", "Soroban", "Smart Contracts", "Freelance", "Crypto", "Trustless", "Arbitration"],
  openGraph: {
    title: "SafeSplit | Trustless Milestone Escrow",
    description: "Secure, milestone-based decentralized escrow on Stellar Soroban.",
    url: "https://safesplit.vercel.app",
    siteName: "SafeSplit",
    images: [
      {
        url: "/main.png",
        width: 1200,
        height: 630,
        alt: "SafeSplit Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeSplit | Trustless Milestone Escrow",
    description: "Secure, milestone-based decentralized escrow on Stellar Soroban.",
    images: ["/main.png"],
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08090a] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
        <ToastProvider>
          <WalletProvider>
            {children}
            <WalletModal />
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
