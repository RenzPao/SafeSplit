'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Wallet, 
  Layers, 
  FilePlus, 
  Activity, 
  Compass, 
  CheckCircle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import MilestoneDetailView from '@/components/MilestoneDetailView';
import { createEscrowMetadata, fetchEscrowMetadata } from '@/lib/stellar/supabaseBackend';

// Freighter Wallet API
import { isConnected, getAddress } from '@stellar/freighter-api';

interface Milestone {
  id: string;
  milestone_index: number;
  title: string;
  description: string;
  amount_xlm: number | string;
  status: string;
  deliverable_url?: string | null;
  submission_cid?: string | null;
}

interface ActivityLog {
  id: string;
  tx_hash: string;
  event_name: string;
  timestamp: string;
  details?: string | null;
}

interface Escrow {
  id: string;
  contract_address: string;
  client_address: string;
  freelancer_address: string;
  arbiter_address: string;
  total_xlm: number | string;
  status: string;
  milestones: Milestone[];
  activity_logs?: ActivityLog[];
}

export default function Home() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'manage' | 'create'>('manage');
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Manage Escrow states
  const [searchAddress, setSearchAddress] = useState('');
  const [loadedEscrow, setLoadedEscrow] = useState<Escrow | null>(null);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentEscrows, setRecentEscrows] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safesplit_recent_escrows');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  // Create Escrow form states
  const [formContractAddress, setFormContractAddress] = useState('');
  const [formClientAddress, setFormClientAddress] = useState('');
  const [formFreelancerAddress, setFormFreelancerAddress] = useState('');
  const [formArbiterAddress, setFormArbiterAddress] = useState('');
  const [formArbiterFeeBps, setFormArbiterFeeBps] = useState(500); // 5.0%
  const [formMilestones, setFormMilestones] = useState<{ title: string; description: string; amountXlm: number }[]>([
    { title: 'Initial Draft & Wireframes', description: 'Complete UI/UX design mockups and wireframes', amountXlm: 20 },
    { title: 'Core Frontend & Integration', description: 'Complete Next.js implementation with Soroban integration', amountXlm: 40 },
    { title: 'Testing & Production Deploy', description: 'Successful smart contract testing and live net deploy', amountXlm: 40 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationResult, setCreationResult] = useState<{
    escrow: Escrow;
    descriptionHashes: { index: number; descriptionHash: string }[];
  } | null>(null);

  // Check Freighter connection on load
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connectedRes = await isConnected();
        if (connectedRes && connectedRes.isConnected) {
          const addressRes = await getAddress();
          if (addressRes && addressRes.address) {
            setWalletAddress(addressRes.address);
            setWalletConnected(true);
          }
        }
      } catch (err) {
        console.warn('Freighter wallet check failed:', err);
      }
    };
    checkFreighter();
  }, []);

  const connectFreighterWallet = async () => {
    try {
      const connectedRes = await isConnected();
      if (!connectedRes || !connectedRes.isConnected) {
        alert('Freighter wallet extension not detected. Please install it or use the mock role selector.');
        return;
      }
      const addressRes = await getAddress();
      if (addressRes && addressRes.address) {
        setWalletAddress(addressRes.address);
        setWalletConnected(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Connection failed: ${message}`);
    }
  };

  // Add a contract address to recent local storage list
  const addRecentEscrow = (address: string) => {
    if (!address) return;
    const updated = [address, ...recentEscrows.filter(a => a !== address)].slice(0, 5);
    setRecentEscrows(updated);
    localStorage.setItem('safesplit_recent_escrows', JSON.stringify(updated));
  };

  // Fetch Escrow
  const handleLoadEscrow = async (addressToLoad?: string) => {
    const targetAddress = addressToLoad || searchAddress;
    if (!targetAddress) {
      setErrorMsg('Please enter or select a contract address');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchEscrowMetadata(targetAddress);
      setLoadedEscrow(data.escrow);
      setSelectedMilestoneIndex(0);
      addRecentEscrow(targetAddress);
      if (!addressToLoad) {
        setSearchAddress('');
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Error occurred while loading escrow';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Escrow Form functions
  const handleAddMilestone = () => {
    setFormMilestones([...formMilestones, { title: '', description: '', amountXlm: 10 }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (formMilestones.length <= 1) return;
    setFormMilestones(formMilestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: 'title' | 'description' | 'amountXlm', value: string | number) => {
    const updated = [...formMilestones];
    if (field === 'amountXlm') {
      updated[index] = { ...updated[index], [field]: Number(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value as string };
    }
    setFormMilestones(updated);
  };

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContractAddress || !formClientAddress || !formFreelancerAddress || !formArbiterAddress) {
      alert('Please fill out all address fields');
      return;
    }

    setIsSubmitting(true);
    setCreationResult(null);
    
    const totalXlm = formMilestones.reduce((sum, m) => sum + m.amountXlm, 0);

    try {
      const data = await createEscrowMetadata({
        contractAddress: formContractAddress.trim(),
        clientAddress: formClientAddress.trim(),
        freelancerAddress: formFreelancerAddress.trim(),
        arbiterAddress: formArbiterAddress.trim(),
        totalXlm,
        milestones: formMilestones
      });

      setCreationResult({
        escrow: data.escrow,
        descriptionHashes: data.descriptionHashes
      });

      // Add to recents
      addRecentEscrow(formContractAddress.trim());

      // Reset form
      setFormContractAddress('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Creation failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate random mock contract and wallet addresses for testing
  const populateMockAddresses = () => {
    const randHex = (len: number) => {
      const chars = '0123456789abcdef';
      return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');
    };

    setFormContractAddress(`CC${randHex(54).toUpperCase()}`);
    setFormClientAddress(`GD${randHex(54).toUpperCase()}`);
    setFormFreelancerAddress(`GB${randHex(54).toUpperCase()}`);
    setFormArbiterAddress(`GA${randHex(54).toUpperCase()}`);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              S²
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">SafeSplit</span>
              <span className="text-[10px] uppercase font-semibold text-purple-400/80 tracking-wider ml-1 bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.5 rounded">Soroban</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Wallet Mock Selectors */}
            {loadedEscrow && (
              <div className="hidden md:flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1">
                <span className="text-[10px] text-zinc-500 font-medium px-2 uppercase">Mock Role:</span>
                <button
                  onClick={() => {
                    setWalletAddress(loadedEscrow.client_address);
                    setWalletConnected(true);
                  }}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
                    walletAddress === loadedEscrow.client_address ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Client
                </button>
                <button
                  onClick={() => {
                    setWalletAddress(loadedEscrow.freelancer_address);
                    setWalletConnected(true);
                  }}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
                    walletAddress === loadedEscrow.freelancer_address ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Freelancer
                </button>
                <button
                  onClick={() => {
                    setWalletAddress(loadedEscrow.arbiter_address);
                    setWalletConnected(true);
                  }}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
                    walletAddress === loadedEscrow.arbiter_address ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Arbiter
                </button>
              </div>
            )}

            {/* Wallet Address Input for flexible testing */}
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 h-10">
              <Wallet className="w-3.5 h-3.5 text-zinc-500 mr-2" />
              <input
                type="text"
                placeholder="Enter wallet / address..."
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  setWalletConnected(!!e.target.value);
                }}
                className="bg-transparent border-none text-xs text-zinc-200 w-28 md:w-48 focus:outline-none focus:ring-0"
              />
              {walletConnected && (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-2" />
              )}
            </div>

            <button
              onClick={connectFreighterWallet}
              className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-2"
            >
              Freighter
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Navigation Tabs and Search / Loader row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'manage' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Manage Escrows
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'create' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              Register Escrow
            </button>
          </div>

          {activeTab === 'manage' && (
            <div className="flex-1 max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Enter contract address to load..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadEscrow()}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-zinc-600"
                />
              </div>
              <button
                onClick={() => handleLoadEscrow()}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all border border-zinc-800 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Load'}
              </button>
            </div>
          )}
        </div>

        {/* Tab Content 1: MANAGE ESCROW */}
        {activeTab === 'manage' && (
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Recents escrows shortcut */}
            {!loadedEscrow && recentEscrows.length > 0 && (
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Recently Viewed Contracts</h3>
                <div className="flex flex-col gap-2">
                  {recentEscrows.map((addr) => (
                    <button
                      key={addr}
                      onClick={() => handleLoadEscrow(addr)}
                      className="flex items-center justify-between text-left p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/20 transition-all group"
                    >
                      <span className="text-xs font-mono text-zinc-300 truncate pr-4">{addr}</span>
                      <span className="text-[10px] font-semibold text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Load Escrow →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadedEscrow ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left: Escrow detail & Milestones list (Col 5) */}
                <div className="xl:col-span-5 space-y-6">
                  
                  {/* Escrow overview card */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Escrow contract</div>
                        <h2 className="text-sm font-mono text-zinc-200 mt-1 flex items-center gap-1.5">
                          {loadedEscrow.contract_address.substring(0, 8)}...{loadedEscrow.contract_address.slice(-8)}
                          <button
                            onClick={() => copyToClipboard(loadedEscrow.contract_address, 'contract')}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {copiedText === 'contract' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
                          {loadedEscrow.status}
                        </span>
                        <button
                          onClick={() => handleLoadEscrow(loadedEscrow.contract_address)}
                          disabled={isLoading}
                          className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-zinc-500 font-medium">Total Value</div>
                        <div className="text-lg font-bold text-zinc-200 mt-0.5">{loadedEscrow.total_xlm} XLM</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-medium">Milestones</div>
                        <div className="text-lg font-bold text-zinc-200 mt-0.5">{loadedEscrow.milestones.length} Stages</div>
                      </div>
                    </div>

                    {/* Participant addresses list */}
                    <div className="border-t border-zinc-900 pt-4 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/50">
                        <span className="text-zinc-500">Client:</span>
                        <span className="font-mono text-zinc-300 flex items-center gap-1">
                          {loadedEscrow.client_address.substring(0, 6)}...{loadedEscrow.client_address.slice(-6)}
                          <button
                            onClick={() => copyToClipboard(loadedEscrow.client_address, 'client')}
                            className="text-zinc-600 hover:text-zinc-400"
                          >
                            {copiedText === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/50">
                        <span className="text-zinc-500">Freelancer:</span>
                        <span className="font-mono text-zinc-300 flex items-center gap-1">
                          {loadedEscrow.freelancer_address.substring(0, 6)}...{loadedEscrow.freelancer_address.slice(-6)}
                          <button
                            onClick={() => copyToClipboard(loadedEscrow.freelancer_address, 'freelancer')}
                            className="text-zinc-600 hover:text-zinc-400"
                          >
                            {copiedText === 'freelancer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/50">
                        <span className="text-zinc-500">Arbiter:</span>
                        <span className="font-mono text-zinc-300 flex items-center gap-1">
                          {loadedEscrow.arbiter_address.substring(0, 6)}...{loadedEscrow.arbiter_address.slice(-6)}
                          <button
                            onClick={() => copyToClipboard(loadedEscrow.arbiter_address, 'arbiter')}
                            className="text-zinc-600 hover:text-zinc-400"
                          >
                            {copiedText === 'arbiter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones Navigation List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Contract Milestones</h3>
                    <div className="flex flex-col gap-2">
                      {loadedEscrow.milestones.map((m, index) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMilestoneIndex(index)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            selectedMilestoneIndex === index 
                              ? 'bg-purple-950/20 border-purple-800/80 shadow-md shadow-purple-900/5' 
                              : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400/80">Stage {index + 1}</div>
                            <div className="text-sm font-bold text-zinc-200 mt-0.5 truncate">{m.title}</div>
                            <div className="text-[11px] text-zinc-400 mt-1 font-semibold">{m.amount_xlm} XLM</div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'Approved' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                            m.status === 'Submitted' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                            m.status === 'Disputed' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                            m.status === 'Refunded' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {m.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Logs Section */}
                  {loadedEscrow.activity_logs && loadedEscrow.activity_logs.length > 0 && (
                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 space-y-4">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        Activity Logs
                      </h3>
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                        {loadedEscrow.activity_logs.map((log) => (
                          <div key={log.id} className="relative pl-4 border-l border-zinc-800 pb-1 text-xs">
                            <div className="absolute left-0 top-1.5 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <div className="flex items-center justify-between text-[10px] text-zinc-500">
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                              {log.tx_hash !== 'off-chain-init' && (
                                <span className="font-mono text-zinc-600">
                                  tx: {log.tx_hash.substring(0, 6)}...
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-zinc-300 mt-0.5">{log.event_name}</div>
                            {log.details && (
                              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{log.details}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right: Milestone actions workspace (Col 7) */}
                <div className="xl:col-span-7">
                  <MilestoneDetailView
                    escrow={loadedEscrow}
                    milestoneIndex={selectedMilestoneIndex}
                    currentWalletAddress={walletAddress}
                    onActionSuccess={() => handleLoadEscrow(loadedEscrow.contract_address)}
                  />
                </div>

              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center">
                <Layers className="w-12 h-12 text-zinc-600 mb-3" />
                <h3 className="text-base font-bold text-zinc-300">No Escrow Contract Loaded</h3>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">Provide a Soroban escrow contract address in the lookup field above or select one from recently viewed list to inspect milestones and submit deliverables.</p>
              </div>
            )}

          </div>
        )}

        {/* Tab Content 2: REGISTER ESCROW */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto w-full space-y-8">
            
            {/* Explanatory notes */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6">
              <h2 className="text-base font-bold text-zinc-200">Register Escrow Contract Metadata</h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Before deploying or initializing the SafeSplit Soroban smart contract on-chain, register the escrow milestones, titles, descriptions, and budget breakdowns.
              </p>
              <div className="bg-purple-950/10 border border-purple-900/30 rounded-2xl p-4 mt-4 text-xs text-purple-300 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Why Register?</strong> In Soroban contracts, storing plain-text descriptions is extremely expensive in ledger fees. To optimize on-chain gas costs, SafeSplit hashes each milestone terms using SHA-256 off-chain, stores only the 32-byte hash on-chain, and uses the database to preserve the original metadata for UI viewing.
                </div>
              </div>
            </div>

            {/* Creation Form */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-xl">
              <form onSubmit={handleCreateEscrow} className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-sm font-bold text-zinc-200">Contract & Participant Parameters</h3>
                  <button
                    type="button"
                    onClick={populateMockAddresses}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-950/30 border border-purple-900/40 px-2.5 py-1 rounded-lg transition-all"
                  >
                    Simulate Testing Addresses
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs text-zinc-400 font-semibold">Stellar Contract Address (or ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. CDLZFC3SYJYDZT7K67VZ75HPJGWK3S..."
                      value={formContractAddress}
                      onChange={(e) => setFormContractAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Client Address (Funder)</label>
                    <input
                      type="text"
                      placeholder="e.g. GD..."
                      value={formClientAddress}
                      onChange={(e) => setFormClientAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Freelancer Address (Worker)</label>
                    <input
                      type="text"
                      placeholder="e.g. GB..."
                      value={formFreelancerAddress}
                      onChange={(e) => setFormFreelancerAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Arbiter Address (Mediator)</label>
                    <input
                      type="text"
                      placeholder="e.g. GA..."
                      value={formArbiterAddress}
                      onChange={(e) => setFormArbiterAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Arbiter Dispute Fee Basis Points (BPS)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500 = 5%"
                      value={formArbiterFeeBps}
                      onChange={(e) => setFormArbiterFeeBps(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors"
                      min="0"
                      max="2000"
                      required
                    />
                  </div>
                </div>

                {/* Milestone Details */}
                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Milestone Breakdown</h3>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all border border-zinc-800/60 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Milestone
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formMilestones.map((m, index) => (
                      <div key={index} className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3 relative">
                        {formMilestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(index)}
                            className="absolute right-3 top-3 p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-purple-400/80 uppercase">Milestone {index + 1}</span>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[11px] text-zinc-500 font-medium">Milestone Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Design mockup approval"
                              value={m.title}
                              onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-zinc-500 font-medium">Value (XLM)</label>
                            <input
                              type="number"
                              placeholder="e.g. 50"
                              value={m.amountXlm}
                              onChange={(e) => handleMilestoneChange(index, 'amountXlm', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors"
                              min="1"
                              required
                            />
                          </div>
                          <div className="md:col-span-4 space-y-1">
                            <label className="text-[11px] text-zinc-500 font-medium">Milestone Verification Description</label>
                            <textarea
                              placeholder="Describe deliverables and how the client or arbiter can verify completion..."
                              value={m.description}
                              onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors h-16 resize-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-right text-xs font-semibold text-zinc-400 bg-zinc-950/20 border border-zinc-900 rounded-xl p-3.5">
                    Total Escrow Value: <span className="text-purple-400 text-sm font-bold">{formMilestones.reduce((sum, m) => sum + m.amountXlm, 0)} XLM</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/10 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Register Escrow Metadata'}
                </button>

              </form>
            </div>

            {/* Creation Result Modal / View */}
            {creationResult && (
              <div className="bg-zinc-900/60 border border-purple-500/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Escrow Registered Successfully!</h3>
                    <p className="text-xs text-zinc-500">Milestone metadata has been securely hashed and stored off-chain.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">On-chain Initialization Parameters</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      You can now initialize the contract on-chain using Freighter or CLI, passing the following matching milestone description hashes in order:
                    </p>
                    <div className="space-y-2 mt-3 font-mono text-xs">
                      {creationResult.descriptionHashes.map((dh) => (
                        <div key={dh.index} className="flex flex-col md:flex-row md:items-center justify-between gap-1 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800/80">
                          <span className="text-purple-400 font-bold">Milestone {dh.index + 1}:</span>
                          <span className="text-zinc-300 break-all">{dh.descriptionHash}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setLoadedEscrow(creationResult.escrow);
                      setActiveTab('manage');
                      setCreationResult(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    Go to Manage Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-16 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2026 SafeSplit Protocol. Powered by Soroban & Stellar Net.</p>
        </div>
      </footer>

    </div>
  );
}
