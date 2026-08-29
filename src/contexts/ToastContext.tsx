'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, ExternalLink, X, Loader2 } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading' | 'tx';
  title: string;
  message?: string;
  txHash?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    loading: (title: string, message?: string) => string;
    tx: (title: string, txHash: string, message?: string) => string;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    if (toast.type !== 'loading') {
      const timeout = toast.duration || 5000;
      setTimeout(() => {
        dismiss(id);
      }, timeout);
    }
    return id;
  }, [dismiss]);

  const toastHelpers = {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message, duration: 7000 }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
    loading: (title: string, message?: string) => addToast({ type: 'loading', title, message }),
    tx: (title: string, txHash: string, message?: string) => addToast({ type: 'tx', title, txHash, message, duration: 8000 }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers }}>
      {children}
      {/* Toast Render Viewport */}
      <div className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-[#12141a] border border-white/[0.1] shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            {t.type === 'loading' && <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0 mt-0.5" />}
            {t.type === 'tx' && <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-100">{t.title}</h4>
              {t.message && <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{t.message}</p>}
              {t.txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${t.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 mt-1.5 underline underline-offset-2"
                >
                  <span>{t.txHash.slice(0, 8)}...{t.txHash.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
