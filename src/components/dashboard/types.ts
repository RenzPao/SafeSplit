export interface Milestone {
  id: string;
  milestone_index: number;
  title: string;
  description: string;
  amount_xlm: number | string;
  status: string;
  deliverable_url?: string | null;
  submission_cid?: string | null;
  subtasks?: { id: string; title: string; is_completed: boolean }[];
  revisions?: { id: string; revision_number: number; deliverable_url: string; submitted_at: string; notes?: string }[];
}

export interface ActivityLog {
  id: string;
  tx_hash: string;
  event_name: string;
  timestamp: string;
  details?: string | null;
}

export interface Escrow {
  id: string;
  title?: string;
  contract_address: string;
  client_address: string;
  freelancer_address: string;
  arbiter_address?: string;
  total_xlm: number | string;
  status: string;
  created_at?: string;
  invoice_url?: string;
  webhook_url?: string;
  milestones: Milestone[];
  activity_logs?: ActivityLog[];
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  name: string;
  email?: string;
  social_link?: string;
  birthday?: string;
  reliability_score: number;
  completed_jobs: number;
  created_at: string;
}
