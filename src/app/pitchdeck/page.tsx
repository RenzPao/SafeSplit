'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Zap, Users, Globe2, CheckCircle, Lock, Server, Rocket, ArrowLeft, BarChart3, ShieldAlert, MessagesSquare } from 'lucide-react';
import Link from 'next/link';

/* ─── Slide data ───────────────────────────────────────────────────── */
const slides = [
  /* 0 – Title */
  {
    id: 0,
    tag: 'INTRO',
    render: () => (
      <div className="flex flex-col items-center justify-center h-full text-center gap-8 px-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
          <img src="/logo.svg" alt="SafeSplit Logo" className="w-24 h-24 mx-auto mb-8" />
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter mb-4">SafeSplit</h1>
          <p className="text-xl md:text-2xl text-purple-400 font-semibold tracking-wide mb-6">Trustless Milestone Escrow on Stellar Soroban</p>
          <p className="text-zinc-500 max-w-lg mx-auto text-base leading-relaxed">
            Eliminating the trust deficit between freelancers and clients using programmable smart contracts on the Stellar blockchain.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-3 text-xs font-bold uppercase tracking-widest">
          {['Stellar Soroban', 'Next.js', 'Supabase', 'Freighter Wallet'].map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400">{t}</span>
          ))}
        </motion.div>
      </div>
    ),
  },

  /* 1 – Problem */
  {
    id: 1,
    tag: 'PROBLEM',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<ShieldAlert className="w-4 h-4" />} label="The Problem" color="rose" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">Freelancers and clients don&apos;t trust each other.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Clients fear non-delivery', desc: 'Paying upfront is a gamble. What if the freelancer disappears?' },
            { title: 'Freelancers fear non-payment', desc: 'Delivering before payment leaves them vulnerable to chargebacks.' },
            { title: 'Platforms extract value', desc: '10–20% commissions, arbitrary disputes, geographic lock-in.' },
            { title: 'No cryptographic guarantees', desc: 'Trust is placed in a company\'s TOS, not in math.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
              className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/30">
              <div className="font-bold text-white mb-1 flex items-center gap-2"><span className="text-rose-400">✕</span>{item.title}</div>
              <div className="text-zinc-400 text-sm">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  /* 2 – Solution */
  {
    id: 2,
    tag: 'SOLUTION',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<CheckCircle className="w-4 h-4" />} label="The Solution" color="emerald" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Replace trust with cryptographic guarantees.</h2>
        <p className="text-zinc-400 mb-10 max-w-2xl text-lg">SafeSplit locks funds in a Soroban smart contract. Funds are only released when predefined milestones are cryptographically approved by the client — no middlemen, no discretion.</p>
        <div className="flex flex-wrap gap-4">
          {[
            { icon: <Lock className="w-5 h-5 text-purple-400" />, label: 'Funds locked in Soroban', bg: 'bg-purple-900/20 border-purple-800/40' },
            { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, label: 'Released per milestone', bg: 'bg-emerald-900/20 border-emerald-800/40' },
            { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, label: 'Neutral arbitration', bg: 'bg-blue-900/20 border-blue-800/40' },
            { icon: <Zap className="w-5 h-5 text-amber-400" />, label: '0% platform fees', bg: 'bg-amber-900/20 border-amber-800/40' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 + 0.3 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${item.bg}`}>
              {item.icon}
              <span className="text-white font-semibold text-sm">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  /* 3 – Product */
  {
    id: 3,
    tag: 'PRODUCT',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<Rocket className="w-4 h-4" />} label="The Product" color="purple" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">A full escrow OS, not just a dApp.</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Milestone Escrow', desc: 'Split any project into verifiable stages. Funds released atomically per approval.', icon: <CheckCircle className="w-6 h-6 text-purple-400" /> },
            { title: 'Realtime Chat', desc: 'Built-in Supabase Realtime chat for Client, Freelancer, and Arbiter within the contract.', icon: <MessagesSquare className="w-6 h-6 text-blue-400" /> },
            { title: 'Decentralized Arbitration', desc: '3-party escrow with arbiters who can enforce custom settlement splits.', icon: <ShieldCheck className="w-6 h-6 text-emerald-400" /> },
            { title: 'On-chain Deliverables', desc: 'Freelancers submit GitHub PRs or IPFS CIDs as immutable proof-of-work.', icon: <Server className="w-6 h-6 text-amber-400" /> },
            { title: 'Activity Audit Log', desc: 'Every action (funding, submission, approval) is timestamped and stored for transparency.', icon: <BarChart3 className="w-6 h-6 text-fuchsia-400" /> },
            { title: 'Identity Profiles', desc: 'Users register display names + reliability scores tied to their Stellar wallet.', icon: <Users className="w-6 h-6 text-rose-400" /> },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.2 }}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="mb-3">{item.icon}</div>
              <div className="font-bold text-white mb-1">{item.title}</div>
              <div className="text-zinc-500 text-xs leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  /* 4 – How It Works */
  {
    id: 4,
    tag: 'MECHANICS',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<Zap className="w-4 h-4" />} label="How It Works" color="purple" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">5 Steps to Trustless Delivery.</h2>
        <div className="flex flex-col gap-4">
          {[
            { n: '01', title: 'Initialize', desc: 'Client defines milestones, assigns parties, and sets the total XLM.' },
            { n: '02', title: 'Lock Funds', desc: 'Client deploys a unique Soroban contract and deposits XLM on-chain.' },
            { n: '03', title: 'Submit Work', desc: 'Freelancer uploads proof (GitHub PR or IPFS CID) per milestone.' },
            { n: '04', title: 'Approve or Dispute', desc: 'Client approves to release funds. Dispute triggers arbiter workflow.' },
            { n: '05', title: 'Settlement', desc: 'Funds released atomically per the smart contract outcome — no manual steps.' },
          ].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
              className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.4)]">{step.n}</div>
              <div className="flex-1 flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-white">{step.title}</span>
                <span className="text-zinc-500 text-sm max-w-sm text-right hidden md:block">{step.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  /* 5 – Market */
  {
    id: 5,
    tag: 'MARKET',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<Globe2 className="w-4 h-4" />} label="Market Opportunity" color="emerald" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">A trillion-dollar trust problem.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { value: '$1.5T', label: 'Global Freelance Market (2025)', color: 'text-purple-400' },
            { value: '1.57B', label: 'Freelancers Worldwide', color: 'text-emerald-400' },
            { value: '~15%', label: 'Avg Platform Commission Taken', color: 'text-rose-400' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 + 0.2 }}
              className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center">
              <div className={`text-5xl font-black ${stat.color} mb-3`}>{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-10 text-zinc-400 text-base max-w-2xl">
          SafeSplit targets the <strong className="text-white">trust-deficit segment</strong> — cross-border freelancers who need cryptographic guarantees, not legal contracts.
        </motion.p>
      </div>
    ),
  },

  /* 6 – Competitive */
  {
    id: 6,
    tag: 'COMPETITIVE',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<BarChart3 className="w-4 h-4" />} label="Competition" color="blue" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">We don't compete — we replace.</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Feature', 'Upwork / Fiverr', 'Manual Crypto', 'SafeSplit'].map(h => (
                  <th key={h} className={`text-left py-3 px-4 font-bold ${h === 'SafeSplit' ? 'text-purple-400' : 'text-zinc-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['0% Fees', '✕', '✕', '✓'],
                ['Milestone-locked Funds', '✓ (centralized)', '✕', '✓ (on-chain)'],
                ['Decentralized Dispute', '✕', '✕', '✓'],
                ['3-5s Settlement', '✕', '✕', '✓'],
                ['Public Audit Trail', '✕', '✓', '✓'],
                ['No KYC Required', '✕', '✓', '✓'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-950/40 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className={`py-3 px-4 ${j === 0 ? 'text-zinc-300 font-medium' : j === 3 ? (cell === '✓' ? 'text-emerald-400 font-black text-base' : 'text-rose-500') : (cell === '✓' || cell.includes('✓') ? 'text-zinc-400' : 'text-zinc-700')}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },

  /* 7 – Technology */
  {
    id: 7,
    tag: 'TECH',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<Server className="w-4 h-4" />} label="Technology" color="purple" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">Enterprise-grade stack, open-source soul.</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { layer: 'Smart Contract', stack: 'Rust · Soroban SDK · Stellar Testnet', detail: 'Multi-party escrow with milestone gating and on-chain dispute resolution' },
            { layer: 'Frontend', stack: 'Next.js 16 · React · Tailwind CSS · TypeScript', detail: 'App Router with server components, fully responsive' },
            { layer: 'Backend', stack: 'Supabase · Prisma ORM · PostgreSQL', detail: 'Realtime subscriptions for chat, notifications, and escrow state sync' },
            { layer: 'Wallet', stack: 'Freighter · @stellar/stellar-sdk', detail: 'Non-custodial signing — private keys never leave the browser' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
              className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">{item.layer}</div>
              <div className="text-white font-bold mb-2">{item.stack}</div>
              <div className="text-zinc-500 text-xs leading-relaxed">{item.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  /* 8 – Traction */
  {
    id: 8,
    tag: 'TRACTION',
    render: () => (
      <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-5xl mx-auto w-full">
        <SlideLabel icon={<Users className="w-4 h-4" />} label="Traction" color="emerald" />
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-10">Real users. Real transactions.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { value: '60+', label: 'Test Wallet Users', color: 'text-purple-400' },
            { value: '100%', label: 'Build Success Rate', color: 'text-emerald-400' },
            { value: '$0', label: 'Platform Commission', color: 'text-amber-400' },
            { value: '5s', label: 'Avg Settlement Time', color: 'text-blue-400' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 + 0.2 }}
              className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <div className={`text-4xl font-black ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-zinc-500 text-xs uppercase tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-purple-950/20 border border-purple-800/30">
          <div className="text-purple-400 font-bold mb-1">User Feedback Highlights</div>
          <ul className="text-zinc-400 text-sm space-y-1">
            <li>✓ &quot;Real-time chat integration felt native — didn&apos;t need to leave the escrow page.&quot;</li>
            <li>✓ &quot;Zero fees is a huge deal for international contractors.&quot;</li>
            <li>✓ &quot;IPFS submission + GitHub PR tracking gives clients visible proof.&quot;</li>
          </ul>
        </motion.div>
      </div>
    ),
  },

  /* 9 – Vision / CTA */
  {
    id: 9,
    tag: 'VISION',
    render: () => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-8">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-sm font-black text-purple-400 uppercase tracking-widest mb-6">The Vision</div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 leading-tight">
            The infrastructure for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-emerald-400">the trustless economy.</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            SafeSplit is the foundation for a world where any two parties — anywhere on Earth — can transact fairly, without a trusted intermediary. We start with freelancing. We end with everything.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <button className="group px-10 py-4 rounded-full bg-white text-black font-extrabold text-base transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-2">
                <Rocket className="w-5 h-5" /> Try SafeSplit Now
              </button>
            </Link>
            <a href="https://github.com/RenzPao/SafeSplit" target="_blank" rel="noreferrer">
              <button className="px-10 py-4 rounded-full border border-zinc-700 hover:border-purple-500 text-white font-bold text-base transition-all flex items-center gap-2">
                View Source Code
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    ),
  },
];

/* ─── Slide Label Helper ───────────────────────────────────────────── */
function SlideLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  const colors: Record<string, string> = {
    rose: 'bg-rose-950/40 border-rose-800/40 text-rose-400',
    emerald: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400',
    purple: 'bg-purple-950/40 border-purple-800/40 text-purple-400',
    blue: 'bg-blue-950/40 border-blue-800/40 text-blue-400',
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest mb-6 ${colors[color]}`}>
      {icon}{label}
    </div>
  );
}

/* ─── Particle Background (lightweight version for pitchdeck) ───────── */
function PitchParticles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-purple-800/15 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-fuchsia-800/10 blur-[120px] animate-pulse [animation-delay:2s]" />
    </div>
  );
}

/* ─── Main Pitchdeck Page ─────────────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function PitchDeckPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(Math.max(0, Math.min(slides.length - 1, idx)));
  };
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current]);

  if (!mounted) return null;

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex flex-col overflow-hidden">
      <PitchParticles />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">{slide.tag}</span>
          <span className="text-zinc-700">{current + 1} / {slides.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="w-4 h-4" />
          <span className="font-bold text-sm text-white tracking-tight">SafeSplit</span>
        </div>
      </div>

      {/* Slide area */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 flex flex-col"
          >
            {slide.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-20 border-t border-white/5 bg-black/50 backdrop-blur-md px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-4 justify-between">
          {/* Prev */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-purple-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'}`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-zinc-700 text-[10px] mt-2 tracking-wider">Press ← → arrow keys to navigate</p>
      </div>
    </div>
  );
}
