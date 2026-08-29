'use client';

import React, { useState } from 'react';
import { DollarSign, RefreshCw, ArrowRightLeft, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CurrencyConverterWidget() {
  const [xlmAmount, setXlmAmount] = useState<string>('5000');
  const [fiatCurrency, setFiatCurrency] = useState<'USD' | 'EUR' | 'USDC'>('USD');
  const [includeBuffer, setIncludeBuffer] = useState<boolean>(true);
  const [bufferPct, setBufferPct] = useState<number>(5);

  // Approximate FX conversion rates for instant client estimation
  const FX_RATES = {
    USD: 0.112,
    EUR: 0.104,
    USDC: 0.112,
  };

  const currentRate = FX_RATES[fiatCurrency];
  const parsedXlm = parseFloat(xlmAmount) || 0;
  const fiatEquivalent = parsedXlm * currentRate;
  const bufferAmount = includeBuffer ? (parsedXlm * bufferPct) / 100 : 0;
  const totalRecommendedXlm = parsedXlm + bufferAmount;

  return (
    <div className="card-elevation p-5 rounded-2xl border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Escrow Valuation & FX Desk
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          1 XLM ≈ ${FX_RATES.USD} USD
        </span>
      </div>

      {/* Input / Converter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* XLM Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300">XLM Amount</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={xlmAmount}
              onChange={(e) => setXlmAmount(e.target.value)}
              className="w-full bg-[#0a0c14] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500 shadow-inner"
              placeholder="e.g. 5000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-purple-400">
              XLM
            </span>
          </div>
        </div>

        {/* Target Currency & Result */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-zinc-300">Fiat Valuation</label>
            <div className="flex items-center gap-1">
              {(['USD', 'EUR', 'USDC'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setFiatCurrency(curr)}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    fiatCurrency === curr
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-zinc-500 hover:text-zinc-300 bg-white/[0.04]'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-[#0a0c14] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span>≈ {fiatEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-zinc-500 font-sans">{fiatCurrency}</span>
          </div>
        </div>
      </div>

      {/* Volatility Cushion Toggle */}
      <div className="p-3 rounded-xl bg-[#0a0c14]/80 border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeBuffer}
              onChange={(e) => setIncludeBuffer(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500/20 accent-purple-500"
            />
            <span className="text-xs font-medium text-zinc-300">
              Apply Volatility Buffer ({bufferPct}%)
            </span>
          </label>
          {includeBuffer && (
            <span className="text-[10px] font-mono text-purple-300 font-semibold">
              +{bufferAmount.toLocaleString()} XLM
            </span>
          )}
        </div>

        {includeBuffer && (
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Recommended Pre-Fund:</span>
            <span className="text-white font-bold">{totalRecommendedXlm.toLocaleString()} XLM</span>
          </div>
        )}
      </div>

      {/* Protocol Fee Transparency Pill */}
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          SafeSplit Protocol Fee: 0.00%
        </span>
        <span>Stellar Gas: ~0.00001 XLM</span>
      </div>
    </div>
  );
}
