'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  TrendingDown,
  Lock,
  Zap
} from 'lucide-react';

export default function EscrowPlayground() {
  const [budgetXlm, setBudgetXlm] = useState<number>(10000);
  const [milestoneCount, setMilestoneCount] = useState<number>(3);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simComplete, setSimComplete] = useState<boolean>(false);

  // FX Rate: 1 XLM ≈ $0.112 USD
  const XLM_PRICE_USD = 0.112;
  const budgetUsd = budgetXlm * XLM_PRICE_USD;

  // Fee Calculations
  const safeSplitFee = 0.00;
  const upworkFeeUsd = budgetUsd * 0.15;
  const traditionalEscrowFeeUsd = budgetUsd * 0.04;
  const totalSavedUsd = upworkFeeUsd - safeSplitFee;

  const perMilestoneXlm = Math.round(budgetXlm / milestoneCount);
  const perMilestoneUsd = perMilestoneXlm * XLM_PRICE_USD;

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimComplete(false);

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
    <section className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-2.5 sm:space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          <span>Interactive Cost & Settlement Playground</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Calculate Your Fee Savings & Test Run a Deal
        </h2>
        <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          See exactly how much capital you keep by eliminating centralized middleman commissions and executing trustlessly on Stellar.
        </p>
      </div>

      {/* Main Playground Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Deal Parameter Builder (5 cols) */}
        <div className="lg:col-span-5 card-elevation p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c0e17]/90 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Agreement Parameters</span>
            </h3>
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">Live Configurator</span>
          </div>

          {/* Deal Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-zinc-300">Contract Total Budget</label>
              <div className="font-mono text-white font-bold bg-white/[0.06] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-white/[0.06] text-xs">
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
              className="w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg touch-none"
            />
            <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-zinc-500">
              <span>1k XLM ($112)</span>
              <span>50k XLM ($5.6k)</span>
              <span>100k XLM ($11.2k)</span>
            </div>
          </div>

          {/* Milestone Breakdown Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-zinc-300">Milestone Tranches</label>
              <span className="font-mono text-purple-300 font-bold">{milestoneCount} Milestones</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setMilestoneCount(count)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    milestoneCount === count
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {count} {count === 1 ? 'Stage' : 'Stages'}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Milestone Breakdown Preview */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400">Milestone Tranche Value</span>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#07080d] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
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
            className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 min-h-[44px]"
          >
            {isSimulating ? (
              <>
                <Zap className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>Simulating ({simProgress}%)...</span>
              </>
            ) : simComplete ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Re-Run Simulation</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Simulate 1-Click Settlement</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Fee Comparison & Live Savings Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Highlight Savings Card */}
          <div className="card-elevation p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#0c0e17] to-purple-950/20 shadow-md space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                <span>Middleman Fee Savings</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Retained
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <div className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                  +${totalSavedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-zinc-400 mt-1">Total capital saved vs centralized freelance platforms</p>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* SafeSplit Protocol */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-1.5 sm:space-y-2 shadow-sm">
              <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                <span>SafeSplit</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white">$0.00</div>
              <div className="text-[10px] text-zinc-400">0% Platform Fee</div>
              <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 pt-1 border-t border-white/[0.06]">
                Stellar Gas: ~$0.000001
              </div>
            </div>

            {/* Centralized Escrow */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c0e17] border border-white/[0.06] space-y-1.5 sm:space-y-2 opacity-80">
              <div className="text-xs font-semibold text-zinc-300">Centralized Escrow</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-zinc-200">
                ${traditionalEscrowFeeUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-zinc-500">3%–5% Service Fee</div>
              <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/[0.06]">
                Settlement: 3–5 Days
              </div>
            </div>

            {/* Upwork / Fiverr */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c0e17] border border-white/[0.06] space-y-1.5 sm:space-y-2 opacity-80">
              <div className="text-xs font-semibold text-zinc-300">Gig Platforms</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
                ${upworkFeeUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-zinc-500">10%–20% Take Rate</div>
              <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/[0.06]">
                Settlement: 7–14 Days
              </div>
            </div>
          </div>

          {/* Simulation Progress Live Visualizer */}
          <AnimatePresence>
            {(isSimulating || simComplete) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#090b12] border border-purple-500/30 space-y-2.5 shadow-inner"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    Soroban Execution Stream
                  </span>
                  <span className="text-cyan-400 font-bold">{simProgress}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>

                <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span className="truncate max-w-[200px] sm:max-w-none">{simProgress === 100 ? '✓ Disbursed 10,000 XLM atomically' : 'Verifying signatures...'}</span>
                  <span className="text-emerald-400 font-semibold">{simProgress === 100 ? 'Confirmed (3.2s)' : 'In Flight'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
