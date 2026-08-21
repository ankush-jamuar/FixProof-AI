'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface VerifyRepairButtonProps {
  issueId: string;
  hasVerified: boolean;
}

export default function VerifyRepairButton({ issueId, hasVerified }: VerifyRepairButtonProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/verify/${issueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'AI verification failed. Please try again.');
      }

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'AI verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
          hasVerified
            ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/20 hover:scale-[1.01]'
        } disabled:opacity-50 disabled:pointer-events-none`}
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
            Executing 2nd-Stage Multimodal AI Verification...
          </>
        ) : hasVerified ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Run AI Verification Again
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Verify Repair Evidence with AI
          </>
        )}
      </button>

      {errorMessage && (
        <Toast
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
}
