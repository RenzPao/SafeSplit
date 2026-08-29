'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Command } from 'lucide-react';

interface HotkeyCheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HotkeyCheatsheetModal({ isOpen, onClose }: HotkeyCheatsheetModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K / Ctrl K', desc: 'Open Quick Action & Escrow Search Spotlight' },
    { key: '?', desc: 'Open Keyboard Shortcuts Cheatsheet' },
    { key: 'Esc', desc: 'Close any active modal or drawer' },
    { key: 'N', desc: 'Launch New Escrow Agreement Wizard' },
    { key: '1', desc: 'Switch to Portfolio Overview' },
    { key: '2', desc: 'Switch to Creation Studio' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0c0e17] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.25)] overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] bg-[#0e101c] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Keyboard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Keyboard Shortcuts</h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e101c] border border-white/[0.04] text-xs"
              >
                <span className="text-zinc-300">{s.desc}</span>
                <kbd className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/[0.08] text-purple-300 border border-white/[0.08]">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-white/[0.06] bg-[#090b12] text-center text-[10px] font-mono text-zinc-500">
            Press <kbd className="bg-white/[0.08] px-1 py-0.5 rounded text-zinc-300">Esc</kbd> anytime to dismiss
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
