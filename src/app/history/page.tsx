'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Scale, 
  ShieldAlert, 
  XCircle, 
  FileText, 
  BarChart3, 
  Activity, 
  Globe2,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import StellarHashLink from '@/components/ui/StellarHashLink';
import CopyButton from '@/components/ui/CopyButton';
import Badge from '@/components/ui/Badge';

/* ─── Types ──────────────────────────────────────────────────────── */
interface Transaction {
  id: string;
  timestamp: string;
  event_name: string;
  tx_hash: string;
  details: string;
  milestone_title: string | null;
  amount_xlm: number | null;
}

interface Party {
  address: string;
  name: string;
}

interface EscrowRecord {
  id: string;
  title: string;
  contract_address: string;
  status: string;
  total_xlm: number;
  created_at: string;
  userRole: 'client' | 'freelancer' | 'arbiter' | 'observer';
  parties: {
    client: Party;
    freelancer: Party;
    arbiter: Party | null;
  };
  milestones: { index: number; title: string; status: string; amount_xlm: number }[];
  transactions: Transaction[];
}

interface Summary {
  totalEscrows: number;
  totalVolume: number;
  totalTransactions: number;
  completedEscrows: number;
}

const ACTION_FILTERS = ['All', 'Deposits', 'Milestones', 'Disputes', 'Settlements'] as const;
type ActionFilter = typeof ACTION_FILTERS[number];

const ROLE_FILTERS = ['All', 'Client', 'Freelancer', 'Arbiter'] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const DATE_FILTERS = ['All Time', 'Last 7 Days', 'Last 30 Days'] as const;
type DateFilter = typeof DATE_FILTERS[number];

export default function HistoryPage() {
  const { address, connectFreighter } = useWallet();
  const [data, setData] = useState<{ escrows: EscrowRecord[]; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('All');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All Time');
  const [expandedEscrows, setExpandedEscrows] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEscrows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchHistory = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history?wallet=${encodeURIComponent(addr)}`);
      if (!res.ok) throw new Error('Failed to fetch transaction history');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchHistory(address);
    } else {
      setData(null);
    }
  }, [address, fetchHistory]);

  // Export CSV Ledger
  const handleExportCsv = () => {
    if (!data) return;
    const headers = ['Escrow ID', 'Agreement Title', 'Role', 'Event', 'XLM Amount', 'Timestamp', 'Tx Hash', 'Details'];
    const rows: string[][] = [];

    data.escrows.forEach((e) => {
      e.transactions.forEach((tx) => {
        rows.push([
          e.id,
          `"${e.title.replace(/"/g, '""')}"`,
          e.userRole,
          tx.event_name,
          tx.amount_xlm !== null ? String(tx.amount_xlm) : '',
          new Date(tx.timestamp).toISOString(),
          tx.tx_hash,
          `"${(tx.details || '').replace(/"/g, '""')}"`,
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `safesplit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter escrows
  const filteredEscrows = useMemo(() => {
    if (!data) return [];
    return data.escrows.filter((e) => {
      if (roleFilter !== 'All' && e.userRole !== roleFilter.toLowerCase()) return false;

      if (dateFilter !== 'All Time') {
        const cutoff = dateFilter === 'Last 7 Days'
          ? Date.now() - 7 * 86400000
          : Date.now() - 30 * 86400000;
        const hasRecentTx = e.transactions.some((tx) => new Date(tx.timestamp).getTime() > cutoff);
        if (!hasRecentTx) return false;
      }

      if (!search) return true;
      const term = search.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(term);
      const matchId = e.id.toLowerCase().includes(term);
      const matchParty = e.parties.client.name.toLowerCase().includes(term) || e.parties.freelancer.name.toLowerCase().includes(term);
      const matchTx = e.transactions.some((tx) => tx.tx_hash.toLowerCase().includes(term));
      return matchTitle || matchId || matchParty || matchTx;
    });
  }, [data, roleFilter, dateFilter, search]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090a] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0d0f14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-white/[0.08]" />
            <h1 className="text-sm font-bold text-zinc-100">Financial Ledger & Audit Trail</h1>
          </div>

          <div className="flex items-center gap-2.5">
            {data && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-200 border border-white/[0.08] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}

            {address && (
              <button
                onClick={() => fetchHistory(address)}
                disabled={loading}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {!address && !loading && (
          <div className="card-elevation p-16 rounded-2xl text-center flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-zinc-100">Connect Wallet to View Ledger</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Connect your Stellar wallet to view complete on-chain audit trails, milestone settlement receipts, and transaction history.
            </p>
            <button
              onClick={connectFreighter}
              className="mt-5 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {loading && (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
            <p className="text-xs text-zinc-400">Loading verified on-chain ledger...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card-elevation p-8 rounded-xl border-rose-500/30 text-center max-w-md mx-auto space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-100">Failed to load ledger</h3>
            <p className="text-xs text-zinc-400">{error}</p>
            <button
              onClick={() => address && fetchHistory(address)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && address && (
          <>
            {/* Summary Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card-elevation p-4 rounded-xl">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Escrows</span>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-1 tabular-nums">
                  {data.summary.totalEscrows}
                </div>
              </div>

              <div className="card-elevation p-4 rounded-xl">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Settled Volume</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                  {data.summary.totalVolume.toLocaleString()} <span className="text-xs font-sans">XLM</span>
                </div>
              </div>

              <div className="card-elevation p-4 rounded-xl">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Transactions</span>
                <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
                  {data.summary.totalTransactions}
                </div>
              </div>

              <div className="card-elevation p-4 rounded-xl">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Completed</span>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-1 tabular-nums">
                  {data.summary.completedEscrows}
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="card-elevation p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d0f14]">
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      roleFilter === r
                        ? 'bg-white/[0.1] text-zinc-100 shadow-sm border border-white/[0.1]'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search agreements, tx hashes..."
                  className="w-full bg-[#161820] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Escrow Agreements Ledger Accordions */}
            <div className="space-y-4">
              {filteredEscrows.length === 0 ? (
                <div className="card-elevation p-12 rounded-xl text-center text-zinc-500 text-xs">
                  No transaction records match the selected filters.
                </div>
              ) : (
                filteredEscrows.map((escrow) => {
                  const isExpanded = expandedEscrows[escrow.id] ?? true;

                  return (
                    <div key={escrow.id} className="card-elevation rounded-xl overflow-hidden">
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleExpand(escrow.id)}
                        className="p-4 bg-[#0d0f14] border-b border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-[#12141a] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold text-xs text-zinc-100 flex items-center gap-2">
                              <span>{escrow.title}</span>
                              <Badge status={escrow.userRole} size="sm" showIcon={false} />
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 mt-0.5 flex items-center gap-2">
                              <span>ID: {escrow.id.slice(0, 8)}</span>
                              <span>•</span>
                              <span>Total: {escrow.total_xlm.toLocaleString()} XLM</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge status={escrow.status} size="sm" />
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                        </div>
                      </div>

                      {/* Transaction Audit List */}
                      {isExpanded && (
                        <div className="p-4 divide-y divide-white/[0.04]">
                          {escrow.transactions.length === 0 ? (
                            <div className="text-xs text-zinc-500 py-3 text-center">
                              No on-chain events recorded for this agreement.
                            </div>
                          ) : (
                            escrow.transactions.map((tx) => (
                              <div key={tx.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                                    <span>{tx.event_name}</span>
                                    {tx.amount_xlm !== null && (
                                      <span className="font-mono text-purple-400">({tx.amount_xlm} XLM)</span>
                                    )}
                                  </div>
                                  {tx.details && <p className="text-[11px] text-zinc-400">{tx.details}</p>}
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {new Date(tx.timestamp).toLocaleString()}
                                  </span>
                                  {tx.tx_hash && (
                                    <StellarHashLink hash={tx.tx_hash} type="tx" truncateLen={4} />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
