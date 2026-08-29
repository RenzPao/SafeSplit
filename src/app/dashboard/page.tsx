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
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const { address, connectFreighter, disconnect, signTx, walletType } = useWallet();
  const { toast } = useToast();

  // Navigation & View Mode: 'overview' | 'workspace' | 'create'
  const [viewMode, setViewMode] = useState<'overview' | 'workspace' | 'create'>('overview');

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
      await fetch(`/api/escrows/${activeEscrow.id}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_hash: txHash, funder: address }),
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

      await fetch(`/api/escrows/${activeEscrow.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: address }),
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
    <div className="min-h-screen flex flex-col bg-[#08090a] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* ── Top Institutional Navbar ─────────────────────────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0d0f14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Protocol Badge */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <img src="/logo.svg" alt="SafeSplit Logo" className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-base tracking-tight text-zinc-100">SafeSplit</span>
            </a>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Soroban Testnet</span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-[#12141a] p-1 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => {
                setActiveEscrow(null);
                setViewMode('overview');
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'overview'
                  ? 'bg-white/[0.1] text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('create')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'create'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Escrow
            </button>
            <a
              href="/history"
              className="px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              History
            </a>
            <a
              href="/pitchdeck"
              className="px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Pitch Deck
            </a>
          </div>

          {/* Right: Wallet & Account Desk */}
          <div className="flex items-center gap-2.5">
            {address ? (
              <>
                {/* Unfunded warning button */}
                {walletFunded === false && (
                  <button
                    onClick={handleFriendbotFund}
                    disabled={isFunding}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
                  >
                    {isFunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>Fund 10k XLM</span>
                  </button>
                )}

                {/* Account Profile Trigger */}
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#12141a] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-zinc-200 transition-all group"
                >
                  <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {walletUser?.name ? walletUser.name.charAt(0).toUpperCase() : address.charAt(0)}
                  </div>
                  <span className="font-mono text-xs">{walletBalance} XLM</span>
                  <span className="text-zinc-600">|</span>
                  <span className="font-mono text-[11px] text-zinc-400 group-hover:text-zinc-200">
                    {address.slice(0, 4)}...{address.slice(-4)}
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={connectFreighter}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm"
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

        {/* ── VIEW MODE 1: OVERVIEW & PORTFOLIO ───────────────────────── */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Incoming Invitations Banner */}
            <PendingInvitations invitations={invitations} onSelectEscrow={handleSelectEscrow} />

            {/* Portfolio Summary Metrics */}
            <PortfolioMetrics escrows={escrows} userWallet={address || ''} walletBalance={walletBalance} />

            {/* Main Escrow Data Table */}
            <EscrowDataTable
              escrows={escrows}
              userWallet={address || ''}
              onSelectEscrow={handleSelectEscrow}
              onCreateNew={() => setViewMode('create')}
            />
          </div>
        )}

        {/* ── VIEW MODE 2: ACTIVE ESCROW WORKSPACE ────────────────────── */}
        {viewMode === 'workspace' && activeEscrow && (
          <div className="space-y-6">
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
              {/* Left Rail: Contract Summary & Action Drawer (3 cols) */}
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
          </div>
        )}

        {/* ── VIEW MODE 3: ESCROW CREATION STUDIO ─────────────────────── */}
        {viewMode === 'create' && (
          <div className="max-w-4xl mx-auto w-full space-y-6">
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
          </div>
        )}
      </main>

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
