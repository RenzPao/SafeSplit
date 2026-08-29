import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.05] border border-white/[0.02] ${className}`}
    />
  );
}
