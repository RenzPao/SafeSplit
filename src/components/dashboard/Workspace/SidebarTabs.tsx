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
    <div className="card-elevation rounded-xl overflow-hidden flex flex-col h-[650px]">
      {/* Sidebar Tab Header */}
      <div className="flex border-b border-white/[0.08] bg-[#0d0f14]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'chat'
              ? 'border-purple-500 text-purple-400 bg-white/[0.02]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
          }`}
        >
          <MessagesSquare className="w-3.5 h-3.5" />
          <span>Realtime Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'activity'
              ? 'border-purple-500 text-purple-400 bg-white/[0.02]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Log ({sortedLogs.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <div className="flex-1 p-3 flex flex-col h-full overflow-hidden">
            <ChatBox
              escrowId={escrow.id}
              currentWalletAddress={userWallet}
              clientAddress={escrow.client_address}
              freelancerAddress={escrow.freelancer_address}
              arbiterAddress={escrow.arbiter_address}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {sortedLogs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No on-chain activity recorded yet.
              </div>
            ) : (
              sortedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300">{log.event_name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                  )}

                  {log.tx_hash && (
                    <div className="pt-1 flex items-center justify-between border-t border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 font-mono">Tx Hash</span>
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
