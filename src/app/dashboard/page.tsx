'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Wallet, 
  Layers, 
  FilePlus, 
  Activity, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Loader2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { Escrow, Milestone, ActivityLog, UserProfile } from '@/components/dashboard/types';
export type { Escrow, Milestone, ActivityLog, UserProfile };
import PortfolioMetrics from '@/components/dashboard/Overview/PortfolioMetrics';
import EscrowDataTable from '@/components/dashboard/Overview/EscrowDataTable';
import PendingInvitations from '@/components/dashboard/Overview/PendingInvitations';
import EscrowHeader from '@/components/dashboard/Workspace/EscrowHeader';
import ContractSummaryRail from '@/components/dashboard/Workspace/ContractSummaryRail';
import MilestoneWorkspace from '@/components/dashboard/Workspace/MilestoneWorkspace';
import SidebarTabs from '@/components/dashboard/Workspace/SidebarTabs';
import EscrowCreator from '@/components/dashboard/Creator/EscrowCreator';
import RegistrationModal from '@/components/RegistrationModal';
import ProfileDashboardModal from '@/components/ProfileDashboardModal';
import { buildAndSubmitSorobanTx } from '@/lib/stellar/sorobanTx';
import { SafeSplitClient } from '@/lib/stellar/SafeSplitClient';
import { updateEscrowStatus } from '@/lib/stellar/supabaseBackend';
import { supabase } from '@/lib/supabaseClient';
import CommandPalette from '@/components/ui/CommandPalette';
import PortfolioChart from '@/components/dashboard/Overview/PortfolioChart';
import CurrencyConverterWidget from '@/components/dashboard/Overview/CurrencyConverterWidget';
import NetworkDiagnosticsBar from '@/components/dashboard/NetworkDiagnosticsBar';
import NotificationDrawer from '@/components/dashboard/NotificationDrawer';
import HotkeyCheatsheetModal from '@/components/ui/HotkeyCheatsheetModal';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export default function DashboardPage() {
  const { address, connectFreighter, disconnect, signTx, walletType } = useWallet();
  const { toast } = useToast();

  // Navigation & View Mode: 'overview' | 'workspace' | 'create'
  const [viewMode, setViewMode] = useState<'overview' | 'workspace' | 'create'>('overview');

  // Command Palette & Modals State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showHotkeyModal, setShowHotkeyModal] = useState(false);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (e.key === '?' || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
        e.preventDefault();
        setShowHotkeyModal((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveEscrow(null);
        setViewMode('create');
      } else if (e.key === '1') {
        e.preventDefault();
        setActiveEscrow(null);
        setViewMode('overview');
      } else if (e.key === '2') {
        e.preventDefault();
        setActiveEscrow(null);
        setViewMode('create');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // User & Wallet State
  const [walletUser, setWalletUser] = useState<UserProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [walletFunded, setWalletFunded] = useState<boolean | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Escrows & Workspace State
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [invitations, setInvitations] = useState<Escrow[]>([]);
  const [activeEscrow, setActiveEscrow] = useState<Escrow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // ── Fetch User Profile & On-Chain Balance ─────────────────────────
  const fetchUserData = useCallback(async (wallet: string) => {
    try {
      // 1. Fetch Stellar Horizon Balance
      const horizRes = await fetch(`https://horizon-testnet.stellar.org/accounts/${wallet}`);
      if (horizRes.ok) {
        const hData = await horizRes.json();
        const native = hData.balances?.find((b: any) => b.asset_type === 'native');
        setWalletBalance(native ? parseFloat(native.balance).toFixed(2) : '0.00');
        setWalletFunded(true);
      } else if (horizRes.status === 404) {
        setWalletFunded(false);
        setWalletBalance('0.00');
      }
    } catch (err) {
      console.warn('Failed to fetch Horizon balance', err);
    }

    try {
      // 2. Fetch User Profile
      const profRes = await fetch(`/api/users/${encodeURIComponent(wallet)}`);
      const pData = await profRes.json();
      if (profRes.status === 404 || pData.error === 'User not found') {
        setShowRegistrationModal(true);
      } else if (profRes.ok && pData.user) {
        setWalletUser(pData.user);
        setShowRegistrationModal(false);
      }
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  }, []);

  // ── Fetch User Escrows ───────────────────────────────────────────
  const fetchEscrows = useCallback(async (wallet: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/escrows?user=${encodeURIComponent(wallet)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.escrows) {
          setEscrows(data.escrows);
        }
      }

      // Fetch invitations
      const invRes = await fetch(`/api/escrows/invitations?freelancer=${encodeURIComponent(wallet)}`);
      if (invRes.ok) {
        const invData = await invRes.json();
        if (invData.success && invData.invitations) {
          setInvitations(invData.invitations);
        }
      }
    } catch (err) {
      console.error('Failed to fetch escrows', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Load Single Escrow Detail for Workspace ──────────────────────
  const handleSelectEscrow = async (escrowId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/escrows/${encodeURIComponent(escrowId)}`);
      if (!res.ok) throw new Error('Escrow not found');
      const data = await res.json();
      if (data.success && data.escrow) {
        setActiveEscrow(data.escrow);
        setViewMode('workspace');
      }
    } catch (err: any) {
      toast.error('Failed to load agreement', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fund Testnet Friendbot ───────────────────────────────────────
  const handleFriendbotFund = async () => {
    if (!address) return;
    try {
      setIsFunding(true);
      toast.loading('Requesting Testnet XLM', 'Calling Stellar Friendbot faucet...');
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
      if (res.ok) {
        toast.success('Wallet Funded!', 'Received 10,000 Testnet XLM.');
        setWalletFunded(true);
        fetchUserData(address);
      } else {
        throw new Error('Friendbot returned an error');
      }
    } catch (err: any) {
      toast.error('Faucet Request Failed', err.message);
    } finally {
      setIsFunding(false);
    }
  };

  // ── Deposit Total Escrow Funds (On-Chain) ─────────────────────────
  const handleDepositFunds = async () => {
    if (!activeEscrow || !address) return;
    try {
      setIsActionLoading(true);
      toast.loading('Depositing Escrow Balance', 'Please sign the deposit transaction in your wallet...');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || activeEscrow.contract_address;
      const client = new SafeSplitClient(contractAddress, 'testnet');
      const operation = client.depositXlmTx(address, activeEscrow.id, address);

      const txHash = await buildAndSubmitSorobanTx(
        signTx,
        address,
        operation,
        'testnet'
      );

      // Update backend status to Funded
      await updateEscrowStatus(activeEscrow.id, {
        status: 'Funded',
        txHash,
        eventName: 'EscrowFunded',
        details: `${activeEscrow.total_xlm} XLM deposited by client ${address}`,
      });

      toast.tx('Escrow Funded Successfully', txHash, `${activeEscrow.total_xlm} XLM locked in Soroban smart contract.`);
      handleSelectEscrow(activeEscrow.id);
    } catch (err: any) {
      toast.error('Funding Failed', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ── Finalize Escrow ──────────────────────────────────────────────
  const handleFinalizeEscrow = async () => {
    if (!activeEscrow || !address) return;
    try {
      setIsActionLoading(true);
      toast.loading('Finalizing Agreement', 'Closing escrow and settling accounts...');

      await updateEscrowStatus(activeEscrow.id, {
        status: 'Completed',
        txHash: 'off-chain-finalize',
        eventName: 'EscrowFinalized',
        details: `Agreement finalized and completed by ${address}`,
      });

      toast.success('Escrow Completed', 'Agreement has been settled and archived.');
      handleSelectEscrow(activeEscrow.id);
    } catch (err: any) {
      toast.error('Finalization Failed', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sync on address change
  useEffect(() => {
    if (address) {
      fetchUserData(address);
      fetchEscrows(address);
    } else {
      setWalletUser(null);
      setWalletBalance('0.00');
      setWalletFunded(null);
      setEscrows([]);
      setActiveEscrow(null);
      setViewMode('overview');
    }
  }, [address, fetchUserData, fetchEscrows]);

  return (
    <div className="min-h-screen flex flex-col bg-[#07080d] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200 relative overflow-hidden">
      {/* ── Ambient Background Cosmic Lighting & Tactical Mesh ───── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-60 right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute inset-0 ambient-mesh opacity-50 pointer-events-none -z-10" />

      {/* ── Institutional Top Bar & Financial Header ───────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0b0d16]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <img src="/logo.svg" alt="SafeSplit Logo" className="w-7 h-7 group-hover:scale-105 transition-transform" />
              </div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                SafeSplit
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">v2</span>
              </span>
            </a>
          </div>

          {/* Center Navigation & Search Trigger */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0d0f18]/90 p-1 rounded-xl border border-white/[0.08] shadow-inner">
              <button
                onClick={() => {
                  setActiveEscrow(null);
                  setViewMode('overview');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'overview'
                    ? 'bg-white/[0.12] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('create')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Create Escrow
              </button>
              <a
                href="/history"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-purple-300 transition-colors"
              >
                History
              </a>
              <a
                href="/pitchdeck"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-purple-300 transition-colors"
              >
                Pitch Deck
              </a>
            </div>

            {/* Quick Command Palette Spotlight Trigger */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d0f18] hover:bg-[#141724] border border-white/[0.08] hover:border-purple-500/40 text-xs text-zinc-400 hover:text-zinc-200 transition-all shadow-sm group"
              title="Open Command Palette (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-purple-400 group-hover:scale-105 transition-transform" />
              <span className="text-[11px] font-sans">Quick Jump</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Wallet, Notifications & Account Desk */}
          <div className="flex items-center gap-2.5">
            {/* Notification Center Trigger */}
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-2 rounded-xl bg-[#0d0f18] hover:bg-[#141724] border border-white/[0.08] hover:border-purple-500/40 text-zinc-400 hover:text-white transition-all shadow-sm group"
              title="Open Notification Center"
            >
              <Bell className="w-4 h-4 text-purple-400 group-hover:scale-105 transition-transform" />
              {escrows.some(e => (e.client_address === address && e.status === 'Initialized') || (e.client_address === address && e.milestones?.some(m => m.status === 'Submitted'))) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse" />
              )}
            </button>

            {/* Hotkey Help Button */}
            <button
              onClick={() => setShowHotkeyModal(true)}
              className="hidden sm:flex p-2 rounded-xl bg-[#0d0f18] hover:bg-[#141724] border border-white/[0.08] hover:border-purple-500/40 text-zinc-400 hover:text-white transition-all shadow-sm"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-purple-300" />
            </button>

            {address ? (
              <>
                {/* Unfunded warning button */}
                {walletFunded === false && (
                  <button
                    onClick={handleFriendbotFund}
                    disabled={isFunding}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    {isFunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>Fund 10k XLM</span>
                  </button>
                )}

                {/* Account Profile Trigger */}
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0f1118] border border-white/[0.08] hover:border-purple-500/40 text-xs font-medium text-zinc-200 transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                >
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(147,51,234,0.5)]">
                    {walletUser?.name ? walletUser.name.charAt(0).toUpperCase() : address.charAt(0)}
                  </div>
                  <span className="font-mono text-xs text-white font-semibold tabular-nums">{walletBalance} XLM</span>
                  <span className="text-zinc-600">|</span>
                  <span className="font-mono text-[11px] text-zinc-400 group-hover:text-purple-300">
                    {address.slice(0, 4)}...{address.slice(-4)}
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={connectFreighter}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(147,51,234,0.35)]"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Workspace Body ──────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Unfunded Wallet Alert Strip */}
        {address && walletFunded === false && (
          <div className="card-elevation p-4 rounded-xl border-amber-500/30 bg-amber-500/[0.03] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100">Account Not Funded on Testnet</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Your address <span className="font-mono text-zinc-300 font-semibold">{address.slice(0, 8)}...{address.slice(-6)}</span> has no XLM balance. Fund it with 10,000 Testnet XLM to execute smart contracts.
                </p>
              </div>
            </div>

            <button
              onClick={handleFriendbotFund}
              disabled={isFunding}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              {isFunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Fund Account (Friendbot)</span>
            </button>
          </div>
        )}

        {/* ── Fluid AnimatePresence View Mode Switches ────────────────── */}
        <AnimatePresence mode="wait">
          {/* VIEW MODE 1: OVERVIEW & PORTFOLIO */}
          {viewMode === 'overview' && (
            <motion.div
              key="overview-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Incoming Invitations Banner */}
              <PendingInvitations invitations={invitations} onSelectEscrow={handleSelectEscrow} />

              {/* Portfolio Summary Metrics */}
              <PortfolioMetrics escrows={escrows} userWallet={address || ''} walletBalance={walletBalance} />

              {/* 2-Column Analytics & Financial Valuation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <PortfolioChart escrows={escrows} />
                </div>
                <div className="lg:col-span-5">
                  <CurrencyConverterWidget />
                </div>
              </div>

              {/* Main Escrow Data Table */}
              <EscrowDataTable
                escrows={escrows}
                userWallet={address || ''}
                onSelectEscrow={handleSelectEscrow}
                onCreateNew={() => setViewMode('create')}
              />
            </motion.div>
          )}

          {/* VIEW MODE 2: ACTIVE ESCROW WORKSPACE */}
          {viewMode === 'workspace' && activeEscrow && (
            <motion.div
              key="workspace-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Top Workspace Context Header */}
              <EscrowHeader
                escrow={activeEscrow}
                userWallet={address || ''}
                onBack={() => {
                  setActiveEscrow(null);
                  setViewMode('overview');
                  if (address) fetchEscrows(address);
                }}
              />

              {/* 3-Column Deal Desk Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Rail: Contract Summary & Action Drawer (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <ContractSummaryRail
                    escrow={activeEscrow}
                    userWallet={address || ''}
                    onDepositFunds={handleDepositFunds}
                    onFinalizeEscrow={handleFinalizeEscrow}
                    isActionLoading={isActionLoading}
                  />
                </div>

                {/* Center Canvas: Milestones, Subtasks & Deliverables (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <MilestoneWorkspace
                    escrow={activeEscrow}
                    userWallet={address || ''}
                    onRefresh={() => handleSelectEscrow(activeEscrow.id)}
                  />
                </div>

                {/* Right Rail: Realtime Chat & On-Chain Audit Feed (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  <SidebarTabs escrow={activeEscrow} userWallet={address || ''} />
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW MODE 3: ESCROW CREATION STUDIO */}
          {viewMode === 'create' && (
            <motion.div
              key="create-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-4xl mx-auto w-full space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-zinc-100">Create Escrow Agreement</h1>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configure trustless milestone terms, budget distribution, and on-chain arbitration rules.
                  </p>
                </div>

                <button
                  onClick={() => setViewMode('overview')}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Back to Portfolio
                </button>
              </div>

              <EscrowCreator
                userWallet={address || ''}
                onCreated={(newId) => {
                  if (address) fetchEscrows(address);
                  handleSelectEscrow(newId);
                }}
                onCancel={() => setViewMode('overview')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Real-Time Stellar Horizon Diagnostics Bar ────────────── */}
        <div className="mt-2">
          <NetworkDiagnosticsBar />
        </div>
      </main>

      {/* ── Global Command Palette (Cmd+K) ─────────────────────────── */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        escrows={escrows}
        userWallet={address || ''}
        onSelectEscrow={handleSelectEscrow}
        onCreateNew={() => {
          setActiveEscrow(null);
          setViewMode('create');
        }}
        onFriendbotFund={handleFriendbotFund}
      />

      {/* ── Realtime Notification Drawer ───────────────────────────── */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        escrows={escrows}
        userWallet={address || ''}
        onSelectEscrow={handleSelectEscrow}
      />

      {/* ── Keyboard Shortcuts Cheatsheet Modal ─────────────────────── */}
      <HotkeyCheatsheetModal
        isOpen={showHotkeyModal}
        onClose={() => setShowHotkeyModal(false)}
      />

      {/* ── Modals & Drawers ────────────────────────────────────────── */}
      {showRegistrationModal && (
        <RegistrationModal
          walletAddress={address || ''}
          onSuccess={() => {
            setShowRegistrationModal(false);
            if (address) fetchUserData(address);
          }}
        />
      )}

      {showProfileModal && walletUser && (
        <ProfileDashboardModal
          user={walletUser}
          balance={walletBalance}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
