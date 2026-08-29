"use client";

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

export default function WalletModal() {
  const { showWalletModal, setShowWalletModal, connectFreighter, connectWalletConnect } = useWallet();

  if (!showWalletModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setShowWalletModal(false)}
      />
      
      {/* Modal Card */}
      <div className="relative bg-[#12141a] border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5 border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-100">Connect Stellar Wallet</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Select your preferred Stellar provider</p>
          </div>
          <button 
            onClick={() => setShowWalletModal(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Freighter */}
          <button
            onClick={connectFreighter}
            className="w-full group flex items-center justify-between p-3.5 bg-[#0d0f14] border border-white/[0.06] hover:border-purple-500/40 hover:bg-[#161822] rounded-xl transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                <span className="text-black font-black text-lg italic leading-none">F</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-xs text-zinc-200 group-hover:text-purple-300 transition-colors">
                  Freighter Wallet
                </div>
                <div className="text-[11px] text-zinc-500">Stellar browser extension</div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold text-purple-400/80 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
              Browser
            </span>
          </button>

          {/* WalletConnect */}
          <button
            onClick={connectWalletConnect}
            className="w-full group flex items-center justify-between p-3.5 bg-[#0d0f14] border border-white/[0.06] hover:border-blue-500/40 hover:bg-[#161822] rounded-xl transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" viewBox="0 0 40 40" fill="none">
                  <path d="M12.25 15.2C16.53 11 23.47 11 27.75 15.2L28.84 16.27C29.24 16.66 29.87 16.66 30.27 16.27L33.37 13.2C33.76 12.8 33.76 12.17 33.37 11.77C26 4.41001 14 4.41001 6.63001 11.77C6.24001 12.17 6.24001 12.8 6.63001 13.2L9.73001 16.27C10.12 16.66 10.75 16.66 11.15 16.27L12.25 15.2Z" fill="currentColor"/>
                  <path d="M38.86 17.21C39.25 17.61 39.25 18.24 38.86 18.63L29.74 27.67C29.35 28.06 28.72 28.06 28.32 27.67L20.71 20.13C20.32 19.74 19.69 19.74 19.3 20.13L11.69 27.67C11.3 28.06 10.67 28.06 10.27 27.67L1.15 18.63C0.76 18.24 0.76 17.61 1.15 17.21C11.55 6.90999 28.46 6.90999 38.86 17.21Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-xs text-zinc-200 group-hover:text-blue-300 transition-colors">
                  WalletConnect
                </div>
                <div className="text-[11px] text-zinc-500">Lobstr, mobile & QR connect</div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold text-blue-400/80 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
              Mobile / QR
            </span>
          </button>
        </div>

        <p className="mt-5 text-center text-[10px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-3">
          Non-custodial connection. SafeSplit never has access to your private keys.
        </p>
      </div>
    </div>
  );
}
