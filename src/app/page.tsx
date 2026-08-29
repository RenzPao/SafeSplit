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
    <div className="min-h-screen flex flex-col bg-[#08090a] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* ── Top Navigation ────────────────────────────────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0d0f14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="SafeSplit Logo" className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-base tracking-tight text-zinc-100">SafeSplit</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">Workspace</Link>
            <Link href="/history" className="hover:text-zinc-100 transition-colors">History & Audit</Link>
            <Link href="/pitchdeck" className="hover:text-zinc-100 transition-colors">Pitch Deck</Link>
            <a 
              href="https://github.com/RenzPao/SafeSplit" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-zinc-100 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>Soroban Smart Contract Escrow Protocol</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-100 max-w-4xl leading-[1.1]">
          Trustless milestone escrow for high-value agreements.
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Lock funds on-chain in Stellar Soroban. Disburse payments atomically upon milestone approval. Settle disputes with decentralized arbitration.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/20">
              <span>Open Escrow Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/pitchdeck">
            <button className="px-6 py-3 rounded-lg bg-[#12141a] hover:bg-[#181a22] border border-white/[0.08] text-zinc-200 font-semibold text-sm transition-all">
              View Protocol Deck
            </button>
          </Link>
        </div>

        {/* ── Interactive Live Protocol Simulator ──────────────────── */}
        <div className="mt-16 w-full max-w-4xl card-elevation rounded-2xl overflow-hidden text-left border border-white/[0.1] shadow-2xl">
          <div className="p-4 border-b border-white/[0.08] bg-[#0d0f14] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="text-xs font-mono text-zinc-400 ml-2">SafeSplit Live Contract Simulation</span>
            </div>
            <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
      <section className="py-20 border-t border-white/[0.08] bg-[#0d0f14]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              Institutional-grade escrow infrastructure
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Built natively for Stellar Soroban with atomic execution and zero intermediary fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="card-elevation p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Immutable Soroban Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Escrow funds are held inside verifiable Soroban smart contracts. Neither party can unilaterally withdraw funds without counterparty or arbiter approval.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card-elevation p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">0% Commission & Sub-5s Finality</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Legacy freelance platforms charge 10% to 20% in fees. SafeSplit takes 0% commission, and settlement executes in under 5 seconds on Stellar.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card-elevation p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Decentralized Arbitration</h3>
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
