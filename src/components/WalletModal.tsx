"use client";

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { X } from 'lucide-react';
import Image from 'next/image';

export default function WalletModal() {
  const { showWalletModal, setShowWalletModal, connectFreighter, connectWalletConnect } = useWallet();

  if (!showWalletModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowWalletModal(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button 
            onClick={() => setShowWalletModal(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={connectFreighter}
            className="w-full group relative flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-zinc-700 shadow-sm">
                {/* Fallback Freighter text logo if actual img is missing */}
                <span className="text-black font-black text-xl italic leading-none pr-0.5">F</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-zinc-100 group-hover:text-white">Freighter</div>
                <div className="text-xs text-zinc-500">Stellar browser extension</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/100 transition-colors shadow-[0_0_8px_rgba(16,185,129,0)] group-hover:shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </button>

          <button
            onClick={connectWalletConnect}
            className="w-full group relative flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                {/* Simple WC logo via SVG */}
                <svg className="w-6 h-6 text-white" viewBox="0 0 40 40" fill="none">
                  <path d="M12.25 15.2C16.53 11 23.47 11 27.75 15.2L28.84 16.27C29.24 16.66 29.87 16.66 30.27 16.27L33.37 13.2C33.76 12.8 33.76 12.17 33.37 11.77C26 4.41001 14 4.41001 6.63001 11.77C6.24001 12.17 6.24001 12.8 6.63001 13.2L9.73001 16.27C10.12 16.66 10.75 16.66 11.15 16.27L12.25 15.2Z" fill="currentColor"/>
                  <path d="M38.86 17.21C39.25 17.61 39.25 18.24 38.86 18.63L29.74 27.67C29.35 28.06 28.72 28.06 28.32 27.67L20.71 20.13C20.32 19.74 19.69 19.74 19.3 20.13L11.69 27.67C11.3 28.06 10.67 28.06 10.27 27.67L1.15 18.63C0.76 18.24 0.76 17.61 1.15 17.21C11.55 6.90999 28.46 6.90999 38.86 17.21Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-bold text-zinc-100 group-hover:text-white">WalletConnect</div>
                <div className="text-xs text-zinc-500">Lobstr, mobile wallets</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-500/0 group-hover:bg-blue-500/100 transition-colors shadow-[0_0_8px_rgba(59,130,246,0)] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </button>
        </div>

        <p className="mt-6 text-center text-[10px] text-zinc-600">
          By connecting a wallet, you agree to SafeSplit's Terms of Service and consent to its Privacy Policy.
        </p>
      </div>
    </div>
  );
}
