'use client';

import React from 'react';
import { Lock, CheckCircle2, AlertCircle, TrendingUp, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Escrow } from '../types';

interface PortfolioMetricsProps {
  escrows: Escrow[];
  userWallet: string;
  walletBalance: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

export default function PortfolioMetrics({ escrows, userWallet, walletBalance }: PortfolioMetricsProps) {
  // Compute portfolio metrics
  const activeEscrows = escrows.filter(
    (e) => e.status !== 'Completed' && e.status !== 'Cancelled'
  );

  const totalLockedXlm = activeEscrows.reduce((acc, e) => {
    const val = typeof e.total_xlm === 'number' ? e.total_xlm : parseFloat(e.total_xlm || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const completedEscrows = escrows.filter((e) => e.status === 'Completed');
  const completedVolume = completedEscrows.reduce((acc, e) => {
    const val = typeof e.total_xlm === 'number' ? e.total_xlm : parseFloat(e.total_xlm || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // Escrows needing user's immediate action
  const actionRequiredCount = escrows.filter((e) => {
    if (e.client_address === userWallet && e.status === 'Initialized') return true; // needs deposit
    if (e.client_address === userWallet && e.milestones?.some((m) => m.status === 'Submitted')) return true; // needs approval
    if (e.freelancer_address === userWallet && (e.status === 'Funded' || e.status === 'InProgress') && e.milestones?.some((m) => m.status === 'Pending')) return true; // needs work
    return false;
  }).length;

  const XLM_USD_ESTIMATE = 0.11; // Mock conversion rate for financial context

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Metric 1: Total Locked in Escrow */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -3 }}
        className="card-elevation p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(147,51,234,0.15)] transition-all"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-80" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Total Value in Escrow</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(147,51,234,0.2)]">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {totalLockedXlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-medium text-purple-400">XLM</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-zinc-400 font-mono">
              ≈ ${(totalLockedXlm * XLM_USD_ESTIMATE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Live TVL</span>
          </div>
        </div>
      </motion.div>

      {/* Metric 2: Active Deals */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -3 }}
        className="card-elevation p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 opacity-80" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Active Deals</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight flex items-baseline gap-2">
            <span>{activeEscrows.length}</span>
            <span className="text-sm font-sans font-normal text-zinc-400">Agreements</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>Across {escrows.length} lifetime contracts</span>
          </div>
        </div>
      </motion.div>

      {/* Metric 3: Action Required */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -3 }}
        className="card-elevation p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-80" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Action Items</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
            actionRequiredCount > 0 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          }`}>
            {actionRequiredCount > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight flex items-baseline gap-2">
            <span>{actionRequiredCount}</span>
            <span className="text-sm font-sans font-normal text-zinc-400">{actionRequiredCount === 1 ? 'Pending' : 'Pending'}</span>
          </div>
          <div className="mt-1.5">
            {actionRequiredCount > 0 ? (
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Requires your review or deposit
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                All agreements up to date
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Metric 4: Total Settled Volume */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -3 }}
        className="card-elevation p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-80" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Settled & Completed</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {completedVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-medium text-emerald-400">XLM</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400">
            <span className="text-emerald-400 font-semibold">{completedEscrows.length}</span> settled agreements
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
