'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle2, User, Scale, ArrowRight, Zap } from 'lucide-react';
import { Escrow } from '../types';

interface DealFlowGraphProps {
  escrow: Escrow;
  userWallet: string;
}

export default function DealFlowGraph({ escrow, userWallet }: DealFlowGraphProps) {
  const isFunded = escrow.status === 'Funded' || escrow.status === 'InProgress' || escrow.status === 'Completed';
  const isCompleted = escrow.status === 'Completed';
  const isDisputed = escrow.status === 'Disputed';

  const totalMilestones = escrow.milestones?.length || 0;
  const approvedMilestones = escrow.milestones?.filter((m) => m.status === 'Approved').length || 0;
  const progressPct = totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="card-elevation p-5 rounded-2xl border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
            Live Soroban Custody Graph
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Atomic Execution
        </span>
      </div>

      {/* Node Flow Diagram */}
      <div className="relative py-4 px-2">
        <div className="grid grid-cols-3 gap-3 items-center relative z-10">
          {/* Node 1: Client / Depositor */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#0a0c14] border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-2">
              <User className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">Client</div>
            <div className="text-[9px] font-mono text-zinc-400 truncate max-w-[80px]">
              {escrow.client_address ? `${escrow.client_address.slice(0, 4)}...${escrow.client_address.slice(-3)}` : 'Unset'}
            </div>
            <div className="mt-1.5 text-[9px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded">
              Depositor
            </div>
          </div>

          {/* Node 2: Soroban Smart Vault */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-gradient-to-b from-purple-950/40 to-[#0a0c14] border border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.2)] relative">
            {/* Animated Vault Aura */}
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/60 flex items-center justify-center text-purple-300 mb-2 shadow-[0_0_12px_rgba(147,51,234,0.5)]">
              {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Lock className="w-4 h-4 text-purple-300" />}
            </div>
            <div className="text-[11px] font-bold text-white">Soroban Vault</div>
            <div className="text-[10px] font-mono font-extrabold text-purple-300 mt-0.5">
              {escrow.total_xlm} XLM
            </div>
            <div className="mt-1 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isFunded ? (isCompleted ? 'Settled' : 'Locked') : 'Awaiting'}</span>
            </div>
          </div>

          {/* Node 3: Freelancer / Payee */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#0a0c14] border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-2">
              <User className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">Freelancer</div>
            <div className="text-[9px] font-mono text-zinc-400 truncate max-w-[80px]">
              {escrow.freelancer_address ? `${escrow.freelancer_address.slice(0, 4)}...${escrow.freelancer_address.slice(-3)}` : 'Unset'}
            </div>
            <div className="mt-1.5 text-[9px] font-mono px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded">
              Payee
            </div>
          </div>
        </div>

        {/* Animated Connection Particle Beams */}
        <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-white/[0.08] -translate-y-1/2 -z-0">
          {isFunded && (
            <motion.div
              className="h-full w-12 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"
              animate={{ x: ['0%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
            />
          )}
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>Funds Released to Freelancer</span>
          <span className="text-purple-300 font-bold">{Math.round(progressPct)}% Disbursed</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
