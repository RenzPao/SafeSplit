'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Code2, 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  Lock, 
  Zap,
  Users
} from 'lucide-react';

type Persona = 'client' | 'freelancer' | 'arbiter';

export default function PersonaExperienceSection() {
  const [activePersona, setActivePersona] = useState<Persona>('client');

  const personaData = {
    client: {
      role: 'For Clients & Project Sponsors',
      title: 'Pay Only for Verified Work. Never Chase Non-Delivery.',
      badge: 'Client Assurance Protocol',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      points: [
        '100% Capital Protection: Funds are locked in smart escrow, not sent upfront to unverified individuals.',
        'Milestone-Gated Releases: Inspect GitHub PRs, Figma prototypes, and IPFS builds before approving release.',
        'Automatic Refund Rights: Cancel unstarted milestones or engage arbitration if contractor goes dark.',
      ],
      mockPreviewTitle: 'Client Verification Desk',
      mockHighlights: [
        { label: 'Custody Status', value: '10,000 XLM Locked in Soroban', color: 'text-cyan-300' },
        { label: 'Milestone Gate', value: 'Milestone 2: SOW Verified', color: 'text-emerald-300' },
        { label: 'Release Action', value: '1-Click Cryptographic Sign-off', color: 'text-purple-300' },
      ],
    },
    freelancer: {
      role: 'For Contractors, Agencies & Devs',
      title: 'Guaranteed Payouts. No Payment Delays or Chargebacks.',
      badge: 'Freelancer Guarantee Protocol',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      points: [
        'Verified Pre-Funding: Begin work only after verifying total project funds are locked on-chain.',
        'Immutable Work Timestamping: Submit cryptographic proof of work (GitHub PR commit / IPFS CID).',
        'Instant Settlement: Receive payouts directly to your Stellar wallet in ~3 seconds upon client approval.',
      ],
      mockPreviewTitle: 'Freelancer Proof-of-Work Desk',
      mockHighlights: [
        { label: 'Vault Verification', value: 'Escrow Fully Funded & Verified', color: 'text-emerald-300' },
        { label: 'Deliverable Proof', value: 'GitHub PR #42 & IPFS CID Stamped', color: 'text-cyan-300' },
        { label: 'Payout Horizon', value: 'Instant Stellar XLM Settlement', color: 'text-purple-300' },
      ],
    },
    arbiter: {
      role: 'For Neutral Mediators & DAOs',
      title: 'Decentralized Multi-Sig Dispute Settlement.',
      badge: 'Arbitration Governance',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      points: [
        'Neutral 3rd-Party Authority: Designated in contract initialization with cryptographic multi-sig rights.',
        'Granular Settlement Dials: Allocate dispute splits (e.g. 70% client / 30% freelancer) based on evidence.',
        'Zero Custody Risk: Arbiters never touch private keys or hold escrow funds—smart contract executes the ruling.',
      ],
      mockPreviewTitle: 'Arbiter Settlement Workbench',
      mockHighlights: [
        { label: 'Dispute Case', value: 'Milestone #3 Evidence Under Review', color: 'text-amber-300' },
        { label: 'Split Visualizer', value: 'Custom 50/50 Dual Allocation Dial', color: 'text-purple-300' },
        { label: 'Enforcement', value: 'Atomic Soroban Smart Execution', color: 'text-emerald-300' },
      ],
    },
  };

  const current = personaData[activePersona];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Role-Based Experience</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Engineered for Every Counterparty
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Select your role to explore how SafeSplit eliminates counterparty risk and creates frictionless agreement execution.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActivePersona('client')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activePersona === 'client'
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105'
              : 'bg-[#0d0f18] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>I am a Client</span>
        </button>

        <button
          onClick={() => setActivePersona('freelancer')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activePersona === 'freelancer'
              ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105'
              : 'bg-[#0d0f18] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>I am a Freelancer</span>
        </button>

        <button
          onClick={() => setActivePersona('arbiter')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activePersona === 'arbiter'
              ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
              : 'bg-[#0d0f18] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>I am an Arbiter</span>
        </button>
      </div>

      {/* Dynamic Persona Experience Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePersona}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center card-elevation p-8 rounded-3xl border border-white/[0.08] bg-[#0c0e18]/90 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        >
          {/* Left Column: Role Value Points (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${current.badgeColor}`}>
              {current.badge}
            </span>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs font-mono text-zinc-400">{current.role}</p>
            </div>

            <div className="space-y-3.5 pt-2">
              {current.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Desk Mockup Card (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#07080e] border border-white/[0.08] space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>{current.mockPreviewTitle}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">● Live Active State</span>
            </div>

            <div className="space-y-3">
              {current.mockHighlights.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0d0f17] border border-white/[0.04] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>Stellar Soroban Contract CDA4...YZEU</span>
              <span>Gas: 0.00001 XLM</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
