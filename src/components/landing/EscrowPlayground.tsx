'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Lock
} from 'lucide-react';

export default function EscrowPlayground() {
  const [budgetXlm, setBudgetXlm] = useState<number>(10000);
  const [milestoneCount, setMilestoneCount] = useState<number>(3);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simComplete, setSimComplete] = useState<boolean>(false);

  // FX Rate: 1 XLM ≈ $0.11 USD
  const XLM_PRICE_USD = 0.112;
  const budgetUsd = budgetXlm * XLM_PRICE_USD;

  // Fee Comparisons
  const safeSplitFee = 0.00; // 0% platform fee
  const stellarGasUsd = 0.000001; // ~0.00001 XLM
  const upworkFeeUsd = budgetUsd * 0.15; // 10% - 20% average ~15%
  const traditionalEscrowFeeUsd = budgetUsd * 0.04; // ~4% escrow fee
  const totalSavedUsd = upworkFeeUsd - safeSplitFee;

  const perMilestoneXlm = Math.round(budgetXlm / milestoneCount);
  const perMilestoneUsd = perMilestoneXlm * XLM_PRICE_USD;

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimComplete(false);

    // Step through simulation
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          setSimComplete(true);
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          <span>Interactive Cost & Settlement Playground</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Calculate Your Fee Savings & Test Run a Deal
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          See exactly how much capital you keep by eliminating centralized middleman commissions and executing trustlessly on Stellar.
        </p>
      </div>

      {/* Main Playground Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Deal Parameter Builder (5 cols) */}
        <div className="lg:col-span-5 card-elevation p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e17]/90 space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Agreement Parameters</span>
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">Live Configurator</span>
          </div>

          {/* Deal Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-zinc-300">Contract Total Budget</label>
              <div className="font-mono text-white font-bold bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                {budgetXlm.toLocaleString()} XLM <span className="text-zinc-500 text-[10px]">(${budgetUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
              </div>
            </div>

            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={budgetXlm}
              onChange={(e) => setBudgetXlm(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>1,000 XLM ($112)</span>
              <span>50,000 XLM ($5,600)</span>
              <span>100,000 XLM ($11,200)</span>
            </div>
          </div>

          {/* Milestone Breakdown Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-zinc-300">Milestone Tranches</label>
              <span className="font-mono text-purple-300 font-bold">{milestoneCount} Milestones</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setMilestoneCount(count)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    milestoneCount === count
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {count} {count === 1 ? 'Stage' : 'Stages'}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Milestone Breakdown Preview */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] font-semibold text-zinc-400">Milestone Tranche Value</span>
            <div className="p-3 rounded-xl bg-[#07080d] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300">Each Milestone:</span>
              <span className="text-emerald-400 font-bold">
                {perMilestoneXlm.toLocaleString()} XLM <span className="text-zinc-500 font-sans font-normal text-[10px]">(≈ ${perMilestoneUsd.toFixed(2)})</span>
              </span>
            </div>
          </div>

          {/* Interactive Simulation Trigger */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(147,51,234,0.35)] disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Zap className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>Simulating On-Chain Settlement ({simProgress}%)...</span>
              </>
            ) : simComplete ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Simulation Complete! Re-Run Simulation</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Simulate 1-Click Escrow Settlement</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Fee Comparison & Live Savings Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Highlight Savings Card */}
          <div className="card-elevation p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#0c0e17] to-purple-950/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                <span>Direct Middleman Fee Savings</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Retained
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                  +${totalSavedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-zinc-400 mt-1">Total capital saved vs centralized freelance platforms</p>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SafeSplit Protocol */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-2 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                <span>SafeSplit</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">$0.00</div>
              <div className="text-[10px] text-zinc-400">0% Platform Fee</div>
              <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-white/[0.06]">
                Stellar Gas: ~$0.000001
              </div>
            </div>

            {/* Centralized Escrow */}
            <div className="p-4 rounded-xl bg-[#0c0e17] border border-white/[0.06] space-y-2 opacity-80">
              <div className="text-xs font-semibold text-zinc-300">Centralized Escrow</div>
              <div className="text-xl font-bold font-mono text-zinc-200">
                ${traditionalEscrowFeeUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-zinc-500">3%–5% Service Fee</div>
              <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/[0.06]">
                Settlement: 3–5 Days
              </div>
            </div>

            {/* Upwork / Fiverr */}
            <div className="p-4 rounded-xl bg-[#0c0e17] border border-white/[0.06] space-y-2 opacity-80">
              <div className="text-xs font-semibold text-zinc-300">Gig Platforms</div>
              <div className="text-xl font-bold font-mono text-rose-400">
                ${upworkFeeUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-zinc-500">10%–20% Take Rate</div>
              <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/[0.06]">
                Settlement: 7–14 Days
              </div>
            </div>
          </div>

          {/* Simulation Progress Live Visualizer */}
          <AnimatePresence>
            {(isSimulating || simComplete) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-[#090b12] border border-purple-500/30 space-y-3 shadow-inner"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    Soroban Execution Stream
                  </span>
                  <span className="text-cyan-400 font-bold">{simProgress}% Complete</span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>{simProgress === 100 ? '✓ Disbursed 10,000 XLM atomically' : 'Verifying cryptographic multi-sig signatures...'}</span>
                  <span className="text-emerald-400 font-semibold">{simProgress === 100 ? 'TX Confirmed (3.2s)' : 'In Flight'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
