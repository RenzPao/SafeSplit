'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Zap, Shield, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Escrow } from '../types';

interface PortfolioChartProps {
  escrows: Escrow[];
}

export default function PortfolioChart({ escrows }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | 'ALL'>('30D');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number } | null>(null);

  // Compute stats
  const totalVolume = escrows.reduce((acc, e) => {
    const val = typeof e.total_xlm === 'number' ? e.total_xlm : parseFloat(e.total_xlm || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalMilestones = escrows.reduce((acc, e) => acc + (e.milestones?.length || 0), 0);
  const avgDealSize = escrows.length > 0 ? Math.round(totalVolume / escrows.length) : 0;

  // Chart data simulation points based on escrows
  const pointsMap = {
    '24H': [
      { label: '00:00', value: Math.round(totalVolume * 0.85) },
      { label: '04:00', value: Math.round(totalVolume * 0.88) },
      { label: '08:00', value: Math.round(totalVolume * 0.92) },
      { label: '12:00', value: Math.round(totalVolume * 0.95) },
      { label: '16:00', value: Math.round(totalVolume * 0.98) },
      { label: 'Now', value: totalVolume },
    ],
    '7D': [
      { label: 'Mon', value: Math.round(totalVolume * 0.6) },
      { label: 'Tue', value: Math.round(totalVolume * 0.68) },
      { label: 'Wed', value: Math.round(totalVolume * 0.75) },
      { label: 'Thu', value: Math.round(totalVolume * 0.82) },
      { label: 'Fri', value: Math.round(totalVolume * 0.9) },
      { label: 'Sat', value: Math.round(totalVolume * 0.96) },
      { label: 'Sun', value: totalVolume },
    ],
    '30D': [
      { label: 'Week 1', value: Math.round(totalVolume * 0.3) },
      { label: 'Week 2', value: Math.round(totalVolume * 0.52) },
      { label: 'Week 3', value: Math.round(totalVolume * 0.78) },
      { label: 'Week 4', value: totalVolume },
    ],
    'ALL': [
      { label: 'Q1', value: Math.round(totalVolume * 0.2) },
      { label: 'Q2', value: Math.round(totalVolume * 0.45) },
      { label: 'Q3', value: Math.round(totalVolume * 0.72) },
      { label: 'Q4', value: totalVolume },
    ],
  };

  const activePoints = pointsMap[timeRange];
  const maxVal = Math.max(...activePoints.map((p) => p.value), 100);
  const minVal = Math.min(...activePoints.map((p) => p.value), 0);

  // Generate SVG Path
  const width = 500;
  const height = 140;
  const paddingX = 20;
  const paddingY = 20;

  const pointsCoordinates = activePoints.map((p, idx) => {
    const x = paddingX + (idx / (activePoints.length - 1)) * (width - paddingX * 2);
    const range = maxVal - minVal || 1;
    const y = height - paddingY - ((p.value - minVal) / range) * (height - paddingY * 2);
    return { x, y, ...p };
  });

  const pathD = pointsCoordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${height} L ${pointsCoordinates[0].x} ${height} Z`;

  return (
    <div className="card-elevation p-5 rounded-2xl border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Settlement Volume & TVL Dynamics
            </h3>
            <p className="text-[10px] text-zinc-400">Cumulative escrow disbursements over time</p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-[#0a0c14] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
          {(['24H', '7D', '30D', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                timeRange === r
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Area Chart */}
      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            d={areaD}
            fill="url(#chartAreaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Stroke Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#chartLineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Interactive Data Nodes */}
          {pointsCoordinates.map((pt, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="fill-[#0c0e17] stroke-purple-400 stroke-2 hover:r-6 transition-all"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Current Velocity:</span>
            <span className="text-emerald-300 font-bold font-sans">
              {hoveredPoint ? `${hoveredPoint.label}: ${hoveredPoint.value.toLocaleString()} XLM` : `${totalVolume.toLocaleString()} XLM Cumulative`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span>Avg Deal: <strong className="text-white font-mono">{avgDealSize.toLocaleString()} XLM</strong></span>
            <span className="hidden sm:inline">Stages: <strong className="text-purple-300 font-mono">{totalMilestones}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
