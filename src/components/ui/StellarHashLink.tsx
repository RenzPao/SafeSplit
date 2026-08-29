import React from 'react';
import { ExternalLink } from 'lucide-react';
import CopyButton from './CopyButton';

interface StellarHashLinkProps {
  hash: string;
  type?: 'tx' | 'contract' | 'account';
  truncate?: boolean;
  truncateLen?: number;
  showCopy?: boolean;
  className?: string;
}

export default function StellarHashLink({
  hash,
  type = 'tx',
  truncate = true,
  truncateLen = 6,
  showCopy = true,
  className = '',
}: StellarHashLinkProps) {
  if (!hash) return <span className="text-zinc-500 font-mono text-xs">—</span>;

  const isOffChain = hash.startsWith('off-chain') || hash.startsWith('mock');
  if (isOffChain) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <span>{hash}</span>
      </span>
    );
  }

  const base = type === 'contract' 
    ? 'https://stellar.expert/explorer/testnet/contract/'
    : type === 'account'
    ? 'https://stellar.expert/explorer/testnet/account/'
    : 'https://stellar.expert/explorer/testnet/tx/';

  const url = `${base}${hash}`;
  const display = truncate && hash.length > truncateLen * 2
    ? `${hash.slice(0, truncateLen)}...${hash.slice(-truncateLen)}`
    : hash;

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 hover:underline transition-colors group"
      >
        <span>{display}</span>
        <ExternalLink className="w-3 h-3 text-purple-400/70 group-hover:text-purple-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
      {showCopy && <CopyButton text={hash} size="sm" />}
    </span>
  );
}
