'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, 
  Lock, 
  GitPullRequest, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Clock,
  ArrowDown
} from 'lucide-react';

interface Chapter {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    badge: 'Stage 01 // Inception',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: 'Agreement Inception & SHA-256 SOW Fingerprinting',
    subtitle: 'Mathematical Immutability from Day One',
    description:
      'Parties define project milestones, budgets, and deliverable criteria. SafeSplit computes a deterministic SHA-256 hash of the complete Scope of Work (SOW), producing an unforgeable on-chain digest.',
    points: [
      'Deterministic hashing binds deliverables to contract initialization.',
      'Prevents post-agreement scope creep or disputed requirements.',
      'Zero sensitive IP stored publicly on-chain—only the verifiable 32-byte hash.',
    ],
  },
  {
    id: 2,
    badge: 'Stage 02 // Autonomous Custody',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    title: 'Autonomous Soroban Multi-Sig Vault Lock',
    subtitle: 'True Trustless Capital Isolation',
    description:
      'The client deposits the total agreed XLM balance into the Soroban smart vault. The contract isolates the capital mathematically: neither client nor freelancer can unilaterally seize or tamper with funds.',
    points: [
      'Funds are locked in autonomous Rust smart contract bytecode.',
      'Client cannot retract funds once work is underway without valid dispute.',
      'Freelancer has 100% cryptographic certainty that funds are available.',
    ],
  },
  {
    id: 3,
    badge: 'Stage 03 // Proof of Work',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: 'Cryptographic Proof Submission & Timestamping',
    subtitle: 'Verifiable On-Chain Artifact Stamping',
    description:
      'Upon milestone completion, the freelancer submits the work artifact (GitHub PR commit hash or IPFS CID) directly to the smart contract. The milestone transitions to "Submitted" state.',
    points: [
      'Immutable timestamp proves exact deliverable completion time.',
      'Supports decentralized IPFS CIDs, GitHub commits, and Figma URLs.',
      'Opens the formal client inspection window with automated audit logs.',
    ],
  },
  {
    id: 4,
    badge: 'Stage 04 // Atomic Settlement',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    title: 'Atomic On-Chain Release & Sub-5s Payout',
    subtitle: 'Zero Middleman Friction, Instant Finality',
    description:
      'The client reviews the submitted proof and approves it with a single cryptographic signature. The Soroban smart contract atomically transfers that milestone’s XLM directly to the freelancer.',
    points: [
      'Sub-5-second finality powered by the Stellar network (~3.2s average).',
      '0.00% platform commission deductions—freelancers keep 100% of earnings.',
      'Full cryptographic receipt and audit log archived immutably.',
    ],
  },
];

export default function ScrollytellingSection() {
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Intersection Observer for Scroll Tracking ───────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    chapterRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveChapter(index + 1);
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: '-10% 0px -10% 0px',
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToChapter = (index: number) => {
    setActiveChapter(index);
    const targetEl = chapterRefs.current[index - 1];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.15)]">
          <ShieldCheck className="w-4 h-4" />
          <span>Interactive Protocol Scrollytelling</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          How SafeSplit Secures Your Agreement
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Scroll down to see how an agreement progresses through the Soroban state machine from SOW hashing to instant atomic payout.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 animate-bounce">
          <ArrowDown className="w-3.5 h-3.5 text-purple-400" />
          <span>Scroll down to advance the on-chain pipeline</span>
        </div>
      </div>

      {/* ── Scrollytelling Split Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Scrolling Narrative Chapters (5 cols) ──────── */}
        <div className="lg:col-span-5 space-y-24 py-8">
          {CHAPTERS.map((ch, idx) => {
            const isActive = activeChapter === ch.id;
            return (
              <div
                key={ch.id}
                ref={(el) => { chapterRefs.current[idx] = el; }}
                className={`p-7 rounded-3xl border transition-all duration-300 space-y-4 ${
                  isActive
                    ? 'bg-[#0f121e]/90 border-purple-500/60 shadow-[0_0_40px_rgba(147,51,234,0.25)] scale-[1.02]'
                    : 'bg-[#07080e]/60 border-white/[0.04] opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${ch.badgeColor}`}>
                    {ch.badge}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">0{ch.id} / 04</span>
                </div>

                <div className="space-y-1">
                  <h3 className={`text-xl font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {ch.title}
                  </h3>
                  <p className="text-xs font-mono text-purple-300 font-medium">{ch.subtitle}</p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                  {ch.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {ch.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {isActive && (
                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Stage Active in Soroban VM
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Pinned Smart Contract Visualizer (7 cols) ── */}
        <div className="lg:col-span-7 sticky top-24 z-20">
          <div className="card-elevation rounded-3xl border border-purple-500/30 bg-[#08090f]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden h-[560px] flex flex-col justify-between">
            {/* Top Visualizer Header */}
            <div className="p-4 bg-[#0d0f18] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-xs font-mono text-zinc-300 ml-2 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Soroban State Machine Visualizer</span>
                </span>
              </div>

              {/* Step Navigation Scrubbers */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => scrollToChapter(step)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      activeChapter === step
                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.5)] scale-105'
                        : 'bg-white/[0.04] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    0{step}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Stage Canvas Body */}
            <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                {/* ── STAGE 1: INCEPTION & SHA-256 HASH GENERATION ── */}
                {activeChapter === 1 && (
                  <motion.div
                    key="stage-1"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-[#0e111a] border border-purple-500/30 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Fingerprint className="w-4 h-4 text-purple-400" />
                          SOW Cryptographic Digest
                        </span>
                        <span className="text-[10px] text-emerald-400">SHA-256 Verified</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#06070b] border border-white/[0.06] text-xs font-mono space-y-2">
                        <div className="text-zinc-400 text-[11px]">Raw SOW Input:</div>
                        <div className="text-white text-xs bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                          &quot;Milestone 1: Smart Contract Audit : 5,000 XLM&quot;
                        </div>
                        
                        <div className="pt-2 flex items-center justify-center text-purple-400">
                          <ArrowDown className="w-4 h-4 animate-bounce" />
                        </div>

                        <div className="text-zinc-400 text-[11px]">On-Chain Hash Fingerprint:</div>
                        <div className="text-purple-300 font-mono text-[10px] break-all bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                          7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0c14] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>Contract Instance:</span>
                      <span className="text-white font-semibold">CDA4...YZEU (Testnet)</span>
                    </div>
                  </motion.div>
                )}

                {/* ── STAGE 2: MULTI-SIG VAULT LOCK ── */}
                {activeChapter === 2 && (
                  <motion.div
                    key="stage-2"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md space-y-5"
                  >
                    {/* Visual Token Stream */}
                    <div className="p-5 rounded-2xl bg-[#0e111a] border border-cyan-500/30 space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Soroban Smart Vault Lock
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 animate-pulse">
                          Custody Isolated
                        </span>
                      </div>

                      {/* Animated Balance Lock Meter */}
                      <div className="p-4 rounded-xl bg-[#06070b] border border-white/[0.06] space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-zinc-400">Escrow Vault Balance:</span>
                          <span className="text-2xl font-bold font-mono text-white">
                            10,000.00 <span className="text-xs font-sans text-cyan-400">XLM</span>
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                          />
                        </div>

                        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                          <span>Depositor: GDQW...3R4X</span>
                          <span>Payee: GAK8...9P1Z</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0c14] border border-white/[0.06] text-xs font-mono text-zinc-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Multi-Sig Verification
                      </span>
                      <span className="text-white font-bold">2-of-2 Signature Required</span>
                    </div>
                  </motion.div>
                )}

                {/* ── STAGE 3: PROOF OF WORK SUBMISSION ── */}
                {activeChapter === 3 && (
                  <motion.div
                    key="stage-3"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md space-y-4"
                  >
                    <div className="p-5 rounded-2xl bg-[#0e111a] border border-amber-500/30 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitPullRequest className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Cryptographic Deliverable Proof
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          In Review
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#06070b] border border-white/[0.06] space-y-2.5 font-mono text-xs">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-400">GitHub PR Commit:</span>
                          <span className="text-purple-300 font-semibold">PR #42 (commit 9f41b2a)</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-400">IPFS Deliverable CID:</span>
                          <span className="text-cyan-300 font-semibold truncate max-w-[180px]">QmZtmD2qtW3wTq9Y...</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-400">Timestamp Stamped:</span>
                          <span className="text-white">Just now (Ledger #1,248,390)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0c14] border border-white/[0.06] text-xs font-mono text-zinc-400 flex items-center justify-between">
                      <span>Inspection Window:</span>
                      <span className="text-amber-400 font-bold">Awaiting Client Sign-off</span>
                    </div>
                  </motion.div>
                )}

                {/* ── STAGE 4: ATOMIC INSTANT SETTLEMENT ── */}
                {activeChapter === 4 && (
                  <motion.div
                    key="stage-4"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md space-y-4"
                  >
                    <div className="p-5 rounded-2xl bg-[#0e111a] border border-emerald-500/40 space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Atomic On-Chain Settlement
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Disbursed
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#06070b] border border-white/[0.06] text-center space-y-2">
                        <div className="text-[11px] font-mono text-zinc-400">Tranche Payout Executed:</div>
                        <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums shadow-sm">
                          +5,000.00 <span className="text-xs text-white">XLM</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          Recipient: GAK8...9P1Z (Freelancer)
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0a0c14] border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Stellar Finality Time:</span>
                      <span className="text-emerald-300 font-bold font-sans">⚡ 3.2 Seconds (Gas: ~0.00001 XLM)</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Visualizer State Bar */}
            <div className="p-4 bg-[#090b12] border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Chapter 0{activeChapter} of 04</span>
              </span>

              <button
                onClick={() => scrollToChapter((activeChapter % 4) + 1)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-purple-600 text-zinc-200 hover:text-white transition-all text-xs font-semibold group"
              >
                <span>Next Chapter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
