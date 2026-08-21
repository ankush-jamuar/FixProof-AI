'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ShieldAlert } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface SupervisorVerificationReviewProps {
  issueId: string;
}

export default function SupervisorVerificationReview({ issueId }: SupervisorVerificationReviewProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/verify/${issueId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Supervisor review submission failed.');
      }

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Supervisor review submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-700/50 space-y-3">
      <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs">
        <ShieldAlert className="w-4 h-4 text-yellow-400" />
        SUPERVISOR DECISION REQUIRED &mdash; INCONCLUSIVE AI VERIFICATION
      </div>

      <p className="text-xs text-slate-300">
        AI verification returned inconclusive proof. Please review the before and after photos above and select a final resolution:
      </p>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => handleAction('APPROVE')}
          disabled={isSubmitting}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Approve Repair (Mark Verified)
        </button>

        <button
          onClick={() => handleAction('REJECT')}
          disabled={isSubmitting}
          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Reject Repair (Reopen Work Order)
        </button>
      </div>

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
