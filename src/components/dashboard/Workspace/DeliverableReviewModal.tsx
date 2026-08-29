'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  GitPullRequest, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  MessageSquare, 
  Check, 
  ShieldCheck,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Milestone } from '../types';

interface DeliverableReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone;
  isClient: boolean;
  onApprove: () => void;
  onDispute: () => void;
  isActionLoading: boolean;
}

export default function DeliverableReviewModal({
  isOpen,
  onClose,
  milestone,
  isClient,
  onApprove,
  onDispute,
  isActionLoading,
}: DeliverableReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'acceptance' | 'notes'>('preview');
  const [feedbackNote, setFeedbackNote] = useState('');

  if (!isOpen) return null;

  const totalSubtasks = milestone.subtasks?.length || 0;
  const completedSubtasks = milestone.subtasks?.filter((s) => s.is_completed).length || 0;

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
          className="relative w-full max-w-2xl bg-[#0c0e17] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.25)] overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] bg-[#0e101c] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Deliverable Review Workbench
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  {milestone.title} • <span className="text-purple-300 font-bold">{milestone.amount_xlm} XLM</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-white/[0.06] bg-[#090b12] px-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'preview'
                  ? 'border-purple-500 text-purple-300 bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Artifact & URL</span>
            </button>

            <button
              onClick={() => setActiveTab('acceptance')}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'acceptance'
                  ? 'border-purple-500 text-purple-300 bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acceptance Criteria ({completedSubtasks}/{totalSubtasks})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'notes'
                  ? 'border-purple-500 text-purple-300 bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Revision Feedback</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0e101c] border border-white/[0.08] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                    Submitted Proof of Work
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#07080d] border border-white/[0.06] font-mono text-xs text-white">
                    <span className="truncate pr-4">{milestone.deliverable_url || 'No URL submitted'}</span>
                    {milestone.deliverable_url && (
                      <a
                        href={milestone.deliverable_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e101c] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Milestone Scope & SOW
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {milestone.description || 'No detailed scope description provided.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'acceptance' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Sign-off Criteria Verification</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 100}% Ready
                  </span>
                </div>

                <div className="space-y-2">
                  {milestone.subtasks && milestone.subtasks.length > 0 ? (
                    milestone.subtasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-[#0e101c] border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <span className={task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                          {task.title}
                        </span>
                        {task.is_completed ? (
                          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono text-[10px]">Pending</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-zinc-500 text-xs">
                      No explicit checklist criteria defined for this milestone.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-300">Client Feedback / Revision Notes</label>
                <textarea
                  rows={4}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Detail any changes required before approving on-chain release..."
                  className="w-full bg-[#0e101c] border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 shadow-inner"
                />
                <p className="text-[10px] text-zinc-500">
                  Notes are stored immutably in the contract activity audit log.
                </p>
              </div>
            )}
          </div>

          {/* Footer Action Desk */}
          {isClient && (
            <div className="p-4 border-t border-white/[0.08] bg-[#0e101c] flex items-center justify-between gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onDispute();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
              >
                Request Revisions / Dispute
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onApprove();
                }}
                disabled={isActionLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 flex items-center gap-2"
              >
                {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Sign Approval & Release Funds</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
