import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { ShieldCheck, Briefcase, Award, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CopyButton from '@/components/ui/CopyButton';

export default async function PublicProfilePage(
  props: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await props.params;

  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('wallet_address', wallet)
    .single();

  if (userError || !user) {
    notFound();
  }

  const { data: escrows, error: escrowError } = await supabase
    .from('Escrow')
    .select('total_xlm, status')
    .eq('freelancer_address', wallet)
    .eq('status', 'Completed');

  const completedCount = escrows ? escrows.length : 0;
  const totalVolume = escrows 
    ? escrows.reduce((sum, e) => sum + Number(e.total_xlm || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 p-6 md:p-12 selection:bg-purple-500/30">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SafeSplit</span>
          </Link>

          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-sm">
              <span>Create Escrow with {user.name?.split(' ')[0] || 'User'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="card-elevation rounded-2xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-purple-600/20">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-zinc-100">{user.name || 'Anonymous User'}</h1>
                {user.reliability_score >= 90 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Top Rated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span>{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
                <CopyButton text={wallet} size="sm" />
                <span>•</span>
                <a 
                  href={`https://stellar.expert/explorer/testnet/account/${wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>Stellar Expert</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Trust Metrics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.06]">
            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.06]">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Completed Escrows</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1 tabular-nums">{completedCount}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">As verified freelancer</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.06]">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Settled Volume</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {totalVolume.toLocaleString()} <span className="text-xs font-sans">XLM</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Successfully disbursed</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.06]">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Reliability Score</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
                {user.reliability_score || 100}%
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">On-time milestone delivery</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 text-center">
          Verified on-chain escrow credentials powered by the SafeSplit protocol on Stellar Soroban.
        </p>
      </div>
    </div>
  );
}