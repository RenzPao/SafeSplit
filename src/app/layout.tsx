import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeSplit | Trustless Milestone Escrow",
  description: "SafeSplit provides a completely trustless, milestone-based decentralized escrow leveraging the Stellar Soroban smart contract platform.",
  keywords: ["Escrow", "Stellar", "Soroban", "Smart Contracts", "Freelance", "Crypto", "Trustless"],
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
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
