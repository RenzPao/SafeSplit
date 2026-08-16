import React, { useState } from 'react';
import { UserPlus, Loader2, Calendar, Mail, Link } from 'lucide-react';

interface RegistrationModalProps {
  walletAddress: string;
  onComplete: (user: any) => void;
}

export default function RegistrationModal({ walletAddress, onComplete }: RegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [socialLink, setSocialLink] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload: any = { name: name.trim() };
      if (email.trim()) payload.email = email.trim();
      if (socialLink.trim()) payload.social_link = socialLink.trim();
      if (birthday) {
        // Convert YYYY-MM-DD to ISO DateTime for Supabase
        payload.birthday = new Date(birthday).toISOString();
      }

      const res = await fetch(`/api/users/${encodeURIComponent(walletAddress)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to register');
      }

      onComplete(data.user);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />
        
        <div className="relative">
          <div className="w-14 h-14 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
            <UserPlus className="w-7 h-7 text-purple-400" />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Complete your profile</h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Welcome to SafeSplit! Please set up your basic profile before proceeding. Your name will be visible to other parties in escrows.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Display Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Satoshi Nakamoto"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Birthday (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-zinc-600 custom-calendar-picker"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Social / Portfolio Link (Optional)</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full mt-6 h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
