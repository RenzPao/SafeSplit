'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Filter, Plus, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { Escrow } from '../types';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';

interface EscrowDataTableProps {
  escrows: Escrow[];
  userWallet: string;
  onSelectEscrow: (escrowId: string) => void;
  onCreateNew: () => void;
}

export default function EscrowDataTable({
  escrows,
  userWallet,
  onSelectEscrow,
  onCreateNew,
}: EscrowDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'client' | 'freelancer' | 'arbiter' | 'completed'>('all');

  const filteredEscrows = useMemo(() => {
    return escrows.filter((escrow) => {
      // Role & Status filters
      if (activeFilter === 'active' && (escrow.status === 'Completed' || escrow.status === 'Cancelled')) return false;
      if (activeFilter === 'completed' && escrow.status !== 'Completed') return false;
      if (activeFilter === 'client' && escrow.client_address !== userWallet) return false;
      if (activeFilter === 'freelancer' && escrow.freelancer_address !== userWallet) return false;
      if (activeFilter === 'arbiter' && escrow.arbiter_address !== userWallet) return false;

      // Search term filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchTitle = (escrow.title || '').toLowerCase().includes(term);
      const matchId = escrow.id.toLowerCase().includes(term);
      const matchClient = escrow.client_address.toLowerCase().includes(term);
      const matchFreelancer = escrow.freelancer_address.toLowerCase().includes(term);
      return matchTitle || matchId || matchClient || matchFreelancer;
    });
  }, [escrows, activeFilter, searchTerm, userWallet]);

  return (
    <div className="card-elevation rounded-2xl overflow-hidden flex flex-col border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-[#0a0c14]/90">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All Deals' },
            { id: 'active', label: 'Active Deals' },
            { id: 'client', label: 'As Client' },
            { id: 'freelancer', label: 'As Freelancer' },
            { id: 'arbiter', label: 'As Arbiter' },
            { id: 'completed', label: 'Settled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.2)] border border-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, ID, or wallet..."
              className="w-full bg-[#12141e] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 transition-colors shadow-inner"
            />
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Escrow</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredEscrows.length === 0 ? (
        <div className="p-14 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3.5 shadow-[0_0_20px_rgba(147,51,234,0.15)]">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No agreements found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            {searchTerm
              ? 'No escrows match your search query. Try searching with a different term.'
              : 'You do not have any active or settled agreements matching this filter.'}
          </p>
          <button
            onClick={onCreateNew}
            className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            Create Your First Escrow
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-[#0a0c14]/60">
                <th className="py-3.5 px-5">Agreement / SOW</th>
                <th className="py-3.5 px-4">Your Role</th>
                <th className="py-3.5 px-4">Counterparty</th>
                <th className="py-3.5 px-4">Milestone Progress</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredEscrows.map((escrow) => {
                const isClient = escrow.client_address === userWallet;
                const isFreelancer = escrow.freelancer_address === userWallet;
                const isArbiter = escrow.arbiter_address === userWallet;

                const counterpartyAddress = isClient
                  ? escrow.freelancer_address
                  : escrow.client_address;

                const counterpartyRole = isClient ? 'Freelancer' : 'Client';

                const totalMilestones = escrow.milestones?.length || 0;
                const completedMilestones = escrow.milestones?.filter((m) => m.status === 'Approved').length || 0;
                const inReviewMilestones = escrow.milestones?.filter((m) => m.status === 'Submitted').length || 0;
                const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                const formattedXlm = typeof escrow.total_xlm === 'number'
                  ? escrow.total_xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : parseFloat(escrow.total_xlm || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                return (
                  <tr
                    key={escrow.id}
                    onClick={() => onSelectEscrow(escrow.id)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-all group hover:border-l-2 hover:border-l-purple-500"
                  >
                    {/* Agreement Title */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                        <span>{escrow.title || `Escrow #${escrow.id.slice(0, 8)}`}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center gap-1.5">
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded text-zinc-400">ID: {escrow.id.slice(0, 8)}</span>
                        <CopyButton text={escrow.id} size="sm" />
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isClient 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                          : isFreelancer 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isClient ? 'bg-blue-400' : isFreelancer ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                        {isClient ? 'Client' : isFreelancer ? 'Freelancer' : isArbiter ? 'Arbiter' : 'Observer'}
                      </span>
                    </td>

                    {/* Counterparty */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-950/60 to-indigo-950/60 border border-purple-500/20 flex items-center justify-center text-purple-300 font-mono text-[11px] font-bold">
                          {counterpartyRole.charAt(0)}
                        </div>
                        <div>
                          <div className="font-mono text-[11px] text-zinc-200 font-medium">
                            {counterpartyAddress ? `${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(-4)}` : 'Unassigned'}
                          </div>
                          <div className="text-[10px] text-zinc-500">{counterpartyRole}</div>
                        </div>
                      </div>
                    </td>

                    {/* Milestone Progress (Segmented) */}
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 font-mono">
                          <span className="text-zinc-300 font-semibold">{completedMilestones}/{totalMilestones} done</span>
                          <span className="text-purple-300 font-bold">{Math.round(progressPercent)}%</span>
                        </div>
                        
                        {/* Segmented Progress Bar */}
                        <div className="flex items-center gap-1 w-full h-2 rounded-full overflow-hidden bg-zinc-800/80 p-0.5">
                          {escrow.milestones?.map((m, mIdx) => {
                            const isApproved = m.status === 'Approved';
                            const isSubmitted = m.status === 'Submitted';
                            return (
                              <div
                                key={mIdx}
                                className={`h-full flex-1 rounded-full transition-all ${
                                  isApproved 
                                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                                    : isSubmitted 
                                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                                      : 'bg-zinc-700'
                                }`}
                                title={`Milestone ${mIdx + 1}: ${m.title} (${m.status})`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-mono">
                      <span className="font-bold text-white text-sm tabular-nums">{formattedXlm}</span>{' '}
                      <span className="text-purple-400 font-semibold text-[11px]">XLM</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <Badge status={escrow.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEscrow(escrow.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-purple-600 text-zinc-300 hover:text-white text-xs font-semibold transition-all group/btn shadow-sm"
                        title="Open Deal Workspace"
                      >
                        <span>Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
