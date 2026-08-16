'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  ExternalLink, 
  Coins,
  Scale,
  ShieldAlert,
  FileText,
  Settings,
  Loader2,
  Check,
  AlertOctagon
} from 'lucide-react';
import { SafeSplitClient } from '@/lib/stellar/SafeSplitClient';
import { buildAndSubmitSorobanTx } from '@/lib/stellar/sorobanTx';
import { uploadDeliverableFile, updateMilestoneStatus, updateEscrowStatus } from '@/lib/stellar/supabaseBackend';



import type { Escrow, Milestone, ActivityLog } from '@/app/page';



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
  const [wasmHash, setWasmHash] = useState('');
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
  const isArbiter = !!escrow.arbiter_address && currentWalletAddress.toLowerCase() === escrow.arbiter_address.toLowerCase();
  const isInitializedOnChain = escrow.activity_logs?.some(log => log.event_name === 'EscrowInitializedOnChain');

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
      const operation = client.submitWorkTx(currentWalletAddress, {
        freelancer: currentWalletAddress,
        milestoneId: milestone.milestone_index,
        submissionRef: cid,
      });

      // Construct transaction and request Freighter signing
      setStatusMessage({ type: 'info', text: 'Signing & submitting transaction to Testnet...' });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');
      
      // Update off-chain database via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Submitted',
        deliverableUrl: url,
        submissionCid: cid,
        txHash: txHash,
        eventName: 'WorkSubmitted',
        details: `Freelancer submitted work for milestone ${milestone.milestone_index + 1}. CID: ${cid}. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Milestone submitted successfully on-chain!' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Action failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsUploading(false);
      setIsSigning(false);
    }
  };

  // 2. Approve Milestone (Client)
  const handleApproveMilestone = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Preparing approval... Please sign transaction in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const operation = client.approveMilestoneTx(currentWalletAddress, {
        client: currentWalletAddress,
        milestoneId: milestone.milestone_index,
      });

      setStatusMessage({ type: 'info', text: 'Signing & submitting approval to Testnet...' });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Update database status via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Approved',
        txHash: txHash,
        eventName: 'MilestoneApproved',
        details: `Client approved milestone ${milestone.milestone_index + 1} and funds were released. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Milestone approved and XLM released to freelancer!' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Approval failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSigning(false);
    }
  };

  // Initialize Escrow (Client)
  const handleInitializeEscrow = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Preparing initialization... Please sign in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const milestonesWithHash = await Promise.all(escrow.milestones.map(async (m) => {
        const textToHash = `${m.title.trim()}:${m.description.trim()}:${m.amount_xlm}`;
        const msgBuffer = new TextEncoder().encode(textToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const descriptionHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return {
          id: m.milestone_index,
          descriptionHash,
          amountStroops: BigInt(Number(m.amount_xlm) * 10000000)
        };
      }));

      const operation = client.createEscrowTx(currentWalletAddress, {
        client: escrow.client_address,
        freelancer: escrow.freelancer_address,
        nativeToken: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', // Testnet native token
        milestones: milestonesWithHash
      });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Update database status via Supabase to record the init event
      await updateEscrowStatus(escrow.id, {
        status: 'Initialized', // Status stays Initialized, but we log the on-chain event
        txHash: txHash,
        eventName: 'EscrowInitializedOnChain',
        details: `Client initialized the escrow contract on-chain. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Escrow contract initialized successfully on-chain!' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Initialization failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSigning(false);
    }
  };

  // Fund Escrow (Client)
  const handleFundEscrow = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Preparing funding transaction... Please sign in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const operation = client.depositXlmTx(currentWalletAddress, escrow.client_address);
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Update database status via Supabase
      await updateEscrowStatus(escrow.id, {
        status: 'Funded',
        txHash: txHash,
        eventName: 'EscrowFunded',
        details: `Client funded the escrow with ${escrow.total_xlm} XLM on-chain. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Escrow contract funded successfully on-chain!' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Funding failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSigning(false);
    }
  };

  // Cancel Escrow & Refund (Client)
  const handleCancelEscrow = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Preparing cancellation transaction... Please sign in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const operation = client.cancelAndRefundTx(currentWalletAddress, escrow.client_address);
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Update database status via Supabase
      await updateEscrowStatus(escrow.id, {
        status: 'Cancelled',
        txHash: txHash,
        eventName: 'EscrowCancelled',
        details: `Client cancelled the escrow agreement and refunded all remaining funds. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Escrow cancelled and funds refunded to your wallet!' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Cancellation failed.';
      setStatusMessage({ type: 'error', text: message });
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
      const operation = client.raiseDisputeTx(currentWalletAddress, {
        caller: currentWalletAddress,
        milestoneId: milestone.milestone_index,
        reasonHash,
      });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Update status via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Disputed',
        txHash: txHash,
        eventName: 'DisputeRaised',
        details: `Dispute raised on milestone ${milestone.milestone_index + 1} by caller ${currentWalletAddress}. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Dispute raised successfully. Contract locked pending arbiter resolution.' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Dispute action failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSigning(false);
    }
  };

  // Find active settlement proposal from logs
  const getActiveProposal = () => {
    if (!escrow.activity_logs) return null;
    const sortedLogs = [...escrow.activity_logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    for (const log of sortedLogs) {
      if (log.event_name === 'SettlementAccepted' || log.event_name === 'ApproveMilestone' || log.event_name === 'DisputeResolved') {
        return null;
      }
      if (log.event_name === 'SettlementProposed' && log.details) {
        const match = log.details.match(/PROPOSAL:\s*proposer:([^\s]+)\s*split:(\d+)/i);
        if (match) {
          return {
            proposer: match[1],
            clientSplitBps: parseInt(match[2], 10),
          };
        }
      }
    }
    return null;
  };

  // 4. Propose Settlement Split (2-Party)
  const handleProposeSettlement = async () => {
    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Submitting split proposal... Please sign in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const operation = client.proposeSettlementTx(currentWalletAddress, {
        proposer: currentWalletAddress,
        milestoneId: milestone.milestone_index,
        clientSplitBps: splitBps,
      });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Update status via Supabase (keep in Disputed but log proposal)
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: 'Disputed',
        txHash: txHash,
        eventName: 'SettlementProposed',
        details: `PROPOSAL: proposer:${currentWalletAddress} split:${splitBps}`,
      });

      setStatusMessage({ type: 'success', text: `Proposal submitted successfully! Client split: ${splitBps / 100}%, Worker split: ${(10000 - splitBps) / 100}%. Awaiting acceptance.` });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Proposal submission failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSigning(false);
    }
  };

  // 5. Accept Settlement Split (2-Party)
  const handleAcceptSettlement = async () => {
    const activeProposal = getActiveProposal();
    if (!activeProposal) {
      setStatusMessage({ type: 'error', text: 'No active settlement proposal found to accept.' });
      return;
    }

    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Accepting split settlement... Please sign in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const operation = client.acceptSettlementTx(currentWalletAddress, {
        accepter: currentWalletAddress,
        milestoneId: milestone.milestone_index,
      });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      // Finalize status via Supabase
      await updateMilestoneStatus(escrow.id, milestone.milestone_index, {
        status: activeProposal.clientSplitBps === 10000 ? 'Refunded' : 'Approved',
        txHash: txHash,
        eventName: 'SettlementAccepted',
        details: `Settlement proposal accepted by ${currentWalletAddress}. Client split: ${activeProposal.clientSplitBps / 100}%, Worker split: ${(10000 - activeProposal.clientSplitBps) / 100}%. Tx: ${txHash}`,
      });

      setStatusMessage({ type: 'success', text: 'Settlement split finalized and funds successfully distributed!' });
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Accepting settlement failed.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSigning(false);
    }
  };

  const handleUpgradeContract = async () => {
    if (!wasmHash) return;

    setIsSigning(true);
    setStatusMessage({ type: 'info', text: 'Upgrading contract logic WASM... Please sign in Freighter.' });

    try {
      const client = new SafeSplitClient(escrow.contract_address, 'testnet');
      const operation = client.upgradeTx(currentWalletAddress, {
        newWasmHash: wasmHash.trim(),
      });
      const txHash = await buildAndSubmitSorobanTx(currentWalletAddress, operation, 'testnet');

      setStatusMessage({ type: 'success', text: `Contract logic successfully upgraded to WASM Hash: ${wasmHash.trim()}! Tx: ${txHash}` });
      setWasmHash('');
      onActionSuccess();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Contract upgrade failed.';
      setStatusMessage({ type: 'error', text: message });
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
                
                {escrow.status === 'Initialized' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>The Client has not funded this agreement yet. Do not start work or submit deliverables until the contract is funded.</span>
                  </div>
                )}

                {milestone.status === 'Pending' && escrow.status !== 'Initialized' && (
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

                {escrow.status === 'Initialized' ? (
                  <div className="space-y-3">
                    {!isInitializedOnChain ? (
                      <>
                        <div className="bg-blue-950/20 border border-blue-900/30 text-blue-300 rounded-2xl p-4 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <span>The contract metadata is stored in the database. Initialize it on-chain now.</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleInitializeEscrow}
                          disabled={isSigning}
                          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Initialize On-Chain
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="bg-purple-950/20 border border-purple-900/30 text-purple-300 rounded-2xl p-4 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                          <Coins className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                          <span>The contract is initialized but has no funds. Deposit {escrow.total_xlm} XLM on-chain to start the project.</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFundEscrow}
                          disabled={isSigning}
                          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                          {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Deposit & Fund Contract ({escrow.total_xlm} XLM)
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={handleCancelEscrow}
                      disabled={isSigning}
                      className="w-full py-2 px-4 rounded-xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Cancel Escrow & Refund
                    </button>
                  </div>
                ) : (
                  <>
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
                      <div className="space-y-3 text-center py-4">
                        <p className="text-slate-400 text-xs font-medium">Awaiting freelancer deliverable submission.</p>
                        <button
                          onClick={handleCancelEscrow}
                          disabled={isSigning}
                          className="w-full py-2 px-4 rounded-xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          Cancel Escrow & Refund
                        </button>
                      </div>
                    )}

                    {milestone.status === 'Approved' && (
                      <div className="text-center py-6 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Milestone fully approved.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {/* 3. DISPUTE NEGOTIATION (2-Party Propose/Accept Split) */}
            {(isClient || isFreelancer) && milestone.status === 'Disputed' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Dispute Negotiation Panel
                </h3>

                {(() => {
                  const activeProposal = getActiveProposal();
                  const currentAddressLower = currentWalletAddress.toLowerCase();

                  return (
                    <div className="space-y-4">
                      {activeProposal ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <span className="text-xs font-bold text-zinc-300 block">Pending Split Proposal</span>
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">Client Split: {activeProposal.clientSplitBps / 100}%</span>
                            <span className="text-purple-300">Worker Split: {(10000 - activeProposal.clientSplitBps) / 100}%</span>
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            Proposed by: <span className="font-mono text-zinc-300">{activeProposal.proposer.substring(0, 8)}...{activeProposal.proposer.slice(-4)}</span>
                          </p>

                          {activeProposal.proposer.toLowerCase() === currentAddressLower ? (
                            <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl font-semibold">
                              Waiting for the opposing party to accept your proposal.
                            </div>
                          ) : (
                            <button
                              onClick={handleAcceptSettlement}
                              disabled={isSigning}
                              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-100 text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                            >
                              {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              Accept Settlement Proposal
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <span className="text-xs font-bold text-zinc-300 block">Submit Split Proposal</span>
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            Propose a percentage split. If the other party accepts, the contract will execute and distribute the funds immediately.
                          </p>
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">Client: {splitBps / 100}%</span>
                            <span className="text-purple-300">Worker: {(10000 - splitBps) / 100}%</span>
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

                          <button
                            onClick={handleProposeSettlement}
                            disabled={isSigning}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Submit Settlement Proposal
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. OTHER / DISCONNECTED WALLET VIEW */}
            {!isClient && !isFreelancer && (
              <div className="text-center py-6 border-t border-slate-800/60 pt-6">
                <p className="text-xs text-slate-400 mb-3">Connect wallet belonging to freelancer or client to manage this milestone.</p>
                <div className="text-xs font-semibold text-purple-400 bg-purple-950/20 border border-purple-900/30 px-3 py-2 rounded-xl inline-block max-w-full truncate font-mono">
                  Escrow Address: {escrow.contract_address}
                </div>
              </div>
            )}

            {/* 5. Client Admin Settings - Upgrades */}
            {isClient && (
              <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                <div className="bg-purple-950/5 border border-purple-900/20 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    Contract Settings (Client Admin Only)
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                    Upgrade the smart contract WASM logic bytecode in-place. The contract address stays exactly the same, but all functions will use the updated logic binary.
                  </p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter 32-byte hex WASM Hash (64 characters)"
                      value={wasmHash}
                      onChange={(e) => setWasmHash(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80 font-mono transition-colors"
                    />
                    <button
                      onClick={handleUpgradeContract}
                      disabled={isSigning || !wasmHash}
                      className="py-2 px-5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Upgrade Contract
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
