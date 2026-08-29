'use client';

import React from 'react';
import { X, User, Calendar, Mail, Link as LinkIcon, Activity, TrendingUp, DollarSign, Target, CheckCircle2 } from 'lucide-react';
import CopyButton from '@/components/ui/CopyButton';

interface ProfileDashboardModalProps {
  user: any;
  balance: string;
  onClose: () => void;
}

export default function ProfileDashboardModal({ user, balance, onClose }: ProfileDashboardModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#12141a] border border-white/[0.1] rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0d0f14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">{user.name}</h2>
                {user.reliability_score >= 90 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Top Rated
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>{user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}</span>
                <CopyButton text={user.wallet_address} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Testnet Balance</div>
              <div className="text-base font-bold font-mono text-purple-300 tabular-nums">
                {balance} XLM
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Performance Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-elevation p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Reliability</span>
              <div className="text-xl font-bold font-mono text-purple-300 mt-1">{user.reliability_score || 100}%</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">On-time milestones</div>
            </div>

            <div className="card-elevation p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Completed</span>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{user.completed_jobs || 0}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Escrow agreements</div>
            </div>

            <div className="card-elevation p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Status</span>
              <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Verified Stellar Account</span>
              </div>
            </div>

            <div className="card-elevation p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Public Profile</span>
              <div className="mt-1.5">
                <a
                  href={`/p/${user.wallet_address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View Public Page</span>
                </a>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="card-elevation p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Profile Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span>{user.email || 'No email provided'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>{user.birthday ? new Date(user.birthday).toLocaleDateString() : 'No birth date specified'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300 sm:col-span-2">
                <LinkIcon className="w-4 h-4 text-zinc-500" />
                {user.social_link ? (
                  <a href={user.social_link} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline truncate">
                    {user.social_link}
                  </a>
                ) : (
                  <span className="text-zinc-500">No social / portfolio link</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
