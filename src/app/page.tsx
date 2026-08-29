'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MessagesSquare, 
  CheckCircle2, 
  Lock, 
  Server, 
  Layers,
  Activity,
  GitPullRequest,
  Scale,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function LandingPage() {
  // Interactive Simulator State
  const [simStep, setSimStep] = useState(1);

  return (
    <div className="min-h-screen flex flex-col bg-[#07080d] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200 relative overflow-hidden">
      {/* ── Rich Ambient Background Lighting & Nebula Glows ──────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-600/25 via-indigo-600/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-40 right-[-10%] w-[600px] h-[600px] bg-cyan-500/15 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] left-[-10%] w-[600px] h-[600px] bg-purple-600/15 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute inset-0 ambient-mesh opacity-60 pointer-events-none -z-10" />

      {/* ── Top Navigation ────────────────────────────────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0b0d14]/75 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <img src="/logo.svg" alt="SafeSplit Logo" className="w-7 h-7 group-hover:scale-105 transition-transform" />
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              SafeSplit
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">v2</span>
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

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(147,51,234,0.35)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]">
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Protocol Version Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-6 shadow-[0_0_20px_rgba(147,51,234,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-mono">Stellar Soroban Mainnet Architecture</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          Trustless milestone escrow for{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
            high-value agreements.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
          Lock funds on-chain in Stellar Soroban. Disburse payments atomically upon milestone approval. Settle disputes with decentralized arbitration.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:scale-[1.02]">
              <span>Open Escrow Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/pitchdeck">
            <button className="px-6 py-3.5 rounded-xl bg-[#0f1118]/80 hover:bg-[#151824] border border-white/[0.12] hover:border-purple-500/40 text-zinc-200 font-semibold text-sm transition-all shadow-lg backdrop-blur-sm">
              View Protocol Deck
            </button>
          </Link>
        </div>

        {/* ── Interactive Live Protocol Simulator ──────────────────── */}
        <div className="mt-16 w-full max-w-4xl card-elevation rounded-2xl overflow-hidden text-left border border-white/[0.12] shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[100px] pointer-events-none" />
          <div className="p-4 border-b border-white/[0.08] bg-[#0d0f17]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-xs font-mono text-zinc-300 ml-2 font-medium">SafeSplit Live Contract Simulation</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Soroban Testnet (CDA4...YZEU)</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#08090a]/90">
            {/* Agreement Summary (4 cols) */}
            <div className="md:col-span-4 space-y-4 border-r border-white/[0.06] pr-0 md:pr-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Agreement Name</span>
                <h3 className="text-sm font-bold text-zinc-100 mt-0.5">SaaS Platform Milestone Contract</h3>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Locked Total</span>
                <div className="text-xl font-bold font-mono text-zinc-100 mt-0.5 tabular-nums">
                  10,000.00 <span className="text-xs font-sans text-purple-400">XLM</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Client Deposit:</span>
                  <span className="font-mono text-zinc-200">GDQW...3R4X</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Freelancer Payee:</span>
                  <span className="font-mono text-zinc-200">GAK8...9P1Z</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Platform Fee:</span>
                  <span className="font-mono text-emerald-400 font-semibold">0.00% (Zero)</span>
                </div>
              </div>
            </div>

            {/* Interactive Milestone Stages (8 cols) */}
            <div className="md:col-span-8 space-y-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Interactive Milestone Workflow (Click Stages)
              </span>

              <div className="space-y-3">
                {[
                  { id: 1, title: '1. Architecture & Security Specs', amount: '3,000 XLM', status: 'Approved' },
                  { id: 2, title: '2. Core MVP & API Endpoints', amount: '4,000 XLM', status: simStep >= 2 ? (simStep === 2 ? 'In Review' : 'Approved') : 'Pending Deposit' },
                  { id: 3, title: '3. QA, Auditing & Deployment', amount: '3,000 XLM', status: simStep >= 3 ? 'In Review' : 'Pending Deposit' },
                ].map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSimStep(st.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      simStep === st.id
                        ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                        : 'bg-[#0d0f14] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        simStep === st.id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {st.id}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">{st.title}</div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{st.amount}</div>
                      </div>
                    </div>

                    <Badge status={st.status} size="sm" />
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-[#0d0f14] border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-zinc-400">Step {simStep} Action:</span>
                <span className="text-purple-300 font-semibold">
                  {simStep === 1 && 'Funds atomically disbursed to freelancer on approval.'}
                  {simStep === 2 && 'Deliverables under client review. Approve or dispute.'}
                  {simStep === 3 && 'Final milestone pending completion and sign-off.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Protocol Architecture Features ────────────────────────── */}
      <section className="py-20 border-t border-white/[0.08] bg-[#0b0d14]/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-purple-600/10 blur-[150px] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Institutional-grade escrow infrastructure
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Built natively for Stellar Soroban with atomic execution and zero intermediary fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="card-elevation p-7 rounded-2xl space-y-4 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Immutable Soroban Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Escrow funds are held inside verifiable Soroban smart contracts. Neither party can unilaterally withdraw funds without counterparty or arbiter approval.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card-elevation p-7 rounded-2xl space-y-4 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">0% Commission & Sub-5s Finality</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Legacy freelance platforms charge 10% to 20% in fees. SafeSplit takes 0% commission, and settlement executes in under 5 seconds on Stellar.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card-elevation p-7 rounded-2xl space-y-4 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Decentralized Arbitration</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                In the event of a dispute, neutral arbiters review on-chain proof of work and execute custom proportional split payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] py-10 bg-[#08090a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <img src="/logo.svg" alt="SafeSplit" className="w-5 h-5" />
            <span>SafeSplit Protocol © 2026 • Powered by Stellar Soroban</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link>
            <Link href="/history" className="hover:text-zinc-200">History</Link>
            <Link href="/pitchdeck" className="hover:text-zinc-200">Pitch Deck</Link>
            <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-zinc-200">Stellar Network</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
