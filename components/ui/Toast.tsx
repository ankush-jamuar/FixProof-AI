'use client';

import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div
      className={`p-4 rounded-xl border text-xs shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
        isError
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="font-medium">{message}</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
