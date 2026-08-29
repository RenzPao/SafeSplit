'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Upload, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Escrow } from './types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  escrows: Escrow[];
  userWallet: string;
  onSelectEscrow: (escrowId: string) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  escrows,
  userWallet,
  onSelectEscrow,
}: NotificationDrawerProps) {
  // Aggregate and synthesize notifications from active escrows
  const notifications: {
    id: string;
    escrowId: string;
    title: string;
    message: string;
    type: 'deposit' | 'approval' | 'submission' | 'dispute' | 'general';
    time: string;
    actionLabel?: string;
  }[] = [];

  escrows.forEach((e) => {
    if (e.client_address === userWallet && e.status === 'Initialized') {
      notifications.push({
        id: `deposit-${e.id}`,
        escrowId: e.id,
        title: 'Deposit Required',
        message: `Contract "${e.title || e.id.slice(0, 8)}" is initialized. Deposit ${e.total_xlm} XLM to activate.`,
        type: 'deposit',
        time: 'Action needed',
        actionLabel: 'Deposit Funds',
      });
    }

    if (e.client_address === userWallet && e.milestones?.some((m) => m.status === 'Submitted')) {
      notifications.push({
        id: `review-${e.id}`,
        escrowId: e.id,
        title: 'Milestone Deliverable Submitted',
        message: `Freelancer submitted work for "${e.title || e.id.slice(0, 8)}". Ready for your review.`,
        type: 'approval',
        time: 'Pending review',
        actionLabel: 'Review Work',
      });
    }

    if (e.freelancer_address === userWallet && (e.status === 'Funded' || e.status === 'InProgress')) {
      const pendingMilestone = e.milestones?.find((m) => m.status === 'Pending');
      if (pendingMilestone) {
        notifications.push({
          id: `work-${e.id}`,
          escrowId: e.id,
          title: 'Milestone In Progress',
          message: `Escrow funded for "${e.title || e.id.slice(0, 8)}". Submit your deliverable when ready.`,
          type: 'submission',
          time: 'Active contract',
          actionLabel: 'Open Workspace',
        });
      }
    }

    if (e.status === 'Disputed') {
      notifications.push({
        id: `dispute-${e.id}`,
        escrowId: e.id,
        title: 'Arbitration Dispute Active',
        message: `Dispute opened on "${e.title || e.id.slice(0, 8)}". Awaiting arbiter ruling.`,
        type: 'dispute',
        time: 'Dispute phase',
        actionLabel: 'View Ruling',
      });
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-Over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0c0e17] border-l border-white/[0.08] shadow-2xl h-full flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0e101c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Notification Center</h3>
                  <p className="text-[10px] text-zinc-400">{notifications.length} active updates & action alerts</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="text-zinc-400 font-semibold">You are all caught up!</p>
                  <p className="text-[11px] text-zinc-600">No pending actions or unread notifications.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-[#0e101c] border border-white/[0.06] hover:border-purple-500/40 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {n.type === 'deposit' && <Lock className="w-3.5 h-3.5 text-purple-400" />}
                        {n.type === 'approval' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {n.type === 'submission' && <Upload className="w-3.5 h-3.5 text-cyan-400" />}
                        {n.type === 'dispute' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                        {n.time}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="pt-2 border-t border-white/[0.04] flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectEscrow(n.escrowId);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 group/link transition-colors"
                      >
                        <span>{n.actionLabel || 'View Deal'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-white/[0.06] bg-[#090b12] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Realtime On-Chain Indexer</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
