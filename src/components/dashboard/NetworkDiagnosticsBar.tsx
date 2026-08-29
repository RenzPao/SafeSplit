'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Cpu, Wifi, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NetworkDiagnosticsBar() {
  const [latency, setLatency] = useState<number | null>(null);
  const [ledgerSeq, setLedgerSeq] = useState<number | null>(null);
  const [protocolVersion, setProtocolVersion] = useState<string>('20');
  const [isChecking, setIsChecking] = useState(false);

  const checkNetwork = async () => {
    try {
      setIsChecking(true);
      const start = performance.now();
      const res = await fetch('https://horizon-testnet.stellar.org/fee_stats', { cache: 'no-store' });
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);

      if (res.ok) {
        const rootRes = await fetch('https://horizon-testnet.stellar.org/', { cache: 'no-store' });
        if (rootRes.ok) {
          const rootData = await rootRes.json();
          setLedgerSeq(rootData.history_latest_ledger || rootData.core_latest_ledger || null);
          setProtocolVersion(String(rootData.protocol_version || '20'));
        }
      }
    } catch {
      setLatency(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#090b12]/90 border border-white/[0.06] text-[11px] font-mono text-zinc-400 shadow-sm backdrop-blur-md">
      {/* Network Status & RPC Latency */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white uppercase tracking-wider text-[10px]">Stellar Testnet</span>
        </div>

        <span className="text-zinc-700">|</span>

        <div className="flex items-center gap-1.5" title="Horizon RPC round-trip response time">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span>RPC:</span>
          <span className="text-cyan-300 font-semibold">{latency !== null ? `${latency}ms` : 'Checking...'}</span>
        </div>

        {ledgerSeq && (
          <>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5" title="Latest Stellar Ledger Sequence">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Ledger:</span>
              <span className="text-purple-300 font-semibold">#{ledgerSeq.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Protocol Version & Contract Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" title="Stellar Smart Contract Protocol Version">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Soroban Protocol:</span>
          <span className="text-emerald-300 font-semibold">v{protocolVersion}</span>
        </div>

        <span className="text-zinc-700">|</span>

        <a
          href="https://stellar.expert/explorer/testnet"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-zinc-400 hover:text-purple-300 transition-colors"
        >
          <span>Explorer</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={checkNetwork}
          disabled={isChecking}
          className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Refresh Network Diagnostics"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}
