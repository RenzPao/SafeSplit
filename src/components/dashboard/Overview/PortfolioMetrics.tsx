'use client';

import React from 'react';
import { Lock, CheckCircle2, AlertCircle, TrendingUp, Layers } from 'lucide-react';
import { Escrow } from '../types';

interface PortfolioMetricsProps {
  escrows: Escrow[];
  userWallet: string;
  walletBalance: string;
}

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Locked in Escrow */}
      <div className="card-elevation p-5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Value in Escrow</span>
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {totalLockedXlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-medium text-purple-400">XLM</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            ≈ ${(totalLockedXlm * XLM_USD_ESTIMATE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>
      </div>

      {/* Metric 2: Active Deals */}
      <div className="card-elevation p-5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Deals</span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {activeEscrows.length} <span className="text-sm font-sans font-normal text-zinc-500">Agreements</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across {escrows.length} total lifetime contracts
          </div>
        </div>
      </div>

      {/* Metric 3: Action Required */}
      <div className="card-elevation p-5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Action Items</span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            actionRequiredCount > 0 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {actionRequiredCount > 0 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {actionRequiredCount} <span className="text-sm font-sans font-normal text-zinc-500">{actionRequiredCount === 1 ? 'Item' : 'Items'}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {actionRequiredCount > 0 ? 'Requires your review or deposit' : 'All contracts up to date'}
          </div>
        </div>
      </div>

      {/* Metric 4: Total Settled Volume */}
      <div className="card-elevation p-5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Settled & Completed</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {completedVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-medium text-emerald-400">XLM</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {completedEscrows.length} successfully settled deals
          </div>
        </div>
      </div>
    </div>
  );
}
