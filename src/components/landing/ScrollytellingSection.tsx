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
  ArrowDown
} from 'lucide-react';

interface StageData {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
}

const STAGES: StageData[] = [
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [scrollProgressPct, setScrollProgressPct] = useState<number>(0);

  // ── Scroll Listener Tracking Camera Lock ─────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollDistance = rect.height - windowHeight;

      if (totalScrollDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollDistance));

      setScrollProgressPct(Math.round(progress * 100));

      if (progress < 0.25) {
        setActiveStep(1);
      } else if (progress < 0.5) {
        setActiveStep(2);
      } else if (progress < 0.75) {
        setActiveStep(3);
      } else {
        setActiveStep(4);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const current = STAGES.find((s) => s.id === activeStep) || STAGES[0];

  const handleJumpToStep = (step: number) => {
    const el = containerRef.current;
    if (!el) return;

    const totalScrollDistance = el.offsetHeight - window.innerHeight;
    const targetOffset = ((step - 1) / 3.0) * totalScrollDistance;
    const elTop = window.scrollY + el.getBoundingClientRect().top;

    window.scrollTo({
      top: elTop + targetOffset,
      behavior: 'smooth',
    });
  };

  return (
    <div ref={containerRef} className="relative h-[280vh] w-full">
      {/* ── Sticky Viewport Container (Locks Camera on Screen for 280vh) ── */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 z-20 overflow-hidden">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          {/* Top Section Header & Sticky Progress */}
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Interactive Protocol Scrollytelling</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              How SafeSplit Secures Your Agreement
            </h2>

            {/* Scroll Lock Progress Bar & Ticker */}
            <div className="max-w-lg mx-auto pt-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold">
                  Stage 0{activeStep} / 04: {current.subtitle}
                </span>
                <span className="text-zinc-400 font-semibold">
                  {scrollProgressPct >= 99 ? '✓ Scrollytelling Complete (100%)' : `Camera Locked (${scrollProgressPct}%)`}
                </span>
              </div>

              {/* Segmented Progress Bar */}
              <div className="flex items-center gap-2 h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleJumpToStep(s)}
                    className={`h-full flex-1 rounded-full transition-all cursor-pointer ${
                      activeStep >= s
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                        : 'bg-zinc-700/40 hover:bg-zinc-600'
                    }`}
                    title={`Jump to Stage 0${s}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── 2-Column Split Console (Single Narrative Card + Visualizer) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: The 1 Dynamic Narrative Card (5 cols) ──────── */}
            <div className="lg:col-span-5 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="p-6 sm:p-7 rounded-3xl border border-purple-500/40 bg-[#0e111d]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(147,51,234,0.2)] space-y-4 min-h-[380px] flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${current.badgeColor}`}>
                        {current.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-500">Step 0{current.id} / 04</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                        {current.title}
                      </h3>
                      <p className="text-xs font-mono text-purple-300 font-semibold">{current.subtitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                      {current.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      {current.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-white/[0.04]">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live in Soroban VM
                    </span>

                    <button
                      onClick={() => handleJumpToStep((activeStep % 4) + 1)}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Dynamic State Visualizer (7 cols) ───────── */}
            <div className="lg:col-span-7">
              <div className="card-elevation rounded-3xl border border-white/[0.1] bg-[#07090e]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden h-[380px] sm:h-[400px] flex flex-col justify-between">
                {/* Visualizer Header */}
                <div className="p-3 bg-[#0d0f17] border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-zinc-300 ml-2 font-semibold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>stellar-soroban-state-machine</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Protocol v20
                  </span>
                </div>

                {/* Dynamic Stage Body */}
                <div className="flex-1 p-5 flex items-center justify-center relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {/* STAGE 1: INCEPTION & SHA-256 */}
                    {activeStep === 1 && (
                      <motion.div
                        key="stage-1"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-md space-y-3"
                      >
                        <div className="p-3.5 rounded-2xl bg-[#0e111a] border border-purple-500/30 space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Fingerprint className="w-4 h-4 text-purple-400" />
                              SOW Cryptographic Digest
                            </span>
                            <span className="text-[10px] text-emerald-400">SHA-256 Verified</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#06070b] border border-white/[0.06] text-xs font-mono space-y-1.5">
                            <div className="text-zinc-400 text-[10px]">Raw SOW Input:</div>
                            <div className="text-white text-xs bg-white/[0.02] p-1.5 rounded border border-white/[0.04]">
                              &quot;Milestone 1: Smart Contract Audit : 5,000 XLM&quot;
                            </div>

                            <div className="pt-0.5 flex items-center justify-center text-purple-400">
                              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                            </div>

                            <div className="text-zinc-400 text-[10px]">On-Chain Hash Fingerprint:</div>
                            <div className="text-purple-300 font-mono text-[10px] break-all bg-purple-950/30 p-2 rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                              7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0a0c14] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
                          <span>Contract Instance:</span>
                          <span className="text-white font-semibold">CDA4...YZEU (Testnet)</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STAGE 2: MULTI-SIG VAULT LOCK */}
                    {activeStep === 2 && (
                      <motion.div
                        key="stage-2"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-md space-y-3"
                      >
                        <div className="p-4 rounded-2xl bg-[#0e111a] border border-cyan-500/30 space-y-3 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
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

                          <div className="p-3 rounded-xl bg-[#06070b] border border-white/[0.06] space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs text-zinc-400">Escrow Vault Balance:</span>
                              <span className="text-xl font-bold font-mono text-white">
                                10,000.00 <span className="text-xs font-sans text-cyan-400">XLM</span>
                              </span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
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

                        <div className="p-2.5 rounded-xl bg-[#0a0c14] border border-white/[0.06] text-xs font-mono text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Multi-Sig Verification
                          </span>
                          <span className="text-white font-bold">2-of-2 Signature Required</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STAGE 3: PROOF OF WORK */}
                    {activeStep === 3 && (
                      <motion.div
                        key="stage-3"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-md space-y-3"
                      >
                        <div className="p-4 rounded-2xl bg-[#0e111a] border border-amber-500/30 space-y-3 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
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

                          <div className="p-3 rounded-xl bg-[#06070b] border border-white/[0.06] space-y-2 font-mono text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">GitHub PR Commit:</span>
                              <span className="text-purple-300 font-semibold">PR #42 (commit 9f41b2a)</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">IPFS Deliverable CID:</span>
                              <span className="text-cyan-300 font-semibold truncate max-w-[160px]">QmZtmD2qtW3wTq9Y...</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">Timestamp Stamped:</span>
                              <span className="text-white">Just now (Ledger #1,248,390)</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0a0c14] border border-white/[0.06] text-xs font-mono text-zinc-400 flex items-center justify-between">
                          <span>Inspection Window:</span>
                          <span className="text-amber-400 font-bold">Awaiting Client Sign-off</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STAGE 4: ATOMIC SETTLEMENT */}
                    {activeStep === 4 && (
                      <motion.div
                        key="stage-4"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-md space-y-3"
                      >
                        <div className="p-4 rounded-2xl bg-[#0e111a] border border-emerald-500/40 space-y-3 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
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

                          <div className="p-3 rounded-xl bg-[#06070b] border border-white/[0.06] text-center space-y-1.5">
                            <div className="text-[10px] font-mono text-zinc-400">Tranche Payout Executed:</div>
                            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tabular-nums shadow-sm">
                              +5,000.00 <span className="text-xs text-white">XLM</span>
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500">
                              Recipient: GAK8...9P1Z (Freelancer)
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0a0c14] border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-400">Stellar Finality Time:</span>
                          <span className="text-emerald-300 font-bold font-sans">⚡ 3.2 Seconds</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom State Bar */}
                <div className="p-2.5 bg-[#090b12] border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span>State: Active in Soroban VM</span>
                  </span>

                  <span className="text-zinc-500 text-[11px]">
                    {scrollProgressPct >= 99 ? 'Scroll down to continue ↓' : 'Keep scrolling to advance stages'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
