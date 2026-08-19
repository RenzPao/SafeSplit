'use client';

import { ExternalLink } from 'lucide-react';

interface StellarExpertButtonProps {
  txHash: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const STELLAR_EXPERT_BASE = 'https://stellar.expert/explorer/testnet/tx/';

export default function StellarExpertButton({
  txHash,
  label = 'View on Stellar Expert',
  size = 'sm',
  className = '',
}: StellarExpertButtonProps) {
  const isOffChain =
    !txHash ||
    txHash === 'off-chain-init' ||
    txHash.startsWith('off-chain') ||
    txHash.startsWith('mock-cid');

  const url = `${STELLAR_EXPERT_BASE}${txHash}`;

  const sizeClasses =
    size === 'sm' ? 'px-3 py-1.5 text-[11px] gap-1.5' : 'px-4 py-2 text-xs gap-2';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (isOffChain) {
    return (
      <span
        title="This event was recorded off-chain and has no on-chain transaction."
        className={`inline-flex items-center font-semibold rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed ${sizeClasses} ${className}`}
      >
        <ExternalLink className={iconSize} />
        {label}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center font-semibold rounded-lg border border-purple-800/50 bg-purple-950/30 text-purple-400 hover:text-purple-300 hover:border-purple-600 hover:bg-purple-950/60 transition-all duration-200 group ${sizeClasses} ${className}`}
    >
      <ExternalLink
        className={`${iconSize} group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform`}
      />
      {label}
    </a>
  );
}
