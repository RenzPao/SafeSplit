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
    <div className="card-elevation p-4 rounded-xl border-amber-500/20 bg-amber-500/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-zinc-200">
            Incoming Deal Invitations ({invitations.length})
          </h3>
        </div>
        <span className="text-[11px] text-amber-400/80 font-medium">Action Required</span>
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
              className="p-3.5 rounded-lg bg-[#12141a] border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#161820] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="min-w-0 pr-3">
                <div className="font-semibold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                  {inv.title || `Escrow Agreement #${inv.id.slice(0, 8)}`}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                  <span className="font-mono">From: {inv.client_address.slice(0, 4)}...{inv.client_address.slice(-4)}</span>
                  <span>•</span>
                  <span className="font-mono font-semibold text-zinc-200">{totalXlm.toLocaleString()} XLM</span>
                </div>
              </div>
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-colors shrink-0"
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
