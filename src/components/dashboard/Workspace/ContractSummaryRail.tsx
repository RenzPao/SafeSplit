'use client';

import React from 'react';
import { User, ShieldCheck, CheckCircle2, Lock, ArrowUpRight, Scale, AlertTriangle, RefreshCw } from 'lucide-react';
import { Escrow } from '../types';
import CopyButton from '@/components/ui/CopyButton';
import Badge from '@/components/ui/Badge';
import StellarHashLink from '@/components/ui/StellarHashLink';
import DealFlowGraph from './DealFlowGraph';

interface ContractSummaryRailProps {
  escrow: Escrow;
  userWallet: string;
  onDepositFunds: () => void;
  onFinalizeEscrow: () => void;
  isActionLoading: boolean;
}

export default function ContractSummaryRail({
  escrow,
  userWallet,
  onDepositFunds,
  onFinalizeEscrow,
  isActionLoading,
}: ContractSummaryRailProps) {
  const isClient = escrow.client_address === userWallet;
  const isFreelancer = escrow.freelancer_address === userWallet;
  const isArbiter = escrow.arbiter_address === userWallet;

  const allMilestonesApproved = escrow.milestones?.length > 0 && escrow.milestones.every((m) => m.status === 'Approved');
  const needsDeposit = escrow.status === 'Initialized';

  return (
    <div className="space-y-4">
      {/* ── Visual Custody Flow Diagram ──────────────────────────── */}
      <DealFlowGraph escrow={escrow} userWallet={userWallet} />

      {/* ── Key Contract Actions ─────────────────────────────────── */}
      {needsDeposit && isClient && (
        <div className="card-elevation p-5 rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/30 to-[#0d0f18] shadow-[0_0_30px_rgba(147,51,234,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold mb-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Deposit Required to Activate</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            Deposit the total escrow balance ({escrow.total_xlm} XLM) into the Soroban smart contract to lock funds and authorize the freelancer to begin.
          </p>
          <button
            onClick={onDepositFunds}
            disabled={isActionLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
          >
            {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Deposit {escrow.total_xlm} XLM on-chain</span>
          </button>
        </div>
      )}

      {allMilestonesApproved && escrow.status !== 'Completed' && (
        <div className="card-elevation p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-[#0d0f18] shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All Milestones Approved</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            All project stages have been approved and funds released. Finalize this agreement to formally settle and archive the contract.
          </p>
          <button
            onClick={onFinalizeEscrow}
            disabled={isActionLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
          >
            {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Finalize & Close Escrow</span>
          </button>
        </div>
      )}

      {/* ── Agreement Parties ────────────────────────────────────── */}
      <div className="card-elevation p-5 rounded-2xl border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3.5">
          Agreement Parties
        </h3>

        <div className="space-y-3">
          {/* Client Card */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isClient 
              ? 'bg-blue-500/[0.08] border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
              : 'bg-[#0a0c14]/80 border-white/[0.06] hover:border-white/[0.12]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Client (Depositor) {isClient && '• You'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Client</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white font-medium">
                {escrow.client_address ? `${escrow.client_address.slice(0, 6)}...${escrow.client_address.slice(-4)}` : '—'}
              </span>
              <CopyButton text={escrow.client_address} size="sm" />
            </div>
          </div>

          {/* Freelancer Card */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isFreelancer 
              ? 'bg-purple-500/[0.08] border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
              : 'bg-[#0a0c14]/80 border-white/[0.06] hover:border-white/[0.12]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Freelancer (Payee) {isFreelancer && '• You'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Freelancer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white font-medium">
                {escrow.freelancer_address ? `${escrow.freelancer_address.slice(0, 6)}...${escrow.freelancer_address.slice(-4)}` : '—'}
              </span>
              <CopyButton text={escrow.freelancer_address} size="sm" />
            </div>
          </div>

          {/* Arbiter Card */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isArbiter 
              ? 'bg-amber-500/[0.08] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
              : 'bg-[#0a0c14]/80 border-white/[0.06] hover:border-white/[0.12]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Mediator / Arbiter {isArbiter && '• You'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Arbiter</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-300">
                {escrow.arbiter_address && !escrow.arbiter_address.startsWith('G0000')
                  ? `${escrow.arbiter_address.slice(0, 6)}...${escrow.arbiter_address.slice(-4)}`
                  : 'Protocol Auto-Resolve'}
              </span>
              {escrow.arbiter_address && !escrow.arbiter_address.startsWith('G0000') && (
                <CopyButton text={escrow.arbiter_address} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Technical Specifications ─────────────────────────────── */}
      <div className="card-elevation p-5 rounded-2xl border border-white/[0.08] bg-[#0d0f18]/90 text-xs space-y-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Protocol State
        </h3>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Smart Contract Network</span>
          <span className="text-purple-300 font-mono font-medium">Stellar Soroban Testnet</span>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Contract Target</span>
          <StellarHashLink hash={escrow.contract_address} type="contract" truncateLen={4} />
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Protocol Commission</span>
          <span className="text-emerald-400 font-semibold font-mono">0.00% (Zero Fee)</span>
        </div>

        {escrow.webhook_url && (
          <div className="flex items-center justify-between text-zinc-400 pt-2.5 border-t border-white/[0.06]">
            <span>Webhook Integrations</span>
            <span className="text-cyan-400 font-mono text-[11px] font-semibold">Active (Slack/Discord)</span>
          </div>
        )}
      </div>
    </div>
  );
}
