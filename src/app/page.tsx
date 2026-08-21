'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, MessagesSquare, CheckCircle, Lock, Server, Rocket, GitBranch, ShieldAlert, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';

/* ─── Particle Canvas Background ─────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Mouse repulsion
        const dx = p.x - mx; const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { p.vx += dx / dist * 0.1; p.vy += dy / dist * 0.1; }
        // Dampen velocity
        p.vx *= 0.99; p.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x; const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.15 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />;
}

/* ─── Mouse Glow Cursor ───────────────────────────────────────────── */
function MouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX - 200); y.set(e.clientY - 200); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      style={{ left: sx, top: sy }}
      className="fixed z-0 w-[400px] h-[400px] rounded-full pointer-events-none"
      aria-hidden
    >
      <div className="w-full h-full rounded-full bg-purple-600/10 blur-[80px]" />
    </motion.div>
  );
}

/* ─── Floating Orb ────────────────────────────────────────────────── */
function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] opacity-30 ${className}`} />;
}

/* ─── Glowing Card ────────────────────────────────────────────────── */
function GlowCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0, opacity: 0 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
  }, []);
  const onMouseLeave = useCallback(() => setGlowPos(p => ({ ...p, opacity: 0 })), []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay, duration: 0.5 }}
      className={`relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800/60 ${className}`}
    >
      {/* Mouse-tracked inner glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(350px circle at ${glowPos.x}px ${glowPos.y}px, rgba(139,92,246,0.12), transparent 60%)`,
          opacity: glowPos.opacity,
        }}
      />
      {children}
    </motion.div>
  );
}

/* ─── Marquee ─────────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  { label: 'Escrow #CD4A Funded: 5,000 XLM', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { label: 'Milestone 2 Approved', color: 'text-purple-400', dot: 'bg-purple-400' },
  { label: 'Contract CC6QL... Deployed to Soroban', color: 'text-zinc-400', dot: 'bg-zinc-400' },
  { label: 'Arbiter Assigned · Escrow #9F2C', color: 'text-rose-400', dot: 'bg-rose-400' },
  { label: 'Freelancer Submitted Deliverable', color: 'text-blue-400', dot: 'bg-blue-400' },
  { label: 'Dispute Resolved · 70/30 Split', color: 'text-fuchsia-400', dot: 'bg-fuchsia-400' },
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden flex items-center py-5 bg-purple-950/20 border-y border-purple-500/10">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10" />
      <motion.div
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        className="flex whitespace-nowrap gap-16 font-mono text-xs"
      >
        {items.map((item, i) => (
          <span key={i} className={`flex items-center gap-2 ${item.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
            {item.label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Counter Stat ────────────────────────────────────────────────── */
function CountStat({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-black text-white tracking-tight">{value}</div>
      <div className="text-zinc-500 text-sm mt-1 uppercase tracking-wider font-semibold">{label}</div>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.5], ['0%', '20%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 overflow-x-hidden selection:bg-purple-500/30">
      <ParticleCanvas />
      <MouseGlow />

      {/* Fixed ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <FloatingOrb className="w-[700px] h-[700px] bg-purple-700/20 top-[-300px] left-[-200px] animate-pulse" />
        <FloatingOrb className="w-[500px] h-[500px] bg-fuchsia-700/15 bottom-[10%] right-[-150px] animate-pulse [animation-delay:1.5s]" />
        <FloatingOrb className="w-[400px] h-[400px] bg-emerald-700/15 bottom-[-100px] left-[20%] animate-pulse [animation-delay:3s]" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/40 group-hover:bg-purple-600/40 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300">
              <ShieldCheck className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">SafeSplit</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            {['Features', 'How It Works', 'Tech'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-white transition-colors duration-200">{link}</a>
            ))}
            <Link href="/pitchdeck" className="hover:text-white transition-colors duration-200">Pitch Deck</Link>
          </div>

          <Link href="/dashboard">
            <button className="relative group px-5 py-2 rounded-full bg-white text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_0px_rgba(255,255,255,0)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <span className="flex items-center gap-1.5">Launch App <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-52 pb-36 px-6 flex flex-col items-center text-center">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold mb-8 tracking-widest uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            Live on Stellar Testnet · Soroban Smart Contracts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white leading-[0.95] mb-8"
          >
            Trustless Escrow.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-emerald-400">
              Guaranteed Work.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-12"
          >
            Lock freelance capital on-chain. Release funds only when milestones are met. Zero fees. Instant settlement. Powered by Stellar Soroban.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <button className="group px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-all duration-300 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.9)] flex items-center gap-2">
                Start an Escrow <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="https://github.com/RenzPao/SafeSplit" target="_blank" rel="noreferrer">
              <button className="px-8 py-4 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-bold text-base transition-all duration-300 flex items-center gap-2">
                <GitBranch className="w-5 h-5" /> View Source
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Glowing line divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-purple-500/50 to-transparent"
        />
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 py-20 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <CountStat value="~$0" label="Platform Fees" />
          <CountStat value="3-5s" label="Settlement Time" />
          <CountStat value="2 / 3" label="Party Escrow Types" />
          <CountStat value="60+" label="Test Wallets" />
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">The Paradigm Shift</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Legacy platforms extract value. SafeSplit amplifies it.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <GlowCard className="p-10 border-rose-900/30 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-900/50 flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-6">Legacy Platforms</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              {['10%–20% commission', 'Days/weeks to settle', 'Biased internal dispute teams', 'Opaque ledgers', 'Geographic restrictions'].map(item => (
                <li key={item} className="flex items-center gap-3"><span className="text-rose-500 font-bold text-base">✕</span>{item}</li>
              ))}
            </ul>
          </GlowCard>

          <GlowCard className="p-10 border-purple-500/30" delay={0.1}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full" />
            <div className="w-12 h-12 rounded-2xl bg-purple-900/30 border border-purple-500/40 flex items-center justify-center mb-6 relative z-10">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-6 relative z-10">SafeSplit Protocol</h3>
            <ul className="space-y-4 text-zinc-300 text-sm relative z-10">
              {['0% commission — forever', 'Sub-5s Stellar settlement', 'Neutral decentralized arbiters', 'Immutable Soroban state', 'Globally accessible'].map(item => (
                <li key={item} className="flex items-center gap-3"><span className="text-emerald-400 font-bold text-base">✓</span>{item}</li>
              ))}
            </ul>
          </GlowCard>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="how-it-works" className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold text-white tracking-tight text-center mb-16"
        >
          Engineered for Absolute Trust.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[220px]">
          <GlowCard className="md:col-span-2 p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Milestone Architecture</h3>
              <p className="text-zinc-400 text-sm max-w-md">Break projects into programmatic milestones. Client funds are locked in a Soroban contract and atomically released upon cryptographic approval.</p>
            </div>
            <div className="flex gap-2 mt-4">
              {['Initialize', 'Fund', 'Submit', 'Approve', 'Release'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border ${i === 3 ? 'bg-purple-500 border-purple-400 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>{i + 1}</div>
                    <span className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wide">{step}</span>
                  </div>
                  {i < 4 && <div className="w-6 h-px bg-zinc-800 mb-3" />}
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="p-8 flex flex-col justify-between" delay={0.1}>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Stellar Speed</h3>
              <p className="text-zinc-400 text-sm">3–5 second finality. Fractions of a cent per tx. No banks. No borders.</p>
            </div>
            <div className="text-4xl font-black text-emerald-400/40 text-right tracking-tighter">3s</div>
          </GlowCard>

          <GlowCard className="p-8 flex flex-col justify-between" delay={0.15}>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <MessagesSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Realtime Chat</h3>
              <p className="text-zinc-400 text-sm">Supabase-powered instant chat for Client, Freelancer & Arbiter — all within the escrow.</p>
            </div>
          </GlowCard>

          <GlowCard className="md:col-span-2 p-8 flex flex-col justify-between" delay={0.2}>
            <div className="absolute inset-0 flex items-center justify-end pointer-events-none overflow-hidden rounded-3xl">
              <Lock className="w-40 h-40 text-fuchsia-900/30 mr-4" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Decentralized Arbitration</h3>
              <p className="text-zinc-400 text-sm max-w-md">3-party escrow configuration. Arbiters can enforce custom split settlements (e.g. 70/30) via signed on-chain transactions — no middleman required.</p>
            </div>
          </GlowCard>

          <GlowCard className="p-8 flex flex-col justify-between" delay={0.25}>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Server className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">IPFS Deliverables</h3>
              <p className="text-zinc-400 text-sm">Freelancers can submit GitHub PR links or IPFS CIDs as immutable proof-of-work.</p>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── TECH STACK ── */}
      <section id="tech" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Built on the Frontier.</h2>
          <p className="text-zinc-500">Every layer chosen for security, performance, and decentralization.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Stellar / Soroban', desc: 'Smart contract layer', color: 'from-purple-900/40 to-purple-950/80', border: 'border-purple-800/40' },
            { label: 'Next.js 16', desc: 'App router + RSC', color: 'from-zinc-900/40 to-zinc-950/80', border: 'border-zinc-700/40' },
            { label: 'Supabase', desc: 'Realtime + Postgres', color: 'from-emerald-900/30 to-emerald-950/80', border: 'border-emerald-800/40' },
            { label: 'Freighter', desc: 'Wallet integration', color: 'from-blue-900/30 to-blue-950/80', border: 'border-blue-800/40' },
          ].map((tech, i) => (
            <motion.div
              key={tech.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`p-6 rounded-2xl bg-gradient-to-b ${tech.color} border ${tech.border}`}
            >
              <div className="text-white font-bold mb-1">{tech.label}</div>
              <div className="text-zinc-500 text-sm">{tech.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS TIMELINE ── */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-extrabold text-white tracking-tight text-center mb-20">
          How It Works
        </motion.h2>
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/60 via-purple-500/20 to-transparent" />
          {[
            { step: '01', title: 'Create Agreement', desc: 'Client defines milestones, amounts, and assigns the Freelancer (and optional Arbiter).' },
            { step: '02', title: 'Lock Funds', desc: 'Client deploys a Soroban contract and deposits total XLM. Funds are locked — immutably.' },
            { step: '03', title: 'Submit Work', desc: 'Freelancer uploads deliverables (GitHub PR / IPFS CID). Status recorded on-chain.' },
            { step: '04', title: 'Approve & Release', desc: 'Client verifies and approves. Soroban contract atomically releases the milestone payment.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className={`relative mb-16 flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
            >
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 border-2 border-purple-400 text-white text-xs font-black shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                {i + 1}
              </div>
              <div className={`bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex-1 ${i % 2 === 0 ? 'md:mr-[calc(50%+2rem)]' : 'md:ml-[calc(50%+2rem)]'}`}>
                <div className="text-xs font-black text-purple-400 tracking-widest uppercase mb-1">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-40 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-900/30 to-transparent blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10">
          <p className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-4">Get started today</p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Secure your next<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">project, forever.</span>
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto mb-12 text-lg">Connect your Stellar wallet and deploy a trustless escrow in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <button className="group px-10 py-5 rounded-full bg-white text-black font-extrabold text-base transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-3">
                <Rocket className="w-5 h-5" /> Launch SafeSplit
              </button>
            </Link>
            <Link href="/pitchdeck">
              <button className="px-10 py-5 rounded-full border border-zinc-700 hover:border-purple-500 text-white font-bold text-base transition-all duration-300 flex items-center gap-3">
                <Star className="w-5 h-5 text-purple-400" /> View Pitch Deck
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-600">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tight">SafeSplit © 2026</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-600">
            {[
              { label: 'Stellar Network', href: 'https://stellar.org' },
              { label: 'Soroban Docs', href: 'https://soroban.stellar.org' },
              { label: 'GitHub', href: 'https://github.com/RenzPao/SafeSplit' },
              { label: 'Pitch Deck', href: '/pitchdeck' },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-white transition-colors">{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
