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
    <div className="card-elevation rounded-xl overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-white/[0.07] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d0f14]">
        {/* Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All Deals' },
            { id: 'active', label: 'Active' },
            { id: 'client', label: 'As Client' },
            { id: 'freelancer', label: 'As Freelancer' },
            { id: 'arbiter', label: 'As Arbiter' },
            { id: 'completed', label: 'Settled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-white/[0.1] text-zinc-100 shadow-sm border border-white/[0.1]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, ID, or wallet..."
              className="w-full bg-[#161820] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/60 placeholder:text-zinc-600 transition-colors"
            />
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Escrow</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredEscrows.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-300">No agreements found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            {searchTerm
              ? 'No escrows match your search query. Try searching with a different term.'
              : 'You do not have any active or settled agreements matching this filter.'}
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
          >
            Create Your First Escrow
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-[#0d0f14]/50">
                <th className="py-3 px-4">Agreement / SOW</th>
                <th className="py-3 px-4">Your Role</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
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
                const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                const formattedXlm = typeof escrow.total_xlm === 'number'
                  ? escrow.total_xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : parseFloat(escrow.total_xlm || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                return (
                  <tr
                    key={escrow.id}
                    onClick={() => onSelectEscrow(escrow.id)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    {/* Agreement Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors">
                        {escrow.title || `Escrow #${escrow.id.slice(0, 8)}`}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5 flex items-center gap-1">
                        <span>ID: {escrow.id.slice(0, 8)}</span>
                        <CopyButton text={escrow.id} size="sm" />
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <Badge
                        status={isClient ? 'client' : isFreelancer ? 'freelancer' : isArbiter ? 'arbiter' : 'Observer'}
                        size="sm"
                      />
                    </td>

                    {/* Counterparty */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-400 font-mono text-[10px]">
                          {counterpartyRole.charAt(0)}
                        </div>
                        <div>
                          <div className="font-mono text-[11px] text-zinc-300">
                            {counterpartyAddress ? `${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(-4)}` : 'Unassigned'}
                          </div>
                          <div className="text-[10px] text-zinc-500">{counterpartyRole}</div>
                        </div>
                      </div>
                    </td>

                    {/* Milestone Progress */}
                    <td className="py-3.5 px-4">
                      <div className="w-28">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                          <span>{completedMilestones}/{totalMilestones} done</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-zinc-100">{formattedXlm}</span>{' '}
                      <span className="text-zinc-500 text-[11px]">XLM</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={escrow.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEscrow(escrow.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Open Deal Workspace"
                      >
                        <ChevronRight className="w-4 h-4" />
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
