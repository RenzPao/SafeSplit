'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RadialProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export default function RadialProgress({
  progress,
  size = 72,
  strokeWidth = 6,
  label,
  sublabel,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glowing Gradient Definition */}
          <defs>
            <linearGradient id="radialGradientProgress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Animated Progress Path */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#radialGradientProgress)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            filter="url(#glowFilter)"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-xs font-bold text-white tabular-nums">
          <span>{Math.round(safeProgress)}%</span>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-bold text-white">{label}</span>}
          {sublabel && <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
