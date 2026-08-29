'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, Copy, Check, Share2, ExternalLink, ShieldAlert } from 'lucide-react';
import { Escrow } from '../types';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import StellarHashLink from '@/components/ui/StellarHashLink';
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
    <div className="card-elevation p-5 rounded-xl flex flex-col gap-4">
      {/* Top Row: Back button & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Agreements</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share / Invite */}
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Deal Link</span>
          </button>

          {/* Download Invoice PDF */}
          <button
            onClick={handleDownloadInvoice}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : 'PDF Invoice'}</span>
          </button>

          {/* Export Calendar */}
          <button
            onClick={handleExportCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>.ICS Calendar</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Deal Title, Total XLM, and Contract Address */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-100">
              {escrow.title || `Escrow Agreement #${escrow.id.slice(0, 8)}`}
            </h1>
            <Badge status={escrow.status} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-zinc-500">Escrow ID:</span>
              <span className="text-zinc-300 font-semibold">{escrow.id.slice(0, 10)}...</span>
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

        {/* Financial Overview */}
        <div className="md:text-right bg-[#0d0f14] px-4 py-2.5 rounded-xl border border-white/[0.06]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Escrow Value</div>
          <div className="text-xl font-bold font-mono text-zinc-100 tabular-nums">
            {formattedXlm} <span className="text-xs font-sans text-purple-400 font-semibold">XLM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
