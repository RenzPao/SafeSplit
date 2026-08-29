'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, Copy, Check, Share2, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Escrow } from '../types';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import StellarHashLink from '@/components/ui/StellarHashLink';
import RadialProgress from '@/components/ui/RadialProgress';
import { useToast } from '@/contexts/ToastContext';

interface EscrowHeaderProps {
  escrow: Escrow;
  userWallet: string;
  onBack: () => void;
}

export default function EscrowHeader({ escrow, userWallet, onBack }: EscrowHeaderProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const formattedXlm = typeof escrow.total_xlm === 'number'
    ? escrow.total_xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : parseFloat(escrow.total_xlm || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalMilestones = escrow.milestones?.length || 0;
  const approvedMilestones = escrow.milestones?.filter((m) => m.status === 'Approved').length || 0;
  const completionPct = totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0;

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/dashboard?escrow=${escrow.id}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite Link Copied', 'Share this direct link with your client or freelancer.');
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/escrows/${escrow.id}/invoice`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate invoice');
      const data = await res.json();
      if (data.invoice_url) {
        window.open(data.invoice_url, '_blank');
        toast.success('Invoice Generated', 'Official PDF invoice opened in a new tab.');
      }
    } catch (err: any) {
      toast.error('Invoice Generation Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCalendar = () => {
    window.open(`/api/escrows/${escrow.id}/calendar`, '_blank');
    toast.success('Calendar Exported', 'Milestone deadlines ICS file downloaded.');
  };

  return (
    <div className="card-elevation p-5 md:p-6 rounded-2xl flex flex-col gap-4 border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 opacity-60" />
      {/* Top Row: Back button & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.06] px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-white/[0.08]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Agreements</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Share / Invite */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] hover:border-purple-500/40 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Copy Link</span>
          </motion.button>

          {/* Download Invoice PDF */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadInvoice}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] hover:border-purple-500/40 transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExporting ? 'Generating...' : 'PDF Invoice'}</span>
          </motion.button>

          {/* Export Calendar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCalendar}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] hover:border-purple-500/40 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>.ICS Calendar</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Row: Deal Title, Total XLM, and Radial Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {escrow.title || `Escrow Agreement #${escrow.id.slice(0, 8)}`}
            </h1>
            <Badge status={escrow.status} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-3.5 mt-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-zinc-500">Escrow ID:</span>
              <span className="text-zinc-200 font-semibold bg-white/[0.04] px-1.5 py-0.5 rounded">{escrow.id.slice(0, 10)}...</span>
              <CopyButton text={escrow.id} size="sm" />
            </div>

            <span>•</span>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-zinc-500">Soroban Contract:</span>
              <StellarHashLink hash={escrow.contract_address} type="contract" truncateLen={5} />
            </div>

            {escrow.created_at && (
              <>
                <span>•</span>
                <span className="text-zinc-500">Created {new Date(escrow.created_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Financial & Completion Metrics */}
        <div className="flex items-center gap-4 bg-[#0a0c14]/90 p-3.5 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(147,51,234,0.1)] shrink-0">
          <RadialProgress
            progress={completionPct}
            size={56}
            strokeWidth={5}
            label={`${approvedMilestones}/${totalMilestones}`}
            sublabel="Milestones"
          />

          <div className="h-9 w-[1px] bg-white/[0.08]" />

          <div className="text-right pr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Total Escrow Value</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums tracking-tight">
              {formattedXlm} <span className="text-xs font-sans text-purple-400 font-semibold">XLM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
