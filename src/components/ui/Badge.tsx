import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, XCircle, Check } from 'lucide-react';

export type StatusVariant = 
  | 'Initialized'
  | 'Pending'
  | 'Funded'
  | 'InProgress'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Disputed'
  | 'Resolved'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded'
  | 'client'
  | 'freelancer'
  | 'arbiter';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export default function Badge({ status, size = 'sm', showIcon = true, className = '' }: BadgeProps) {
  const normalized = (status || '').toLowerCase().replace(/[\s_-]/g, '');

  let label = status;
  let colorStyles = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let Icon = Clock;

  switch (normalized) {
    case 'initialized':
    case 'pending':
    case 'pendingdeposit':
      label = 'Pending Deposit';
      colorStyles = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      Icon = Clock;
      break;

    case 'funded':
      label = 'Funded & Active';
      colorStyles = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      Icon = CheckCircle2;
      break;

    case 'inprogress':
      label = 'In Progress';
      colorStyles = 'bg-sky-500/10 text-sky-300 border-sky-500/20';
      Icon = Clock;
      break;

    case 'submitted':
    case 'underreview':
    case 'inreview':
      label = 'In Review';
      colorStyles = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      Icon = Clock;
      break;

    case 'approved':
    case 'completed':
      label = normalized === 'approved' ? 'Approved & Paid' : 'Completed';
      colorStyles = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      Icon = CheckCircle2;
      break;

    case 'disputed':
      label = 'Disputed';
      colorStyles = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      Icon = ShieldAlert;
      break;

    case 'resolved':
      label = 'Arbiter Settled';
      colorStyles = 'bg-teal-500/10 text-teal-300 border-teal-500/20';
      Icon = Check;
      break;

    case 'cancelled':
    case 'refunded':
      label = normalized === 'refunded' ? 'Refunded' : 'Cancelled';
      colorStyles = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      Icon = XCircle;
      break;

    case 'client':
      label = 'Client';
      colorStyles = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      Icon = CheckCircle2;
      break;

    case 'freelancer':
      label = 'Freelancer';
      colorStyles = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      Icon = CheckCircle2;
      break;

    case 'arbiter':
      label = 'Mediator / Arbiter';
      colorStyles = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      Icon = ShieldAlert;
      break;
  }

  const sizeStyles = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px] gap-1.5' 
    : 'px-2.5 py-1 text-xs gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-tight shrink-0 select-none ${sizeStyles} ${colorStyles} ${className}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{label}</span>
    </span>
  );
}
