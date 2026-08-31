'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode2, 
  Lock, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint, 
  GitPullRequest,
  Zap,
  Terminal,
  Scale
} from 'lucide-react';

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  terminalCode: string;
  onChainAction: string;
  stateIcon: React.ReactNode;
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: '1. Agreement Inception & Cryptographic Hashing',
    subtitle: 'Immutable Scope of Work',
    description:
      'Parties define milestone deliverables, deadlines, and XLM values. SafeSplit computes an off-chain SHA-256 hash of the complete Scope of Work (SOW), producing an immutable on-chain fingerprint.',
    badge: 'Step 1: Hash Inception',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    terminalCode: `// 1. Compute deterministic terms fingerprint
const sowTerms = "Milestone 1: Smart Contract Audit : 5000 XLM";
const sha256Hash = crypto.createHash('sha256').update(sowTerms).digest('hex');
// SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069

soroban.contract.init({
  client: "GDQW...3R4X",
  freelancer: "GAK8...9P1Z",
  total_xlm: 10000,
  description_hashes: [sha256Hash]
});`,
    onChainAction: 'Contract Instantiated with SHA-256 Fingerprint',
    stateIcon: <Fingerprint className="w-5 h-5 text-purple-400" />,
  },
  {
    id: 2,
    title: '2. Trustless Soroban Vault Lock',
    subtitle: 'Multi-Sig Capital Isolation',
    description:
      'The client deposits the total agreed XLM balance directly into the autonomous Soroban smart vault. The contract locks the assets mathematically—neither party can unilaterally withdraw or rug-pull.',
    badge: 'Step 2: Capital Lock',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    terminalCode: `// 2. Client transfers XLM to Soroban Smart Vault
await sorobanClient.depositXlm({
  from: "GDQW...3R4X",
  contractId: "CDA4KMIYSDXEK5SC6AA2S3ISPIJBOWWW3GBETD7KMJQRJWRKFSFQYZEU",
  amount_stroops: 100000000000 // 10,000.00 XLM
});

// Vault Status: LOCKED & AUTONOMOUS
// Multi-Signature Custody: ACTIVE`,
    onChainAction: '10,000 XLM Locked in Autonomous Vault',
    stateIcon: <Lock className="w-5 h-5 text-cyan-400" />,
  },
  {
    id: 3,
    title: '3. Proof of Work Submission',
    subtitle: 'Cryptographic Deliverable Timestamping',
    description:
      'Upon finishing a milestone, the freelancer uploads the completed work artifact (GitHub PR commit hash or IPFS CID) to the contract. The milestone shifts to "Submitted" state.',
    badge: 'Step 3: Proof Submission',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    terminalCode: `// 3. Freelancer submits cryptographic deliverable proof
await sorobanClient.submitDeliverable({
  milestone_index: 0,
  deliverable_url: "https://github.com/org/repo/pull/42",
  ipfs_cid: "QmZtmD2qtW3wTq9Ym1wZp5x5M8mQ...",
  timestamp: 1725100000
});

// Milestone 1 Status: SUBMITTED (Pending Client Review)`,
    onChainAction: 'Deliverable Proof Verified & Stamped On-Chain',
    stateIcon: <GitPullRequest className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 4,
    title: '4. Atomic Release & Instant Settlement',
    subtitle: 'Zero Intermediaries, 3-Second Payout',
    description:
      'The client inspects the deliverable and approves it with a single cryptographic signature. The Soroban smart contract atomically disburses the milestone XLM directly into the freelancer’s Stellar wallet.',
    badge: 'Step 4: Atomic Settlement',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    terminalCode: `// 4. Client signs milestone approval
await sorobanClient.approveMilestone({
  milestone_index: 0,
  client_signature: "SIG_ED25519_..."
});

// >>> ATOMIC DISBURSEMENT EXECUTED <<<
// Sent 5,000.00 XLM -> Freelancer (GAK8...9P1Z)
// Transaction Succeeded in 3.4 seconds (Gas: 0.00001 XLM)`,
    onChainAction: 'Funds Disbursed Instantly to Freelancer',
    stateIcon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  },
];

export default function ScrollytellingSection() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const currentStage = STAGES.find((s) => s.id === activeStage) || STAGES[0];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Interactive Protocol Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How SafeSplit Secures Your Agreement
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Explore the exact cryptographic sequence that prevents non-payment, guarantees deliverables, and eliminates counterparty risk.
        </p>
      </div>

      {/* Interactive Step Scrubber Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeStage === s.id
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105'
                : 'bg-[#0d0f18] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
            }`}
          >
            <span>{s.badge}</span>
          </button>
        ))}
      </div>

      {/* Main Scrollytelling Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Stage Explanation & Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {STAGES.map((s) => {
            const isActive = activeStage === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none space-y-2.5 ${
                  isActive
                    ? 'bg-[#0f121d] border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.2)]'
                    : 'bg-[#080a10]/60 border-white/[0.04] hover:border-white/[0.1] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                  {s.stateIcon}
                </div>

                <h3 className={`text-base font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                  {s.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {s.description}
                </p>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-purple-300 font-semibold"
                  >
                    <span>Status: Active Pipeline</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      On-Chain Validated
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Terminal & On-Chain State Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          <div className="card-elevation rounded-2xl border border-white/[0.1] bg-[#07090e] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-[#0d0f17] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-zinc-400 ml-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>stellar-soroban-vm --inspect</span>
                </span>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Protocol v20
              </span>
            </div>

            {/* Code Output Window */}
            <div className="p-6 font-mono text-xs text-zinc-300 overflow-x-auto min-h-[300px] flex flex-col justify-between space-y-4">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={currentStage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-pre-wrap leading-relaxed text-purple-200/90 font-mono text-[11px]"
                >
                  {currentStage.terminalCode}
                </motion.pre>
              </AnimatePresence>

              {/* Stage On-Chain Banner */}
              <div className="p-3.5 rounded-xl bg-[#0e111a] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>{currentStage.onChainAction}</span>
                </div>

                <button
                  onClick={() => setActiveStage((prev) => (prev % 4) + 1)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
