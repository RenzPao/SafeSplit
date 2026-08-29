'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function CopyButton({ text, label, size = 'sm', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const sizeClasses = size === 'sm' ? 'p-1 text-[11px]' : 'p-1.5 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      className={`inline-flex items-center gap-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-all ${sizeClasses} ${className}`}
    >
      {copied ? (
        <Check className={`${iconSize} text-emerald-400`} />
      ) : (
        <Copy className={iconSize} />
      )}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  );
}
