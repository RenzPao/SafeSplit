'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FilePlus, 
  Wallet, 
  Zap, 
  ExternalLink, 
  ArrowRight, 
  Copy, 
  Check, 
  Command, 
  Layers, 
  X,
  Sparkles
} from 'lucide-react';
import { Escrow } from '../dashboard/types';
import { useToast } from '@/contexts/ToastContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  escrows: Escrow[];
  userWallet: string;
  onSelectEscrow: (escrowId: string) => void;
  onCreateNew: () => void;
  onFriendbotFund: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  escrows,
  userWallet,
  onSelectEscrow,
  onCreateNew,
  onFriendbotFund,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generate a randomized testnet keypair representation
  const handleGenerateTestKeypair = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let randAddr = 'G';
    for (let i = 0; i < 55; i++) {
      randAddr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    navigator.clipboard.writeText(randAddr);
    setCopiedKey(randAddr);
    toast.success('Simulated Keypair Generated', `Copied: ${randAddr.slice(0, 8)}...${randAddr.slice(-4)}`);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const filteredEscrows = escrows.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (e.title || '').toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.client_address.toLowerCase().includes(q) ||
      e.freelancer_address.toLowerCase().includes(q)
    );
  }).slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-[#0c0e17] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.25)] overflow-hidden z-10 flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-white/[0.08] px-4 py-3.5 bg-[#0e101c]">
              <Search className="w-4 h-4 text-purple-400 mr-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search escrows, actions, or simulate keypairs..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-500 font-sans"
                autoFocus
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Commands */}
            <div className="p-3 max-h-[420px] overflow-y-auto custom-scrollbar space-y-4">
              {/* Quick Protocol Actions */}
              <div>
                <div className="text-[10px] font-bold text-purple-400/80 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Protocol Quick Actions</span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onClose();
                      onCreateNew();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] hover:border-purple-500/30 border border-transparent text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <FilePlus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                          Create New Escrow Agreement
                        </div>
                        <div className="text-[10px] text-zinc-400">Launch the 4-step trustless milestone wizard</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">Enter ↵</span>
                  </button>

                  <button
                    onClick={handleGenerateTestKeypair}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] hover:border-cyan-500/30 border border-transparent text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          Simulate & Copy Testnet Keypair
                        </div>
                        <div className="text-[10px] text-zinc-400">Generates instant valid Stellar test address</div>
                      </div>
                    </div>
                    {copiedKey ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                    )}
                  </button>

                  {userWallet && (
                    <button
                      onClick={() => {
                        onClose();
                        onFriendbotFund();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] hover:border-amber-500/30 border border-transparent text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                          <Wallet className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                            Request 10,000 Testnet XLM (Friendbot)
                          </div>
                          <div className="text-[10px] text-zinc-400">Fund your active wallet with testnet tokens</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">Faucet ⚡</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Escrow Agreements Search Results */}
              {escrows.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    <span>Your Agreements ({filteredEscrows.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredEscrows.map((escrow) => (
                      <button
                        key={escrow.id}
                        onClick={() => {
                          onClose();
                          onSelectEscrow(escrow.id);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] hover:border-white/[0.1] border border-transparent text-left transition-all group"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                            {escrow.title || `Escrow #${escrow.id.slice(0, 8)}`}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span>ID: {escrow.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span className="text-purple-400 font-bold">{escrow.total_xlm} XLM</span>
                            <span>•</span>
                            <span className="text-zinc-500">{escrow.status}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Key Hints */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#0a0c14] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <div className="flex items-center gap-3">
                <span><kbd className="bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-300">Esc</kbd> to close</span>
                <span><kbd className="bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-300">↑↓</kbd> to navigate</span>
              </div>
              <div className="text-purple-400/80 font-sans">SafeSplit Protocol Spotlight</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
