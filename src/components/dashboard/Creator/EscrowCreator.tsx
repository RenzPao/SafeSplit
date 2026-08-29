'use client';

import React, { useState } from 'react';
import { 
  FilePlus, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Zap, 
  RefreshCw, 
  Layers,
  ArrowRight,
  ArrowLeft,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { createEscrowMetadata } from '@/lib/stellar/supabaseBackend';
import { useWallet } from '@/contexts/WalletContext';

interface MilestoneDraft {
  title: string;
  description: string;
  amount_xlm: string;
  subtasks: { title: string }[];
}

const PRESET_TEMPLATES = [
  {
    id: 'web-dev',
    label: 'Full-Stack Web App',
    desc: '3-stage delivery: Architecture & DB, MVP Core, Testing & Deployment',
    milestones: [
      {
        title: 'Stage 1: Architecture & Database Design',
        description: 'System schema design, database migrations, authentication setup, and project scaffold.',
        amount_xlm: '3000',
        subtasks: [{ title: 'Database ERD & Schema Migration' }, { title: 'Auth & Session Integration' }],
      },
      {
        title: 'Stage 2: Core Feature MVP',
        description: 'Primary workflow development, dashboard UI, and CRUD endpoints.',
        amount_xlm: '4500',
        subtasks: [{ title: 'Main Dashboard & Workspace Views' }, { title: 'REST / GraphQL API Endpoints' }],
      },
      {
        title: 'Stage 3: Testing, Security & Production Deployment',
        description: 'End-to-end testing, security audits, performance profiling, and live cloud deployment.',
        amount_xlm: '2500',
        subtasks: [{ title: 'Integration Test Suite' }, { title: 'Production Domain & SSL Setup' }],
      },
    ],
  },
  {
    id: 'smart-contract',
    label: 'Smart Contract Audit & SOW',
    desc: '2-stage delivery: In-depth Rust/Soroban analysis and final remediation report',
    milestones: [
      {
        title: 'Stage 1: Vulnerability & Logic Analysis',
        description: 'Formal verification, authorization boundary checks, and invariant testing.',
        amount_xlm: '5000',
        subtasks: [{ title: 'Static Analysis & Fuzzing' }, { title: 'Auth & Reentrancy Review' }],
      },
      {
        title: 'Stage 2: Remediation Verification & Final Report',
        description: 'Review of developer fixes, gas profiling, and signed audit certificate.',
        amount_xlm: '3000',
        subtasks: [{ title: 'Fix Verification' }, { title: 'Executive Summary Delivery' }],
      },
    ],
  },
];

interface EscrowCreatorProps {
  userWallet: string;
  onCreated: (newEscrowId: string) => void;
  onCancel: () => void;
}

export default function EscrowCreator({ userWallet, onCreated, onCancel }: EscrowCreatorProps) {
  const { toast } = useToast();
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [includeArbiter, setIncludeArbiter] = useState(false);
  const [arbiterAddress, setArbiterAddress] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    {
      title: 'Milestone 1: Design & Foundation',
      description: 'Initial architectural setup, wireframes, and design specs.',
      amount_xlm: '2500',
      subtasks: [{ title: 'Initial Project Scaffolding' }, { title: 'Figma UI Wireframe Approval' }],
    },
    {
      title: 'Milestone 2: Final Delivery',
      description: 'Core functionality completion and production deployment.',
      amount_xlm: '2500',
      subtasks: [{ title: 'Feature Implementation' }, { title: 'QA & Final Review' }],
    },
  ]);

  // Derived Values
  const totalXlm = milestones.reduce((sum, m) => sum + (parseFloat(m.amount_xlm) || 0), 0);
  const totalSteps = 4;

  // ── Validation & Navigation ──────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (!projectTitle.trim()) {
        toast.error('Required', 'Please enter a project title before proceeding.');
        return;
      }
    }
    if (step === 2) {
      if (!freelancerAddress || !freelancerAddress.startsWith('G') || freelancerAddress.length !== 56) {
        toast.error('Invalid Address', 'Please provide a valid Stellar public key for the freelancer.');
        return;
      }
      if (includeArbiter && (!arbiterAddress || !arbiterAddress.startsWith('G') || arbiterAddress.length !== 56)) {
        toast.error('Invalid Address', 'Please provide a valid Stellar public key for the arbiter.');
        return;
      }
    }
    if (step === 3) {
      if (milestones.length === 0 || totalXlm <= 0) {
        toast.error('Invalid Milestones', 'You must have at least one milestone with a valid XLM amount.');
        return;
      }
      for (const m of milestones) {
        if (!m.title.trim() || !(parseFloat(m.amount_xlm) > 0)) {
           toast.error('Invalid Milestones', 'All milestones must have a title and an XLM amount greater than 0.');
           return;
        }
      }
    }

    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // ── Handlers ─────────────────────────────────────────────────────
  const applyPreset = (presetId: string) => {
    const template = PRESET_TEMPLATES.find((t) => t.id === presetId);
    if (template) {
      setMilestones(template.milestones);
      setProjectTitle(`${template.label} Agreement`);
      toast.success('Preset Applied', `Loaded "${template.label}" milestone structure.`);
    }
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        description: '',
        amount_xlm: '1000',
        subtasks: [{ title: 'Subtask 1' }],
      },
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    if (milestones.length <= 1) {
      toast.error('Requirement', 'An escrow agreement must have at least 1 milestone.');
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleAddSubtask = (milestoneIdx: number) => {
    const updated = [...milestones];
    updated[milestoneIdx].subtasks.push({ title: '' });
    setMilestones(updated);
  };

  const handleRemoveSubtask = (milestoneIdx: number, subtaskIdx: number) => {
    const updated = [...milestones];
    updated[milestoneIdx].subtasks = updated[milestoneIdx].subtasks.filter((_, i) => i !== subtaskIdx);
    setMilestones(updated);
  };

  const handleSubmit = async () => {
    if (!userWallet) {
      toast.error('Wallet Required', 'Please connect your Stellar wallet before creating an escrow.');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Registering Agreement', 'Creating milestone terms and on-chain metadata hash...');

      const defaultArbiter = 'G0000000000000000000000000000000000000000000000000000000';
      const selectedArbiter = includeArbiter && arbiterAddress.trim() ? arbiterAddress.trim() : defaultArbiter;

      const createdResult = await createEscrowMetadata({
        title: projectTitle.trim(),
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'CDA4KMIYSDXEK5SC6AA2S3ISPIJBOWWW3GBETD7KMJQRJWRKFSFQYZEU',
        clientAddress: userWallet,
        freelancerAddress: freelancerAddress.trim(),
        arbiterAddress: selectedArbiter,
        totalXlm: totalXlm,
        milestones: milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amountXlm: parseFloat(m.amount_xlm) || 0,
          subTasks: m.subtasks.filter((s) => s.title.trim()).map((s) => s.title),
        })),
        webhookUrl: webhookUrl.trim() || undefined,
      });

      const newId = createdResult.escrow.id;
      toast.success('Escrow Agreement Registered!', `Created deal #${newId.slice(0, 8)}.`);
      onCreated(newId);
    } catch (err: any) {
      toast.error('Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render Steps ─────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Quick-Start Templates (Optional)
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyPreset(tpl.id)}
              className="p-3.5 rounded-lg bg-[#0d0f14] border border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.02] text-left transition-all group"
            >
              <div className="font-semibold text-xs text-zinc-200 group-hover:text-purple-300 transition-colors">
                {tpl.label}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                {tpl.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4">
          Agreement Basics
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300">Project / SOW Title</label>
            <input
              type="text"
              placeholder="e.g. Next.js SaaS Web App Development"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 transition-colors"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3 text-purple-400" />
              <span>Discord / Slack Webhook URL (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 transition-colors"
            />
            <p className="text-[10px] text-zinc-500">Receive automated notifications when milestones are submitted or approved.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4">
          Counterparties
        </h3>
        <p className="text-[11px] text-zinc-400 mb-4">
          Define the participants in this agreement. You are automatically set as the Client (Depositor).
        </p>
        
        <div className="space-y-4">
          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Client Address (Depositor)
            </label>
            <input
              type="text"
              value={userWallet}
              readOnly
              className="w-full bg-[#08090a] border border-white/[0.05] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-500 cursor-not-allowed select-none"
            />
          </div>

          {/* Freelancer */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Freelancer Address (Payee)
            </label>
            <input
              type="text"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={freelancerAddress}
              onChange={(e) => setFreelancerAddress(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 transition-colors"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.06] space-y-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${includeArbiter ? 'bg-purple-600 border-purple-500' : 'bg-[#0d0f14] border-white/[0.1] group-hover:border-purple-500/50'}`}>
            {includeArbiter && <Check className="w-3 h-3 text-white" />}
          </div>
          <input
            type="checkbox"
            checked={includeArbiter}
            onChange={(e) => setIncludeArbiter(e.target.checked)}
            className="hidden"
          />
          <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
            Assign a Neutral Arbiter (Recommended for large agreements)
          </span>
        </label>

        {includeArbiter && (
          <div className="space-y-1.5 pl-6 animate-in fade-in duration-200">
            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Arbiter Stellar Public Key
            </label>
            <input
              type="text"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={arbiterAddress}
              onChange={(e) => setArbiterAddress(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[10px] text-zinc-500">The arbiter can resolve disputes by splitting funds between the client and freelancer.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Milestone Breakdown
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Funds are held in Soroban and released per milestone approval.</p>
        </div>
        <button
          type="button"
          onClick={handleAddMilestone}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] text-xs font-medium text-zinc-200 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Milestone</span>
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {milestones.map((m, mIdx) => (
          <div
            key={mIdx}
            className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.08] space-y-3 relative group"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {mIdx + 1}
              </span>
              <input
                type="text"
                placeholder={`Milestone ${mIdx + 1} Title`}
                value={m.title}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[mIdx].title = e.target.value;
                  setMilestones(updated);
                }}
                className="flex-1 bg-[#12141a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="XLM"
                  value={m.amount_xlm}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[mIdx].amount_xlm = e.target.value;
                    setMilestones(updated);
                  }}
                  className="w-24 bg-[#12141a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-100 text-right focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-xs font-semibold text-purple-400">XLM</span>
              </div>
              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(mIdx)}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <textarea
              placeholder="Scope of work, deliverables, and acceptance criteria..."
              value={m.description}
              onChange={(e) => {
                const updated = [...milestones];
                updated[mIdx].description = e.target.value;
                setMilestones(updated);
              }}
              rows={2}
              className="w-full bg-[#12141a] border border-white/[0.08] rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 transition-colors"
            />

            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span>Sub-Tasks (Acceptance Criteria)</span>
                <button
                  type="button"
                  onClick={() => handleAddSubtask(mIdx)}
                  className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Subtask</span>
                </button>
              </div>
              {m.subtasks.map((st, stIdx) => (
                <div key={stIdx} className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-zinc-700 rounded-sm shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Deliver responsive frontend components"
                    value={st.title}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[mIdx].subtasks[stIdx].title = e.target.value;
                      setMilestones(updated);
                    }}
                    className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50 rounded px-2 py-1 transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(mIdx, stIdx)}
                    className="text-zinc-600 hover:text-rose-400 p-1 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between p-4 bg-[#0d0f14] border border-white/[0.05] rounded-xl">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Value</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-mono font-bold text-white">{totalXlm.toLocaleString()}</span>
          <span className="text-xs font-semibold text-purple-400">XLM</span>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center space-y-2 mb-6">
        <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto opacity-80" />
        <h3 className="text-lg font-semibold text-white">Review & Deploy</h3>
        <p className="text-xs text-zinc-400">Please review the final terms of your Smart Escrow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summary Details */}
        <div className="space-y-4">
          <div className="p-4 bg-[#0d0f14] border border-white/[0.08] rounded-xl space-y-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Project Title</span>
              <p className="text-sm font-medium text-white truncate">{projectTitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Freelancer</span>
                <p className="text-[11px] font-mono text-purple-300 truncate" title={freelancerAddress}>
                  {freelancerAddress.slice(0, 8)}...{freelancerAddress.slice(-4)}
                </p>
              </div>
              {includeArbiter && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Arbiter</span>
                  <p className="text-[11px] font-mono text-emerald-300 truncate" title={arbiterAddress}>
                    {arbiterAddress.slice(0, 8)}...{arbiterAddress.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-[#0d0f14] border border-white/[0.08] rounded-xl space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Financials</span>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Total Budget</span>
              <span className="font-mono font-bold text-white">{totalXlm.toLocaleString()} XLM</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Platform Fee</span>
              <span className="font-mono text-zinc-400">0.00 XLM</span>
            </div>
          </div>
        </div>

        {/* Milestone Summary Timeline */}
        <div className="p-4 bg-[#0d0f14] border border-white/[0.08] rounded-xl space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold sticky top-0 bg-[#0d0f14] pb-2 z-10 block">
            Milestone Schedule ({milestones.length})
          </span>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-white/[0.05]">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#12141a] border-2 border-purple-500/30 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{m.title}</span>
                    <span className="text-[11px] font-mono text-purple-300">{m.amount_xlm} XLM</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card-elevation rounded-2xl overflow-hidden flex flex-col bg-[#08090a]">
      {/* ── Wizard Header / Step Indicator ────────────────────── */}
      <div className="border-b border-white/[0.05] p-5 md:p-6 bg-[#0d0f14]">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/[0.05] -z-10 -translate-y-1/2" />
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Parties' },
            { num: 3, label: 'Milestones' },
            { num: 4, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-[#0d0f14] px-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.num 
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                  : step > s.num 
                    ? 'bg-purple-900/40 text-purple-400 border border-purple-500/30'
                    : 'bg-[#12141a] text-zinc-600 border border-white/[0.05]'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${
                step === s.num ? 'text-zinc-200' : step > s.num ? 'text-purple-400/80' : 'text-zinc-600'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Wizard Content Body ───────────────────────────────── */}
      <div className="p-5 md:p-6 min-h-[350px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* ── Wizard Footer Navigation ──────────────────────────── */}
      <div className="border-t border-white/[0.05] p-4 md:px-6 bg-[#0d0f14] flex items-center justify-between">
        <button
          type="button"
          onClick={step === 1 ? onCancel : handleBack}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-transparent hover:bg-white/[0.05] text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {step === 1 ? (
            'Cancel'
          ) : (
            <>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </>
          )}
        </button>

        <button
          type="button"
          onClick={step === totalSteps ? handleSubmit : handleNext}
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {step === totalSteps ? (
            isSubmitting ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deploying...</>
            ) : (
              <><FilePlus className="w-3.5 h-3.5" /> Sign & Deploy</>
            )
          ) : (
            <>Next Step <ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
