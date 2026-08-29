'use client';

import React, { useState } from 'react';
import { UserPlus, Loader2, Calendar, Mail, Link as LinkIcon, User } from 'lucide-react';

interface RegistrationModalProps {
  walletAddress: string;
  onSuccess?: () => void;
  onComplete?: (user: any) => void;
}

export default function RegistrationModal({ walletAddress, onSuccess, onComplete }: RegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [socialLink, setSocialLink] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Display name is required');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload: any = { name: name.trim() };
      if (email.trim()) payload.email = email.trim();
      if (socialLink.trim()) payload.social_link = socialLink.trim();
      if (birthday) {
        payload.birthday = new Date(birthday).toISOString();
      }

      const res = await fetch(`/api/users/${encodeURIComponent(walletAddress)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to register profile');
      }

      if (onSuccess) onSuccess();
      if (onComplete) onComplete(data.user);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#12141a] border border-white/[0.1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5 border border-purple-500/20 text-purple-400">
          <UserPlus className="w-6 h-6" />
        </div>
        
        <h2 className="text-xl font-bold text-zinc-100 mb-1">Create Your SafeSplit Profile</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Set up your verified display name tied to your Stellar wallet address (<span className="font-mono text-zinc-300">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300">
              Display Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Date of Birth (Optional)</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300">Portfolio / GitHub Link (Optional)</label>
            <input
              type="url"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Complete Registration</span>
          </button>
        </form>
      </div>
    </div>
  );
}
