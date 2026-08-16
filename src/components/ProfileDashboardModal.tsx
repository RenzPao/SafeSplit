import React from 'react';
import { X, User, Calendar, Mail, Link as LinkIcon, Activity, TrendingUp, DollarSign, Target, CheckCircle2 } from 'lucide-react';

interface ProfileDashboardModalProps {
  user: any;
  balance: string;
  onClose: () => void;
}

export default function ProfileDashboardModal({ user, balance, onClose }: ProfileDashboardModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Background Gradient */}
        <div className="h-32 bg-gradient-to-r from-purple-900/40 via-blue-900/20 to-zinc-950 border-b border-zinc-800/50 absolute top-0 left-0 right-0 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full text-zinc-300 hover:text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 px-8 pt-12 pb-6 border-b border-zinc-800/80 flex items-end gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/20 border-4 border-zinc-950">
            <span className="text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 pb-1">
            <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              {user.name}
              {user.reliability_score >= 90 && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Top Rated
                </span>
              )}
            </h2>
            <div className="text-sm font-mono text-zinc-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {user.wallet_address}
            </div>
          </div>
          <div className="pb-1 text-right">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {balance} XLM
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8 custom-scrollbar">
          
          {/* Left Column (Info & Analytics) */}
          <div className="md:col-span-4 space-y-8">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Basic Information</h3>
              <div className="bg-zinc-900/40 rounded-2xl p-5 space-y-4 border border-zinc-900">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">
                    {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">{user.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <LinkIcon className="w-4 h-4 text-zinc-500" />
                  {user.social_link ? (
                    <a href={user.social_link} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline truncate">
                      {user.social_link}
                    </a>
                  ) : (
                    <span className="text-zinc-500">Not provided</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm border-t border-zinc-800/50 pt-4 mt-2">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 text-xs">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Performance metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
                  <Target className="w-4 h-4 text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-zinc-200">{user.completed_jobs}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Completed Jobs</div>
                </div>
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-center">
                  <Activity className="w-4 h-4 text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-purple-300">{user.reliability_score}%</div>
                  <div className="text-[10px] text-purple-500/70 uppercase font-bold mt-1">Reliability Score</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Financials & Graph) */}
          <div className="md:col-span-8 space-y-8">
            
            {/* Volume Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider">Total Earned</span>
                </div>
                <div className="text-3xl font-bold text-emerald-400">{Number(user.total_earned_xlm).toLocaleString()} <span className="text-sm text-emerald-600">XLM</span></div>
              </div>
              
              <div className="bg-blue-950/10 border border-blue-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-500/70 uppercase tracking-wider">Total Spent</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">{Number(user.total_spent_xlm).toLocaleString()} <span className="text-sm text-blue-600">XLM</span></div>
              </div>
            </div>

            {/* Activity Graph (Visual CSS representation) */}
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">Activity Heatmap (Simulated)</h3>
              <div className="flex items-end gap-2 h-32 w-full px-2">
                {/* Generate 20 random bars for visual flavor */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const height = Math.random() * 80 + 10;
                  const opacity = height > 60 ? 'opacity-100' : height > 30 ? 'opacity-60' : 'opacity-30';
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative">
                      <div 
                        className={`w-full bg-purple-500 rounded-t-sm transition-all duration-500 group-hover:bg-purple-400 ${opacity}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase mt-4 px-2">
                <span>30 Days Ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Recent Transactions Placeholder */}
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Recent Escrow Transactions</h3>
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 text-center text-zinc-500 text-sm">
                Transaction history log will appear here after your first completed milestone.
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
