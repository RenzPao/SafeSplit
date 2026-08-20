import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Shield, Briefcase, Award, ExternalLink } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-zinc-900/50 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{user.name || 'Anonymous User'}</h1>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-zinc-400 bg-zinc-950/50 px-3 py-1 rounded-full border border-zinc-800">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <a 
                  href={`https://stellar.expert/explorer/testnet/account/${wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Metrics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Verified Trust Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3 text-zinc-400 mb-4">
                <Briefcase className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
                <span className="font-semibold text-sm uppercase tracking-wider">Completed Escrows</span>
              </div>
              <div className="text-4xl font-black text-white">
                {completedCount}
              </div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">As a verified freelancer</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-3 text-zinc-400 mb-4">
                <Award className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                <span className="font-semibold text-sm uppercase tracking-wider">Total Volume Secured</span>
              </div>
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-lg font-bold text-zinc-500">XLM</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">Successfully processed</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-4 text-center max-w-xl mx-auto">
            These metrics are calculated from on-chain verified escrows. Specific client identifiers are kept strictly confidential to protect privacy.
          </p>
        </div>
        
      </div>
    </div>
  );
}