'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  Upload, 
  ExternalLink, 
  GitPullRequest, 
  FileText, 
  Lock, 
  Send,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { Escrow, Milestone } from '../types';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import { useToast } from '@/contexts/ToastContext';
import { useWallet } from '@/contexts/WalletContext';
import { buildAndSubmitSorobanTx } from '@/lib/stellar/sorobanTx';
import { SafeSplitClient } from '@/lib/stellar/SafeSplitClient';
import { supabase } from '@/lib/supabaseClient';

interface MilestoneWorkspaceProps {
  escrow: Escrow;
  userWallet: string;
  onRefresh: () => void;
}

export default function MilestoneWorkspace({ escrow, userWallet, onRefresh }: MilestoneWorkspaceProps) {
  const { toast } = useToast();
  const { signTx } = useWallet();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deliverable Submission form state
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');

  // Dispute settlement state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [splitClientPct, setSplitClientPct] = useState(50);

  const activeMilestone = escrow.milestones?.[selectedIdx] || escrow.milestones?.[0];

  const isClient = escrow.client_address === userWallet;
  const isFreelancer = escrow.freelancer_address === userWallet;
  const isArbiter = escrow.arbiter_address === userWallet;

  // ── Handle Subtask Toggle ───────────────────────────────────────
  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('SubTask')
        .update({ is_completed: !currentStatus })
        .eq('id', subtaskId);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to update subtask', err.message);
    }
  };

  // ── Handle Deliverable Submission ────────────────────────────────
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim()) {
      toast.error('URL Required', 'Please provide a valid deliverable URL or GitHub PR.');
      return;
    }

    try {
      setIsSubmitting(true);
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || escrow.contract_address;
      const client = new SafeSplitClient(contractAddress, 'testnet');
      const cid = deliverableUrl.trim().slice(0, 32);
      const operation = client.submitWorkTx(userWallet, escrow.id, {
        freelancer: userWallet,
        milestoneId: selectedIdx,
        submissionRef: cid,
      });

      const txHash = await buildAndSubmitSorobanTx(signTx, userWallet, operation, 'testnet');

      const res = await fetch(`/api/escrows/${escrow.id}/milestones/${selectedIdx}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverable_url: deliverableUrl,
          notes: deliverableNotes,
          submitted_by: userWallet,
          tx_hash: txHash,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }

      toast.tx('Deliverable Submitted', txHash, 'Milestone moved to In Review for client approval.');
      setDeliverableUrl('');
      setDeliverableNotes('');
      onRefresh();
    } catch (err: any) {
      toast.error('Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Milestone Approval (On-Chain) ─────────────────────────
  const handleApproveMilestone = async () => {
    try {
      setIsSubmitting(true);
      toast.loading('Signing Approval Transaction', 'Please sign the transaction in your connected wallet...');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || escrow.contract_address;
      const client = new SafeSplitClient(contractAddress, 'testnet');
      const operation = client.approveMilestoneTx(userWallet, escrow.id, {
        client: userWallet,
        milestoneId: selectedIdx,
      });

      const txHash = await buildAndSubmitSorobanTx(signTx, userWallet, operation, 'testnet');

      // Log to Supabase backend
      await fetch(`/api/escrows/${escrow.id}/milestones/${selectedIdx}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_hash: txHash, approver: userWallet }),
      });

      toast.tx('Milestone Approved & Released', txHash, 'XLM funds have been transferred to the freelancer.');
      onRefresh();
    } catch (err: any) {
      toast.error('Approval Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Arbiter Dispute Resolution ────────────────────────────
  const handleResolveDispute = async () => {
    try {
      setIsSubmitting(true);
      toast.loading('Submitting Arbitration Ruling', 'Executing on-chain settlement split...');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || escrow.contract_address;
      const client = new SafeSplitClient(contractAddress, 'testnet');
      const clientSplitBps = splitClientPct * 100;
      const operation = client.proposeSettlementTx(userWallet, escrow.id, {
        proposer: userWallet,
        milestoneId: selectedIdx,
        clientSplitBps,
      });

      const txHash = await buildAndSubmitSorobanTx(signTx, userWallet, operation, 'testnet');

      const clientAmount = Math.round((Number(activeMilestone.amount_xlm) * splitClientPct) / 100);
      const freelancerAmount = Number(activeMilestone.amount_xlm) - clientAmount;

      await fetch(`/api/escrows/${escrow.id}/milestones/${selectedIdx}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_hash: txHash,
          client_amount: clientAmount,
          freelancer_amount: freelancerAmount,
        }),
      });

      toast.tx('Dispute Settled', txHash, 'Funds distributed according to the arbiter ruling.');
      setShowDisputeModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error('Arbitration Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeMilestone) {
    return (
      <div className="card-elevation p-8 rounded-xl text-center text-zinc-500 text-xs">
        No milestones configured for this agreement.
      </div>
    );
  }

  return (
    <div className="card-elevation rounded-xl overflow-hidden flex flex-col">
      {/* ── Milestone Step Navigation Strip ─────────────────────── */}
      <div className="flex border-b border-white/[0.08] bg-[#0d0f14] overflow-x-auto custom-scrollbar">
        {escrow.milestones.map((m, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={m.id || idx}
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center gap-2.5 py-3.5 px-5 border-b-2 font-medium text-xs whitespace-nowrap transition-all ${
                isSelected
                  ? 'border-purple-500 text-zinc-100 bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                isSelected ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {idx + 1}
              </div>
              <span>{m.title || `Milestone ${idx + 1}`}</span>
              <Badge status={m.status} size="sm" showIcon={false} />
            </button>
          );
        })}
      </div>

      {/* ── Active Milestone Details ────────────────────────────── */}
      <div className="p-6 space-y-6">
        {/* Milestone Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-zinc-100">
                {activeMilestone.title || `Milestone #${selectedIdx + 1}`}
              </h2>
              <Badge status={activeMilestone.status} size="md" />
            </div>
            {activeMilestone.description && (
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                {activeMilestone.description}
              </p>
            )}
          </div>

          <div className="sm:text-right bg-[#0d0f14] px-4 py-2 rounded-lg border border-white/[0.06]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Milestone Payout</div>
            <div className="text-lg font-bold font-mono text-zinc-100 tabular-nums">
              {Number(activeMilestone.amount_xlm).toLocaleString()} <span className="text-xs text-purple-400 font-semibold font-sans">XLM</span>
            </div>
          </div>
        </div>

        {/* Subtasks Checklist */}
        {activeMilestone.subtasks && activeMilestone.subtasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Sub-Tasks & Acceptance Criteria
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {activeMilestone.subtasks.filter((s) => s.is_completed).length} / {activeMilestone.subtasks.length} Completed
              </span>
            </div>

            <div className="space-y-2 bg-[#0d0f14] p-3 rounded-lg border border-white/[0.06]">
              {activeMilestone.subtasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => handleToggleSubtask(task.id, task.is_completed)}
                    className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500/20"
                  />
                  <span className={`text-xs leading-relaxed ${task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                    {task.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Deliverable Review / Live Preview Section */}
        {activeMilestone.deliverable_url && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Submitted Deliverable</span>
            </h3>

            <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono text-zinc-200 truncate">
                    {activeMilestone.deliverable_url}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Proof of work submission</div>
                </div>
              </div>

              <a
                href={activeMilestone.deliverable_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-purple-300 hover:text-white transition-colors shrink-0"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Primary Milestone Action Buttons */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          {/* Freelancer: Submit Deliverable Form */}
          {isFreelancer && (activeMilestone.status === 'Pending' || activeMilestone.status === 'InProgress') && (
            <form onSubmit={handleSubmitDeliverable} className="w-full space-y-3">
              <h4 className="text-xs font-semibold text-zinc-200">Submit Work for Client Approval</h4>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="GitHub PR, IPFS link, or Figma prototype URL..."
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  className="flex-1 bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Submit Work</span>
                </button>
              </div>
            </form>
          )}

          {/* Client: Review & Approve / Dispute */}
          {isClient && activeMilestone.status === 'Submitted' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleApproveMilestone}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Approve & Release {activeMilestone.amount_xlm} XLM</span>
              </button>

              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
              >
                Raise Dispute
              </button>
            </div>
          )}

          {/* Arbiter Settlement Drawer Trigger */}
          {isArbiter && activeMilestone.status === 'Disputed' && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Execute Arbiter Settlement</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Dispute & Arbitration Settlement Modal ──────────────── */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Arbitration Settlement Split</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              As the designated arbiter, allocate the milestone balance ({activeMilestone.amount_xlm} XLM) between the client and freelancer.
            </p>

            <div className="space-y-3 bg-[#0d0f14] p-4 rounded-xl border border-white/[0.06]">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-blue-300">Client: {splitClientPct}%</span>
                <span className="text-purple-300">Freelancer: {100 - splitClientPct}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={splitClientPct}
                onChange={(e) => setSplitClientPct(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />

              <div className="flex justify-between text-xs font-mono pt-1 text-zinc-400">
                <span>{Math.round((Number(activeMilestone.amount_xlm) * splitClientPct) / 100)} XLM</span>
                <span>{Number(activeMilestone.amount_xlm) - Math.round((Number(activeMilestone.amount_xlm) * splitClientPct) / 100)} XLM</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveDispute}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Execute On-Chain Ruling'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
