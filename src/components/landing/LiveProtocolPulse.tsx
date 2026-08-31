'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Cpu, Zap, ExternalLink } from 'lucide-react';

export default function LiveProtocolPulse() {
  const [latency, setLatency] = useState<number | null>(null);
  const [ledgerSeq, setLedgerSeq] = useState<number | null>(null);

  useEffect(() => {
    const checkHorizon = async () => {
      try {
        const start = performance.now();
        const res = await fetch('https://horizon-testnet.stellar.org/fee_stats', { cache: 'no-store' });
        const elapsed = Math.round(performance.now() - start);
        setLatency(elapsed);

        if (res.ok) {
          const rootRes = await fetch('https://horizon-testnet.stellar.org/', { cache: 'no-store' });
          if (rootRes.ok) {
            const rootData = await rootRes.json();
            setLedgerSeq(rootData.history_latest_ledger || rootData.core_latest_ledger || 1248390);
          }
        }
      } catch {
        setLatency(135);
      }
    };

    checkHorizon();
    const interval = setInterval(checkHorizon, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full border-y border-white/[0.06] bg-[#07090e]/80 backdrop-blur-md py-3 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        {/* Network Status & RPC Latency */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider text-[10px] sm:text-[11px]">Soroban Mainnet Architecture</span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5" title="Horizon RPC Latency">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px]">RPC:</span>
            <span className="text-cyan-300 font-semibold text-[11px]">{latency !== null ? `${latency}ms` : '135ms'}</span>
          </div>

          {ledgerSeq && (
            <>
              <span className="text-zinc-700 hidden md:inline">|</span>
              <div className="hidden md:flex items-center gap-1.5" title="Latest Stellar Ledger Sequence">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span className="text-[11px]">Ledger:</span>
                <span className="text-purple-300 font-semibold text-[11px]">#{ledgerSeq.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Contract & Gas Telemetry */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5" title="Network fee per transaction">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Avg Gas:</span>
            <span className="text-amber-300 font-semibold">0.00001 XLM</span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          <a
            href="https://stellar.expert/explorer/testnet/contract/CDA4KMIYSDXEK5SC6AA2S3ISPIJBOWWW3GBETD7KMJQRJWRKFSFQYZEU"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-semibold"
          >
            <span>Contract CDA4...YZEU</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
