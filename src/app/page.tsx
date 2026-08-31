'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ExternalLink
} from 'lucide-react';
import ThreeVaultCanvas, { VaultMode } from '@/components/landing/ThreeVaultCanvas';
import LiveProtocolPulse from '@/components/landing/LiveProtocolPulse';
import ScrollytellingSection from '@/components/landing/ScrollytellingSection';
import EscrowPlayground from '@/components/landing/EscrowPlayground';
import PersonaExperienceSection from '@/components/landing/PersonaExperienceSection';
import DeveloperWorkbench from '@/components/landing/DeveloperWorkbench';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [vaultMode, setVaultMode] = useState<VaultMode>('locked');

  return (
    <div className="min-h-screen flex flex-col bg-[#07080d] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200 relative w-full overflow-x-clip">
      {/* ── Isolated Ambient Background Layer (Eliminates Horizontal Mobile Wobble) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[650px] lg:w-[1100px] h-[550px] bg-gradient-to-b from-purple-600/25 via-indigo-600/15 to-transparent blur-[120px] sm:blur-[140px]" />
        <div className="absolute top-60 right-[-15%] sm:right-[-10%] w-[280px] sm:w-[450px] lg:w-[650px] h-[650px] bg-cyan-500/15 blur-[130px] sm:blur-[160px]" />
        <div className="absolute top-[800px] left-[-15%] sm:left-[-10%] w-[280px] sm:w-[450px] lg:w-[650px] h-[650px] bg-purple-600/15 blur-[130px] sm:blur-[160px]" />
        <div className="absolute inset-0 ambient-mesh opacity-60" />
      </div>

      {/* ── Top Navigation ────────────────────────────────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0b0d14]/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <img src="/logo.svg" alt="SafeSplit Logo" className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-105 transition-transform" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              SafeSplit
              <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">v2</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <Link href="/dashboard" className="hover:text-purple-300 transition-colors">Workspace</Link>
            <Link href="/history" className="hover:text-purple-300 transition-colors">History & Audit</Link>
            <Link href="/pitchdeck" className="hover:text-purple-300 transition-colors">Pitch Deck</Link>
            <a 
              href="https://github.com/RenzPao/SafeSplit" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(147,51,234,0.35)] min-h-[38px]"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 3D Interactive Hero Section ───────────────────────────── */}
      <section className="relative pt-8 sm:pt-16 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Hero Column: Value Prop & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            {/* Mainnet Protocol Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] sm:text-xs font-medium shadow-[0_0_20px_rgba(147,51,234,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-mono truncate">Stellar Soroban Protocol</span>
            </div>

            {/* Kinetic Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Trustless milestone escrow for{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
                high-value agreements.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Lock capital on-chain in Stellar Soroban. Disburse payouts atomically upon milestone approval. Settle disputes trustlessly with decentralized 3-party arbitration.
            </p>

            {/* Hero CTAs (Full width on Mobile) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_30px_rgba(147,51,234,0.4)] min-h-[44px]"
                >
                  <span>Open Escrow Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              <Link href="/pitchdeck" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#0f1118]/80 hover:bg-[#151824] border border-white/[0.12] hover:border-purple-500/40 text-zinc-200 font-semibold text-xs sm:text-sm transition-all shadow-lg backdrop-blur-sm min-h-[44px]"
                >
                  View Protocol Deck
                </motion.button>
              </Link>
            </div>

            {/* Mini Trust Highlights Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-white/[0.06] text-xs font-mono">
              <div>
                <div className="font-bold text-white text-sm sm:text-lg">0.00%</div>
                <div className="text-zinc-400 text-[10px] sm:text-[11px]">Platform Fees</div>
              </div>
              <div>
                <div className="font-bold text-emerald-400 text-sm sm:text-lg">~3.2s</div>
                <div className="text-zinc-400 text-[10px] sm:text-[11px]">Stellar Finality</div>
              </div>
              <div>
                <div className="font-bold text-cyan-400 text-sm sm:text-lg">100%</div>
                <div className="text-zinc-400 text-[10px] sm:text-[11px]">Autonomous Rust</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Interactive Three.js 3D Soroban Vault (5 cols) */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0e101a]/80 to-[#07080e]/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden w-full">
              <ThreeVaultCanvas onModeChange={(mode) => setVaultMode(mode)} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stellar Protocol Telemetry Ticker ────────────────── */}
      <LiveProtocolPulse />

      {/* ── Interactive Scrollytelling (Camera-Locked 4-Stage Protocol) ── */}
      <ScrollytellingSection />

      {/* ── Interactive Deal Playground & Fee Savings Calculator ──── */}
      <EscrowPlayground />

      {/* ── 3-Way Role-Based Experience (Client vs Dev vs Arbiter) ─── */}
      <PersonaExperienceSection />

      {/* ── Developer SDK Workbench & Searchable FAQ ──────────────── */}
      <DeveloperWorkbench />

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] py-8 sm:py-12 bg-[#06070b] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2 text-zinc-400 text-xs">
            <img src="/logo.svg" alt="SafeSplit" className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-white">SafeSplit Protocol © 2026</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="font-mono text-zinc-500 text-[11px] sm:text-xs">Autonomous Soroban Escrows</span>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium flex-wrap">
            <Link href="/dashboard" className="hover:text-purple-300 transition-colors">Workspace</Link>
            <Link href="/history" className="hover:text-purple-300 transition-colors">History</Link>
            <Link href="/pitchdeck" className="hover:text-purple-300 transition-colors">Pitch Deck</Link>
            <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-purple-300 transition-colors">Stellar Network</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
