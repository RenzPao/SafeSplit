'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, Download, Search, ChevronDown, ChevronUp,
  Copy, Check, ExternalLink, ShieldCheck, Wallet, Clock, CheckCircle2,
  AlertTriangle, Zap, Scale, ShieldAlert, XCircle, FileText, BarChart3,
  Users, Activity, Globe2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getAddress, isConnected } from '@stellar/freighter-api';
import StellarExpertButton from '@/components/StellarExpertButton';

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

/* ─── Event Config ───────────────────────────────────────────────── */
const EVENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string; amountSign?: '+' | '-' }> = {
  EscrowCreated:          { label: 'Escrow Created',       icon: FileText,     color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  EscrowInitializedOnChain: { label: 'Deployed On-Chain',  icon: Globe2,       color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  EscrowFunded:           { label: 'Contract Funded',       icon: Zap,          color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', amountSign: '-' },
  WorkSubmitted:          { label: 'Work Submitted',        icon: FileText,     color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  MilestoneApproved:      { label: 'Milestone Released',    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', amountSign: '+' },
  DisputeRaised:          { label: 'Dispute Raised',        icon: AlertTriangle,color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  SettlementProposed:     { label: 'Split Proposed',        icon: Scale,        color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  SettlementAccepted:     { label: 'Split Accepted',        icon: Scale,        color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', amountSign: '+' },
  DisputeResolved:        { label: 'Dispute Resolved',      icon: ShieldCheck,  color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  EscrowCancelled:        { label: 'Escrow Cancelled',      icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  EscrowCompleted:        { label: 'Escrow Completed',      icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ArbiterResolution:      { label: 'Arbiter Settled',       icon: ShieldAlert,  color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
};

const DEFAULT_EVENT = { label: 'Transaction', icon: Activity, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' };

function getEventConfig(eventName: string) {
  return EVENT_CONFIG[eventName] ?? DEFAULT_EVENT;
}

/* ─── Status Badge ───────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Initialized: { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  Funded:      { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  InProgress:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  Disputed:    { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  Completed:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Cancelled:   { color: 'text-zinc-500',    bg: 'bg-zinc-500/10',    border: 'border-zinc-800' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Initialized'];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {status}
    </span>
  );
}

/* ─── Role Badge ─────────────────────────────────────────────────── */
const ROLE_COLORS: Record<string, string> = {
  client:     'text-blue-300 bg-blue-950/40 border-blue-800/40',
  freelancer: 'text-purple-300 bg-purple-950/40 border-purple-800/40',
  arbiter:    'text-amber-300 bg-amber-950/40 border-amber-800/40',
  observer:   'text-zinc-400 bg-zinc-900/40 border-zinc-800',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${ROLE_COLORS[role] ?? ROLE_COLORS.observer}`}>
      {role}
    </span>
  );
}

/* ─── Relative Time ──────────────────────────────────────────────── */
function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

/* ─── Address Shortener ──────────────────────────────────────────── */
function shortAddr(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/* ─── Copy Button ────────────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} className="p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors" title="Copy">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

/* ─── Party Row ──────────────────────────────────────────────────── */
function PartyRow({ label, party, labelColor }: { label: string; party: Party; labelColor: string }) {
  const expertUrl = `https://stellar.expert/explorer/testnet/account/${party.address}`;
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-zinc-900 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${labelColor}`}>{label}</span>
        <span className="text-zinc-300 font-semibold text-xs truncate">{party.name}</span>
        <span className="text-zinc-600 font-mono text-[10px] hidden sm:inline">{shortAddr(party.address)}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <CopyBtn text={party.address} />
        <a href={expertUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border border-purple-800/40 bg-purple-950/20 text-purple-400 hover:text-purple-300 hover:border-purple-600 transition-all">
          <ExternalLink className="w-2.5 h-2.5" /> Account
        </a>
      </div>
    </div>
  );
}

/* ─── Transaction Row ────────────────────────────────────────────── */
function TxRow({ tx }: { tx: Transaction }) {
  const cfg = getEventConfig(tx.event_name);
  const Icon = cfg.icon;
  const isCredit = cfg.amountSign === '+';
  const isDebit = cfg.amountSign === '-';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-zinc-900/60 hover:bg-zinc-900/30 transition-colors group"
    >
      {/* Timestamp */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="text-xs text-zinc-400 font-medium" title={new Date(tx.timestamp).toLocaleString()}>
          {relativeTime(tx.timestamp)}
        </div>
        <div className="text-[10px] text-zinc-600 font-mono mt-0.5 hidden sm:block">
          {new Date(tx.timestamp).toLocaleDateString()}
        </div>
      </td>

      {/* Action */}
      <td className="py-3 px-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${cfg.color} ${cfg.bg} ${cfg.border}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </div>
        {tx.milestone_title && (
          <div className="text-[10px] text-zinc-500 mt-1 truncate max-w-[180px]">
            ↳ {tx.milestone_title}
          </div>
        )}
      </td>

      {/* Amount */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        {tx.amount_xlm != null ? (
          <span className={`text-sm font-black font-mono ${isCredit ? 'text-emerald-400' : isDebit ? 'text-rose-400' : 'text-zinc-300'}`}>
            {isCredit ? '+' : isDebit ? '−' : ''}{tx.amount_xlm.toLocaleString()} XLM
          </span>
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </td>

      {/* Tx Hash */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-zinc-500 hidden md:inline">
            {tx.tx_hash && tx.tx_hash !== 'off-chain-init' ? `${tx.tx_hash.slice(0, 10)}...${tx.tx_hash.slice(-6)}` : 'off-chain'}
          </span>
          <CopyBtn text={tx.tx_hash} />
        </div>
      </td>

      {/* Stellar Expert */}
      <td className="py-3 px-4">
        <StellarExpertButton txHash={tx.tx_hash} />
      </td>
    </motion.tr>
  );
}

/* ─── Escrow Accordion ───────────────────────────────────────────── */
function EscrowAccordion({ escrow }: { escrow: EscrowRecord }) {
  const [open, setOpen] = useState(false);

  const statusCfg = STATUS_CONFIG[escrow.status] ?? STATUS_CONFIG['Initialized'];
  const leftBorder = escrow.status === 'Completed' ? 'border-l-emerald-500/60'
    : escrow.status === 'Cancelled' ? 'border-l-zinc-700'
    : escrow.status === 'Disputed' ? 'border-l-rose-500/60'
    : 'border-l-purple-500/60';

  return (
    <div className={`rounded-2xl bg-zinc-950 border border-zinc-800/60 border-l-4 ${leftBorder} overflow-hidden`}>
      {/* Header / toggle row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-900/40 transition-colors text-left"
      >
        <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Title + status */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-white text-sm truncate max-w-[200px] sm:max-w-none">{escrow.title}</span>
            <StatusBadge status={escrow.status} />
            <RoleBadge role={escrow.userRole} />
          </div>
          {/* Meta */}
          <div className="flex items-center gap-3 text-zinc-500 text-[11px] font-mono flex-wrap">
            <span>{shortAddr(escrow.contract_address)}</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-zinc-400 font-semibold font-sans">{escrow.total_xlm.toLocaleString()} XLM</span>
            <span className="hidden sm:inline">·</span>
            <span>{escrow.transactions.length} tx{escrow.transactions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="shrink-0 text-zinc-500">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-800/60 px-5 py-5 space-y-6">

              {/* Parties panel */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Left: parties */}
                <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Participants</h4>
                  <PartyRow label="Client"     party={escrow.parties.client}     labelColor="text-blue-400" />
                  <PartyRow label="Freelancer" party={escrow.parties.freelancer} labelColor="text-purple-400" />
                  {escrow.parties.arbiter && (
                    <PartyRow label="Arbiter" party={escrow.parties.arbiter} labelColor="text-amber-400" />
                  )}
                </div>

                {/* Right: contract + milestones summary */}
                <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4 space-y-3">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Contract</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-zinc-400 truncate">{escrow.contract_address}</span>
                      <CopyBtn text={escrow.contract_address} />
                      <a href={`https://stellar.expert/explorer/testnet/contract/${escrow.contract_address}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors shrink-0">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Milestones</h4>
                    <div className="space-y-1.5">
                      {escrow.milestones.map((m) => {
                        const mStatus = STATUS_CONFIG[m.status] ?? STATUS_CONFIG['Initialized'];
                        return (
                          <div key={m.index} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400 truncate">{m.index + 1}. {m.title}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-zinc-500">{m.amount_xlm} XLM</span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${mStatus.color} ${mStatus.bg} ${mStatus.border}`}>{m.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction table */}
              {escrow.transactions.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 text-sm">No transactions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800/60 bg-zinc-900/50">
                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">Time</th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">Action</th>
                        <th className="text-right py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">Amount</th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">Tx Hash</th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">Explorer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escrow.transactions.map((tx) => (
                        <TxRow key={tx.id} tx={tx} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Summary Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, iconColor }: { icon: React.ElementType; label: string; value: string | number; iconColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-black text-white tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">{label}</div>
      </div>
    </motion.div>
  );
}

/* ─── Export CSV ─────────────────────────────────────────────────── */
function exportCSV(escrows: EscrowRecord[]) {
  const rows: string[] = [
    ['Date', 'Escrow Name', 'Escrow ID', 'Your Role', 'Action', 'Milestone', 'Amount XLM', 'Tx Hash', 'Stellar Expert URL'].join(','),
  ];
  for (const e of escrows) {
    for (const tx of e.transactions) {
      rows.push([
        new Date(tx.timestamp).toISOString(),
        `"${e.title}"`,
        e.id,
        e.userRole,
        tx.event_name,
        tx.milestone_title ? `"${tx.milestone_title}"` : '',
        tx.amount_xlm ?? '',
        tx.tx_hash,
        tx.tx_hash && tx.tx_hash !== 'off-chain-init'
          ? `https://stellar.expert/explorer/testnet/tx/${tx.tx_hash}`
          : '',
      ].join(','));
    }
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `safesplit-history-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Action Type Filter Options ─────────────────────────────────── */
const ACTION_FILTERS = ['All', 'Funded', 'Released', 'Submitted', 'Disputed', 'Cancelled', 'Created'] as const;
type ActionFilter = typeof ACTION_FILTERS[number];

const ACTION_FILTER_MAP: Record<Exclude<ActionFilter, 'All'>, string[]> = {
  Funded:    ['EscrowFunded', 'EscrowInitializedOnChain'],
  Released:  ['MilestoneApproved', 'SettlementAccepted', 'EscrowCompleted'],
  Submitted: ['WorkSubmitted'],
  Disputed:  ['DisputeRaised', 'ArbiterResolution', 'DisputeResolved'],
  Cancelled: ['EscrowCancelled'],
  Created:   ['EscrowCreated'],
};

const ROLE_FILTERS = ['All', 'Client', 'Freelancer', 'Arbiter'] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const DATE_FILTERS = ['All Time', 'Last 7 Days', 'Last 30 Days'] as const;
type DateFilter = typeof DATE_FILTERS[number];

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function HistoryPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [data, setData] = useState<{ escrows: EscrowRecord[]; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('All');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All Time');

  useEffect(() => { setMounted(true); }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (connected?.isConnected) {
        const result = await getAddress();
        if (result?.address) setWallet(result.address);
      }
    } catch { /* not connected */ }
  }, []);

  const fetchHistory = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history?wallet=${encodeURIComponent(addr)}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (wallet) fetchHistory(wallet);
  }, [wallet, fetchHistory]);

  // Apply filters
  const filteredEscrows = useMemo(() => {
    if (!data) return [];
    return data.escrows.filter((e) => {
      // Role filter
      if (roleFilter !== 'All' && e.userRole !== roleFilter.toLowerCase()) return false;

      // Date filter
      if (dateFilter !== 'All Time') {
        const cutoff = dateFilter === 'Last 7 Days'
          ? Date.now() - 7 * 86400000
          : Date.now() - 30 * 86400000;
        // Keep if any tx in range, or if escrow itself is recent
        const hasRecentTx = e.transactions.some(tx => new Date(tx.timestamp).getTime() > cutoff);
        if (!hasRecentTx) return false;
      }

      // Action filter — filter out transactions that don't match, still show escrow if it has matching txs
      if (actionFilter !== 'All') {
        const matchingEvents = ACTION_FILTER_MAP[actionFilter];
        const hasTx = e.transactions.some(tx => matchingEvents.includes(tx.event_name));
        if (!hasTx) return false;
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        const inTitle = e.title.toLowerCase().includes(q);
        const inContract = e.contract_address.toLowerCase().includes(q);
        const inTx = e.transactions.some(tx =>
          tx.tx_hash.toLowerCase().includes(q) ||
          tx.event_name.toLowerCase().includes(q) ||
          (tx.milestone_title?.toLowerCase().includes(q))
        );
        const inParty = e.parties.client.name.toLowerCase().includes(q) ||
          e.parties.freelancer.name.toLowerCase().includes(q) ||
          (e.parties.arbiter?.name.toLowerCase().includes(q));
        if (!inTitle && !inContract && !inTx && !inParty) return false;
      }

      return true;
    }).map((e) => {
      // Also filter transactions within each escrow by action
      if (actionFilter === 'All') return e;
      const matchingEvents = ACTION_FILTER_MAP[actionFilter];
      return { ...e, transactions: e.transactions.filter(tx => matchingEvents.includes(tx.event_name)) };
    });
  }, [data, search, actionFilter, roleFilter, dateFilter]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-purple-800/10 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-800/10 blur-[120px]" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span className="text-zinc-800">·</span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white text-sm">Transaction History</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wallet && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <Wallet className="w-3 h-3" />
                {shortAddr(wallet)}
              </span>
            )}
            <button
              onClick={() => wallet && fetchHistory(wallet)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {data && data.escrows.length > 0 && (
              <button
                onClick={() => exportCSV(data.escrows)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── No wallet ── */}
        {!wallet && !loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-zinc-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect your wallet</h2>
              <p className="text-zinc-500 max-w-sm">Connect your Freighter wallet on the dashboard to view your transaction history.</p>
            </div>
            <Link href="/dashboard">
              <button className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all">
                Go to Dashboard
              </button>
            </Link>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-zinc-500 text-sm">Fetching your transactions...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <div className="text-center">
              <h3 className="text-white font-bold mb-1">Failed to load history</h3>
              <p className="text-zinc-500 text-sm">{error}</p>
            </div>
            <button onClick={() => wallet && fetchHistory(wallet)} className="px-6 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-sm font-semibold">
              Try Again
            </button>
          </div>
        )}

        {/* ── Data ── */}
        {!loading && !error && data && wallet && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={BarChart3} label="Total Escrows"   value={data.summary.totalEscrows}   iconColor="text-purple-400" />
              <StatCard icon={Zap}       label="Total Volume"    value={`${data.summary.totalVolume.toLocaleString()} XLM`} iconColor="text-emerald-400" />
              <StatCard icon={Activity}  label="Transactions"    value={data.summary.totalTransactions} iconColor="text-blue-400" />
              <StatCard icon={CheckCircle2} label="Completed"    value={data.summary.completedEscrows} iconColor="text-teal-400" />
            </div>

            {/* Filter bar */}
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search escrow name, tx hash, party name..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>

              {/* Filter pills row */}
              <div className="flex flex-wrap gap-3">
                {/* Action */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Action:</span>
                  {ACTION_FILTERS.map(f => (
                    <button key={f} onClick={() => setActionFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${actionFilter === f ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
                      {f}
                    </button>
                  ))}
                </div>

                {/* Role */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Role:</span>
                  {ROLE_FILTERS.map(f => (
                    <button key={f} onClick={() => setRoleFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${roleFilter === f ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
                      {f}
                    </button>
                  ))}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Period:</span>
                  {DATE_FILTERS.map(f => (
                    <button key={f} onClick={() => setDateFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${dateFilter === f ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active filter summary */}
              {filteredEscrows.length !== data.escrows.length && (
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Showing <strong className="text-white">{filteredEscrows.length}</strong> of <strong className="text-white">{data.escrows.length}</strong> escrows
                  <button onClick={() => { setSearch(''); setActionFilter('All'); setRoleFilter('All'); setDateFilter('All Time'); }}
                    className="ml-2 text-purple-400 hover:text-purple-300 underline">
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Escrow list */}
            {filteredEscrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {data.escrows.length === 0 ? 'No transactions yet' : 'No results found'}
                  </h3>
                  <p className="text-zinc-500 text-sm max-w-sm">
                    {data.escrows.length === 0
                      ? 'Create your first escrow on the dashboard to get started.'
                      : 'Try adjusting your filters or search query.'}
                  </p>
                </div>
                {data.escrows.length === 0 ? (
                  <Link href="/dashboard">
                    <button className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm">
                      Create First Escrow
                    </button>
                  </Link>
                ) : (
                  <button onClick={() => { setSearch(''); setActionFilter('All'); setRoleFilter('All'); setDateFilter('All Time'); }}
                    className="px-6 py-2 rounded-full border border-zinc-800 hover:border-zinc-600 text-white text-sm font-semibold transition-all">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div className="space-y-3" initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}>
                {filteredEscrows.map((e) => (
                  <motion.div key={e.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <EscrowAccordion escrow={e} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
