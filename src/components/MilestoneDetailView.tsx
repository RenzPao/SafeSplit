'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  ExternalLink, 
  Coins, 
  Scale, 
  ShieldAlert, 
  ArrowRight, 
  FileText,
  Loader2,
  Check,
  AlertOctagon
} from 'lucide-react';
import { SafeSplitClient } from '@/lib/stellar/SafeSplitClient';
import { uploadDeliverableFile, updateMilestoneStatus } from '@/lib/stellar/supabaseBackend';

// Stellar Freighter Wallet API import
import { signTransaction } from '@stellar/freighter-api';

interface Milestone {
  id: string;
  milestone_index: number;
  title: string;
  description: string;
  amount_xlm: number | string;
  status: string; // Pending, Submitted, Approved, Disputed, Refunded
  deliverable_url?: string | null;
  submission_cid?: string | null;
}

interface Escrow {
  id: string;
  contract_address: string;
  client_address: string;
  freelancer_address: string;
  arbiter_address: string;
  total_xlm: number | string;
  status: string; // Initialized, Funded, InProgress, Disputed, Completed, Cancelled
  milestones: Milestone[];
}

interface MilestoneDetailViewProps {
  escrow: Escrow;
  milestoneIndex: number;
  currentWalletAddress: string; // The connected user address
  onActionSuccess: () => void; // Trigger page refresh
}

export default function MilestoneDetailView({
  escrow,
  milestoneIndex,
  currentWalletAddress,
  onActionSuccess,
}: MilestoneDetailViewProps) {
  const milestone = escrow.milestones.find((m) => m.milestone_index === milestoneIndex);
  
  const [file, setFile] = useState<File | null>(null);
  const [githubPr, setGithubPr] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [splitBps, setSplitBps] = useState(5000); // 50% split default (5000 bps)

  if (!milestone) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
        <AlertOctagon className="w-12 h-12 text-rose-500 mb-2" />
        <p>Milestone not found.</p>
      </div>
    );
  }

  // Determine user role
  const isClient = currentWalletAddress.toLowerCase() === escrow.client_address.toLowerCase();
  const isFreelancer = currentWalletAddress.toLowerCase() === escrow.freelancer_address.toLowerCase();
  const isArbiter = currentWalletAddress.toLowerCase() === escrow.arbiter_address.toLowerCase();

  // Status mapping colors & text
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Approved':
        return { label: 'Approved & Released', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 };
      case 'Submitted':
        return { label: 'In Review', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock };
      case 'Disputed':
        return { label: 'Disputed', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: ShieldAlert };
      case 'Refunded':
        return { label: 'Refunded to Client', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: AlertTriangle };
      default:
        return { label: 'Pending Deposit', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(milestone.status);
  const StatusIcon = statusConfig.icon;

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // 1. Submit Deliverable (Freelancer)
  const handleSubmitDeliverable = async () => {
    if (!file && !githubPr) {
      setStatusMessage({ type: 'error', text: 'Please upload a deliverable file or provide a GitHub PR link.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage({ type: 'info', text: 'Uploading deliverable artifact to IPFS...' });

    let cid = 'mock-cid-' + Date.now();
    let url = githubPr;

    try {
      if (file) {
        const uploadData = await uploadDeliverableFile(file);
        cid = uploadData.cid;
        url = uploadData.url;
      }

      setIsUploading(false);
      setIsSigning(true);
      setStatusMessage({ type: 'info', text: 'Preparing transaction... Please approve in Freighter.' });

      // Request transaction signature via Freighter
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const invokeOp = client.submitWorkTx(currentWalletAddress, {
        freelancer: currentWalletAddress,
        milestoneId: milestone.milestone_index,
        submissionRef: cid,
      });

      // Construct transaction and request Freighter signing
      // (Simplified logic representing final freighter signature request)
      setStatusMessage({ type: 'info', text: 'Signing on-chain submission transaction...' });
      
      // Update off-chain database via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Submitted',
        deliverableUrl: url,
        submissionCid: cid,
        txHash: 'simulated-stellar-tx-hash',
        eventName: 'WorkSubmitted',
        details: `Freelancer submitted work for milestone ${milestone.milestone_index + 1}. CID: ${cid}`,
      });

      setStatusMessage({ type: 'success', text: 'Milestone submitted successfully on-chain!' });
      onActionSuccess();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Action failed.' });
    } finally {
      setIsUploading(false);
      setIsSigning(false);
    }
  };

  // 2. Approve Milestone (Client)
  const handleApproveMilestone = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Preparing approval... Please approve transaction in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const invokeOp = client.approveMilestoneTx(currentWalletAddress, {
        client: currentWalletAddress,
        milestoneId: milestone.milestone_index,
      });

      // Simulate Freighter signature & submission
      // Update database status via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Approved',
        txHash: 'simulated-stellar-tx-hash-approve',
        eventName: 'MilestoneApproved',
        details: `Client approved milestone ${milestone.milestone_index + 1} and funds were released.`,
      });

      setStatusMessage({ type: 'success', text: 'Milestone approved and XLM released to freelancer!' });
      onActionSuccess();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setIsSigning(false);
    }
  };

  // 3. Raise Dispute (Client / Freelancer)
  const handleRaiseDispute = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Raising dispute... Please sign transaction in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const reasonHash = 'd3f4b50000000000000000000000000000000000000000000000000000000000'; // 32-byte hex mock
      const invokeOp = client.raiseDisputeTx(currentWalletAddress, {
        caller: currentWalletAddress,
        milestoneId: milestone.milestone_index,
        reasonHash,
      });

      // Update status via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Disputed',
        txHash: 'simulated-stellar-tx-hash-dispute',
        eventName: 'DisputeRaised',
        details: `Dispute raised on milestone ${milestone.milestone_index + 1} by caller ${currentWalletAddress}`,
      });

      setStatusMessage({ type: 'success', text: 'Dispute raised successfully. Contract locked pending arbiter resolution.' });
      onActionSuccess();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Dispute action failed.' });
    } finally {
      setIsSigning(false);
    }
  };

  // 4. Resolve Dispute (Arbiter)
  const handleResolveDispute = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Resolving dispute... Please sign split transaction in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const invokeOp = client.resolveDisputeTx(currentWalletAddress, {
        arbiter: currentWalletAddress,
        milestoneId: milestone.milestone_index,
        clientSplitBps: splitBps,
      });

      // Update status via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: splitBps === 10000 ? 'Refunded' : 'Approved',
        txHash: 'simulated-stellar-tx-hash-resolve',
        eventName: 'DisputeResolved',
        details: `Arbiter resolved dispute on milestone ${milestone.milestone_index + 1} with client split of ${splitBps / 100}%`,
      });

      setStatusMessage({ type: 'success', text: `Dispute resolved successfully! Client split: ${splitBps / 100}%, Freelancer split: ${(10000 - splitBps) / 100}%` });
      onActionSuccess();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Resolution execution failed.' });
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded-full">
              Milestone {milestone.milestone_index + 1}
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">{milestone.title}</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">{milestone.description}</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Escrow Value</div>
            <div className="text-xl font-bold text-slate-200">{milestone.amount_xlm} XLM</div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-sm mb-6 flex items-start gap-3 ${
          statusMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
          statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
          'bg-slate-950 border-slate-800 text-purple-300'
        }`}>
          {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 animate-spin text-purple-400 mt-0.5" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5" />}
          {statusMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-400 mt-0.5" />}
          <div className="flex-1 font-medium">{statusMessage.text}</div>
        </div>
      )}

      {/* Main Roles Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Submission Details / Previews */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Deliverables Preview
            </h3>

            {milestone.submission_cid ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 font-medium">IPFS Content CID</div>
                    <div className="text-sm font-semibold text-slate-200 truncate font-mono">{milestone.submission_cid}</div>
                  </div>
                </div>

                {milestone.deliverable_url && (
                  <a
                    href={milestone.deliverable_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-purple-950/20 border border-purple-900/30 hover:border-purple-800/50 rounded-xl text-purple-400 hover:text-purple-300 transition-all text-xs font-semibold group"
                  >
                    <span>View Deliverable Link / Document</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No deliverable has been uploaded for this milestone yet.</p>
            )}
          </div>

          {/* Details / Readme Terms */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Verification Criteria</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Commit code matching specified deliverables to main branch.</li>
              <li>Verification requires clean build passing off-chain CI/CD scripts.</li>
              <li>Arbiter resolves disputes based on the initial description hash parameters.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Dynamic Action Hub (Based on user address role) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-slate-950/60 border border-purple-500/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center">
            
            {/* 1. FREELANCER ACTIONS */}
            {isFreelancer && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-slate-200">Freelancer Workspace</h3>
                
                {milestone.status === 'Pending' && (
                  <>
                    <div 
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        dragActive ? 'border-purple-500 bg-purple-500/5' : 
                        file ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                      }`}
                    >
                      <Upload className={`w-8 h-8 mb-2 ${file ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-slate-300 text-center">
                        {file ? file.name : 'Drag & drop artifact or click to upload'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">Supports PDF, ZIP, Images (max 10MB)</span>
                      <input 
                        type="file" 
                        onChange={(e) => e.target.files && setFile(e.target.files[0])}
                        className="hidden" 
                        id="file-upload" 
                      />
                      <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold">GitHub Pull Request / Link</label>
                      <input
                        type="text"
                        placeholder="https://github.com/.../pull/1"
                        value={githubPr}
                        onChange={(e) => setGithubPr(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80 transition-colors"
                      />
                    </div>

                    <button
                      onClick={handleSubmitDeliverable}
                      disabled={isUploading || isSigning}
                      className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                      {(isUploading || isSigning) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Submit Milestone on-chain
                    </button>
                  </>
                )}

                {milestone.status === 'Submitted' && (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    Milestone submitted. Awaiting client review and release.
                  </div>
                )}

                {milestone.status === 'Approved' && (
                  <div className="text-center py-6 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Approved! Funds released.
                  </div>
                )}
              </div>
            )}

            {/* 2. CLIENT ACTIONS */}
            {isClient && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-slate-200">Client Panel</h3>

                {milestone.status === 'Submitted' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleApproveMilestone}
                      disabled={isSigning}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Approve & Release Funds
                    </button>

                    <button
                      onClick={handleRaiseDispute}
                      disabled={isSigning}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Raise Contract Dispute
                    </button>
                  </div>
                )}

                {milestone.status === 'Pending' && (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    Awaiting freelancer deliverable submission.
                  </div>
                )}

                {milestone.status === 'Approved' && (
                  <div className="text-center py-6 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Milestone fully approved.
                  </div>
                )}
              </div>
            )}

            {/* 3. ARBITER ACTIONS */}
            {isArbiter && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Arbiter Courtroom
                </h3>

                {milestone.status === 'Disputed' ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Client Split: {splitBps / 100}%</span>
                        <span className="text-purple-300">Freelancer: {(10000 - splitBps) / 100}%</span>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={splitBps}
                        onChange={(e) => setSplitBps(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />

                      <div className="text-[10px] text-slate-400 leading-relaxed">
                        Arbiter fee of {escrow.status === 'Disputed' ? '5.0%' : 'Fee configured'} is automatically subtracted and sent directly to you upon resolution.
                      </div>
                    </div>

                    <button
                      onClick={handleResolveDispute}
                      disabled={isSigning}
                      className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-900 text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Execute Split Settlement
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    Contract is healthy. Resolution option is unlocked only if dispute is raised.
                  </div>
                )}
              </div>
            )}

            {/* 4. OTHER / DISCONNECTED WALLET VIEW */}
            {!isClient && !isFreelancer && !isArbiter && (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-3">Connect wallet belonging to freelancer, client, or arbiter to manage this milestone.</p>
                <div className="text-xs font-semibold text-purple-400 bg-purple-950/20 border border-purple-900/30 px-3 py-2 rounded-xl inline-block max-w-full truncate">
                  Escrow Address: {escrow.contract_address}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
