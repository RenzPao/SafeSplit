'use client';

import React from 'react';
import { User, ShieldCheck, CheckCircle2, Lock, ArrowUpRight, Scale, AlertTriangle, RefreshCw } from 'lucide-react';
import { Escrow } from '../types';
import CopyButton from '@/components/ui/CopyButton';
import Badge from '@/components/ui/Badge';
import StellarHashLink from '@/components/ui/StellarHashLink';

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
      {/* ── Key Contract Actions ─────────────────────────────────── */}
      {needsDeposit && isClient && (
        <div className="card-elevation p-4 rounded-xl border-purple-500/30 bg-purple-950/20">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-2">
            <Lock className="w-4 h-4" />
            <span>Deposit Required to Activate</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
            To start this agreement, deposit the total escrow balance ({escrow.total_xlm} XLM) into the Soroban smart contract.
          </p>
          <button
            onClick={onDepositFunds}
            disabled={isActionLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            <span>Deposit {escrow.total_xlm} XLM on-chain</span>
          </button>
        </div>
      )}

      {allMilestonesApproved && escrow.status !== 'Completed' && (
        <div className="card-elevation p-4 rounded-xl border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All Milestones Approved</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
            All project stages have been approved and funds released. Finalize this agreement to settle the escrow.
          </p>
          <button
            onClick={onFinalizeEscrow}
            disabled={isActionLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Finalize & Close Escrow</span>
          </button>
        </div>
      )}

      {/* ── Agreement Parties ────────────────────────────────────── */}
      <div className="card-elevation p-4 rounded-xl">
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Agreement Parties
        </h3>

        <div className="space-y-3">
          {/* Client Card */}
          <div className={`p-3 rounded-lg border transition-all ${
            isClient ? 'bg-blue-500/[0.04] border-blue-500/30' : 'bg-[#0d0f14] border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Client (Depositor) {isClient && '• You'}
              </span>
              <Badge status="client" size="sm" showIcon={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-200">
                {escrow.client_address ? `${escrow.client_address.slice(0, 6)}...${escrow.client_address.slice(-4)}` : '—'}
              </span>
              <CopyButton text={escrow.client_address} size="sm" />
            </div>
          </div>

          {/* Freelancer Card */}
          <div className={`p-3 rounded-lg border transition-all ${
            isFreelancer ? 'bg-purple-500/[0.04] border-purple-500/30' : 'bg-[#0d0f14] border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                Freelancer (Payee) {isFreelancer && '• You'}
              </span>
              <Badge status="freelancer" size="sm" showIcon={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-200">
                {escrow.freelancer_address ? `${escrow.freelancer_address.slice(0, 6)}...${escrow.freelancer_address.slice(-4)}` : '—'}
              </span>
              <CopyButton text={escrow.freelancer_address} size="sm" />
            </div>
          </div>

          {/* Arbiter Card */}
          <div className={`p-3 rounded-lg border transition-all ${
            isArbiter ? 'bg-amber-500/[0.04] border-amber-500/30' : 'bg-[#0d0f14] border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Mediator / Arbiter {isArbiter && '• You'}
              </span>
              <Badge status="arbiter" size="sm" showIcon={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-200">
                {escrow.arbiter_address && !escrow.arbiter_address.startsWith('G0000')
                  ? `${escrow.arbiter_address.slice(0, 6)}...${escrow.arbiter_address.slice(-4)}`
                  : 'SafeSplit Protocol Auto-Resolve'}
              </span>
              {escrow.arbiter_address && !escrow.arbiter_address.startsWith('G0000') && (
                <CopyButton text={escrow.arbiter_address} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Technical Specifications ─────────────────────────────── */}
      <div className="card-elevation p-4 rounded-xl text-xs space-y-2.5">
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Protocol State
        </h3>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Smart Contract Network</span>
          <span className="text-zinc-200 font-mono">Stellar Soroban Testnet</span>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Contract Target</span>
          <StellarHashLink hash={escrow.contract_address} type="contract" truncateLen={4} />
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Fee Commission</span>
          <span className="text-emerald-400 font-medium font-mono">0.00% (Zero Fee)</span>
        </div>

        {escrow.webhook_url && (
          <div className="flex items-center justify-between text-zinc-400 pt-2 border-t border-white/[0.06]">
            <span>Webhook Integrations</span>
            <span className="text-purple-400 font-mono text-[11px]">Active (Discord/Slack)</span>
          </div>
        )}
      </div>
    </div>
  );
}
