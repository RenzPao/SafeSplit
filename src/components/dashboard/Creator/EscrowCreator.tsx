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
  HelpCircle,
  Link as LinkIcon
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

  // Calculate total budget
  const totalXlm = milestones.reduce((sum, m) => sum + (parseFloat(m.amount_xlm) || 0), 0);

  // ── Apply Preset SOW ─────────────────────────────────────────────
  const applyPreset = (presetId: string) => {
    const template = PRESET_TEMPLATES.find((t) => t.id === presetId);
    if (template) {
      setMilestones(template.milestones);
      setProjectTitle(`${template.label} Agreement`);
      toast.success('Preset Applied', `Loaded "${template.label}" milestone structure.`);
    }
  };

  // ── Add / Remove Milestones ──────────────────────────────────────
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

  // ── Add / Remove Subtask ─────────────────────────────────────────
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

  // ── Form Submission ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userWallet) {
      toast.error('Wallet Required', 'Please connect your Stellar wallet before creating an escrow.');
      return;
    }

    if (!freelancerAddress || !freelancerAddress.startsWith('G') || freelancerAddress.length !== 56) {
      toast.error('Invalid Address', 'Please provide a valid Stellar public key (starting with G) for the freelancer.');
      return;
    }

    if (totalXlm <= 0) {
      toast.error('Invalid Total', 'Total escrow balance must be greater than 0 XLM.');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Registering Agreement', 'Creating milestone terms and on-chain metadata hash...');

      const defaultArbiter = 'G0000000000000000000000000000000000000000000000000000000';
      const selectedArbiter = includeArbiter && arbiterAddress.trim() ? arbiterAddress.trim() : defaultArbiter;

      const createdResult = await createEscrowMetadata({
        title: projectTitle.trim() || 'Custom Escrow Agreement',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Top SOW Preset Selector Strip ───────────────────────── */}
      <div className="card-elevation p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Quick-Start Agreement Templates
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Auto-populates milestone structure</span>
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

      {/* ── Agreement Details & Parties ─────────────────────────── */}
      <div className="card-elevation p-5 rounded-xl space-y-4">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
          Agreement Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-300">Project / SOW Title</label>
            <input
              type="text"
              placeholder="e.g. Next.js SaaS Web App Development"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
              required
            />
          </div>

          {/* Client (You) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300">Client Address (Depositor)</label>
            <input
              type="text"
              value={userWallet}
              readOnly
              className="w-full bg-[#08090a] border border-white/[0.05] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-400 cursor-not-allowed select-none"
            />
          </div>

          {/* Freelancer */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300">Freelancer Address (Payee)</label>
            <input
              type="text"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={freelancerAddress}
              onChange={(e) => setFreelancerAddress(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
              required
            />
          </div>

          {/* Webhook Notifications (Optional) */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3 text-purple-400" />
              <span>Discord / Slack Webhook URL (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Arbiter Toggle */}
        <div className="pt-3 border-t border-white/[0.06] space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeArbiter}
              onChange={(e) => setIncludeArbiter(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500/20"
            />
            <span className="text-xs font-medium text-zinc-200">
              Assign a Neutral Mediator / Arbiter (Recommended for high-value agreements)
            </span>
          </label>

          {includeArbiter && (
            <div className="space-y-1.5 pl-6">
              <label className="text-[11px] font-semibold text-zinc-300">Arbiter Stellar Public Key</label>
              <input
                type="text"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={arbiterAddress}
                onChange={(e) => setArbiterAddress(e.target.value)}
                className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                required={includeArbiter}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Milestone Builder ───────────────────────────────────── */}
      <div className="card-elevation p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Milestone Breakdown ({milestones.length})
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Funds are held in Soroban and released per milestone approval.</p>
          </div>

          <button
            type="button"
            onClick={handleAddMilestone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        <div className="space-y-4">
          {milestones.map((m, mIdx) => (
            <div
              key={mIdx}
              className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.08] space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
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
                  className="flex-1 bg-[#12141a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-purple-500"
                  required
                />

                <div className="flex items-center gap-1.5">
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
                    className="w-24 bg-[#12141a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-100 text-right focus:outline-none focus:border-purple-500"
                    required
                  />
                  <span className="text-xs font-semibold text-purple-400">XLM</span>
                </div>

                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(mIdx)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Description */}
              <textarea
                placeholder="Scope of work, deliverables, and acceptance criteria..."
                value={m.description}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[mIdx].description = e.target.value;
                  setMilestones(updated);
                }}
                rows={2}
                className="w-full bg-[#12141a] border border-white/[0.08] rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
              />

              {/* Subtasks */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span>Sub-Tasks & Acceptance Criteria</span>
                  <button
                    type="button"
                    onClick={() => handleAddSubtask(mIdx)}
                    className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Subtask</span>
                  </button>
                </div>

                {m.subtasks.map((st, stIdx) => (
                  <div key={stIdx} className="flex items-center gap-2">
                    <span className="text-zinc-600 text-xs">•</span>
                    <input
                      type="text"
                      placeholder="e.g. Deliver responsive frontend components"
                      value={st.title}
                      onChange={(e) => {
                        const updated = [...milestones];
                        updated[mIdx].subtasks[stIdx].title = e.target.value;
                        setMilestones(updated);
                      }}
                      className="flex-1 bg-[#12141a] border border-white/[0.06] rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(mIdx, stIdx)}
                      className="text-zinc-600 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Summary & Submit Action ─────────────────────────────── */}
      <div className="card-elevation p-5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0d0f14]">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Agreement Budget</div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {totalXlm.toLocaleString()} <span className="text-sm font-sans font-medium text-purple-400">XLM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
            <span>Register Escrow Agreement</span>
          </button>
        </div>
      </div>
    </form>
  );
}
