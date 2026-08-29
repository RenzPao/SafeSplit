'use client';

import React, { useState } from 'react';
import { MessagesSquare, Activity } from 'lucide-react';
import { Escrow } from '../types';
import ChatBox from '@/components/ChatBox';
import StellarHashLink from '@/components/ui/StellarHashLink';

interface SidebarTabsProps {
  escrow: Escrow;
  userWallet: string;
}

export default function SidebarTabs({ escrow, userWallet }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');

  const sortedLogs = [...(escrow.activity_logs || [])].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="card-elevation rounded-2xl overflow-hidden flex flex-col h-[650px] border border-white/[0.08] bg-[#0d0f18]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Sidebar Tab Header */}
      <div className="flex border-b border-white/[0.08] bg-[#0a0c14]/90">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'chat'
              ? 'border-purple-500 text-white bg-purple-500/[0.08] shadow-[inset_0_-2px_8px_rgba(147,51,234,0.2)]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
          }`}
        >
          <MessagesSquare className={`w-4 h-4 ${activeTab === 'chat' ? 'text-purple-400' : 'text-zinc-500'}`} />
          <span>Realtime Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'activity'
              ? 'border-purple-500 text-white bg-purple-500/[0.08] shadow-[inset_0_-2px_8px_rgba(147,51,234,0.2)]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
          }`}
        >
          <Activity className={`w-4 h-4 ${activeTab === 'activity' ? 'text-cyan-400' : 'text-zinc-500'}`} />
          <span>Audit Feed ({sortedLogs.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <div className="flex-1 p-3 flex flex-col h-full overflow-hidden bg-[#07080d]/60">
            <ChatBox
              escrowId={escrow.id}
              currentWalletAddress={userWallet}
              clientAddress={escrow.client_address}
              freelancerAddress={escrow.freelancer_address}
              arbiterAddress={escrow.arbiter_address}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#07080d]/60">
            {sortedLogs.length === 0 ? (
              <div className="text-center py-14 text-zinc-500 text-xs">
                No on-chain activity recorded yet.
              </div>
            ) : (
              sortedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#0d0f18] border border-white/[0.06] hover:border-purple-500/30 text-xs space-y-2 transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 group-hover:text-purple-200 transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                      {log.event_name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                  )}

                  {log.tx_hash && (
                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 font-mono">Stellar Hash</span>
                      <StellarHashLink hash={log.tx_hash} type="tx" truncateLen={4} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
