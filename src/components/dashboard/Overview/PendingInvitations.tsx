'use client';

import React from 'react';
import { Mail, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { Escrow } from '../types';
import CopyButton from '@/components/ui/CopyButton';

interface PendingInvitationsProps {
  invitations: Escrow[];
  onSelectEscrow: (escrowId: string) => void;
}

export default function PendingInvitations({ invitations, onSelectEscrow }: PendingInvitationsProps) {
  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="card-elevation p-5 rounded-2xl border border-amber-500/30 bg-[#0d0f18]/90 shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-80" />
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Incoming Deal Invitations ({invitations.length})
          </h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm animate-pulse">
          Action Required
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {invitations.map((inv) => {
          const totalXlm = typeof inv.total_xlm === 'number'
            ? inv.total_xlm
            : parseFloat(inv.total_xlm || '0');

          return (
            <div
              key={inv.id}
              onClick={() => onSelectEscrow(inv.id)}
              className="p-4 rounded-xl bg-[#0a0c14] border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#12141e] cursor-pointer transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="min-w-0 pr-3">
                <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                  {inv.title || `Escrow Agreement #${inv.id.slice(0, 8)}`}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                  <span className="font-mono">From: {inv.client_address.slice(0, 4)}...{inv.client_address.slice(-4)}</span>
                  <span>•</span>
                  <span className="font-mono font-bold text-purple-300">{totalXlm.toLocaleString()} XLM</span>
                </div>
              </div>
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold border border-amber-500/20 transition-all shrink-0 shadow-sm group-hover:scale-105"
              >
                <span>Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
