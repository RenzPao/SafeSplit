'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Copy, 
  Check, 
  HelpCircle, 
  Search, 
  ChevronDown
} from 'lucide-react';

export default function DeveloperWorkbench() {
  const [activeTab, setActiveTab] = useState<'rust' | 'typescript' | 'hashing'>('typescript');
  const [copied, setCopied] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const codeSnippets = {
    typescript: `// Initialize and deposit funds with SafeSplit TypeScript SDK
import { SafeSplitClient } from '@safesplit/sdk';

const client = new SafeSplitClient({
  network: 'testnet',
  contractAddress: 'CDA4KMIYSDXEK5SC6AA2S3ISPIJBOWWW3GBETD7KMJQRJWRKFSFQYZEU',
});

// 1. Create and fund escrow agreement
const txHash = await client.depositXlm({
  signer: userKeypair,
  escrowId: 'escrow_88fa10b',
  amountXlm: 5000,
});`,
    rust: `// Soroban Rust Smart Contract: Atomic Milestone Approval
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, String};

#[contract]
pub struct SafeSplitContract;

#[contractimpl]
impl SafeSplitContract {
    pub fn approve_milestone(env: Env, caller: Address, escrow_id: String, milestone_index: u32) {
        caller.require_auth();
        let mut config = Self::get_escrow(&env, &escrow_id);
        assert_eq!(caller, config.client, "Only client can approve");

        // Disburse funds atomically to freelancer
        let amount = config.milestones.get(milestone_index).unwrap().amount;
        token::Client::new(&env, &config.token).transfer(
            &env.current_contract_address(),
            &config.freelancer,
            &amount,
        );
    }
}`,
    hashing: `// SHA-256 SOW Terms Fingerprinting
import crypto from 'crypto';

function computeSowFingerprint(title: string, description: string, amountXlm: number): string {
  const payload = \`\${title.trim()}:\${description.trim()}:\${amountXlm}\`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}`,
  };

  const faqs = [
    {
      q: 'How does SafeSplit ensure funds cannot be stolen or rugged?',
      a: 'Funds are deposited into an autonomous Stellar Soroban smart contract instance. The bytecode enforces that funds can only be released upon client signature, refunded if mutually agreed, or split by the designated neutral Arbiter.',
    },
    {
      q: 'What fees does SafeSplit charge?',
      a: 'SafeSplit charges 0.00% protocol fees. You only pay standard Stellar network gas fees, which are roughly 0.00001 XLM (less than $0.000001) per transaction.',
    },
    {
      q: 'What happens if a freelancer disappears or misses a deadline?',
      a: 'If a milestone is never submitted, the client can initiate a refund for unstarted milestones. In 3-party escrows with an Arbiter, the Arbiter can evaluate the timeline and execute a 100% refund on-chain.',
    },
    {
      q: 'Which Stellar wallets are supported?',
      a: 'SafeSplit natively supports Freighter wallet and any WalletConnect-compatible Stellar mobile wallet (such as LOBSTR).',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      {/* ── 1. Developer SDK Workbench ─────────────────────────────── */}
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer SDK & Smart Contracts</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Built on Open Soroban Architecture
          </h2>
          <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Integrate SafeSplit milestone escrows programmatically with our TypeScript SDK or inspect the open-source Rust contract.
          </p>
        </div>

        {/* Code Console */}
        <div className="max-w-4xl mx-auto card-elevation rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#07090e] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#0d0f17] border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab('typescript')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all ${
                  activeTab === 'typescript'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
              <button
                onClick={() => setActiveTab('rust')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all ${
                  activeTab === 'rust'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Rust Contract
              </button>
              <button
                onClick={() => setActiveTab('hashing')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all ${
                  activeTab === 'hashing'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                SHA-256 SOW
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-[11px] sm:text-xs font-mono transition-colors border border-white/[0.06] min-h-[36px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-xs text-purple-200/90 overflow-x-auto min-h-[180px] max-w-full">
            <pre className="whitespace-pre leading-relaxed">{codeSnippets[activeTab]}</pre>
          </div>
        </div>
      </div>

      {/* ── 2. Searchable FAQ Accordion ────────────────────────────── */}
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pt-8 sm:pt-10 border-t border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span>Frequently Asked Questions</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Everything you need to know about SafeSplit security.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search protocol FAQ..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-[#0d0f17] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-zinc-500 shadow-inner min-h-[40px]"
            />
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-2.5 sm:space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#0b0d14]/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-zinc-200 hover:text-white transition-colors min-h-[48px]"
                >
                  <span className="pr-2">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-2.5 sm:pt-3 font-sans"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
