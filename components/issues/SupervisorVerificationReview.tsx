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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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

      if (action === 'APPROVE') {
        setSuccessMessage('Repair approved by supervisor — Status updated to VERIFIED & CLOSED');
      } else {
        setSuccessMessage('Repair rejected — work order reopened for technician retry');
      }

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Supervisor review submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-yellow-950/30 border border-yellow-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs">
          <ShieldAlert className="w-4 h-4 text-yellow-400" />
          SUPERVISOR DECISION REQUIRED &mdash; INCONCLUSIVE AI VERIFICATION
        </div>
        <span className="text-[10px] font-mono text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800 font-bold">
          HUMAN REVIEW
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-sans">
        AI verification returned inconclusive proof. Please review the before and after photos above and select a final resolution:
      </p>

      {successMessage ? (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleAction('APPROVE')}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve Repair (Mark Verified)
          </button>

          <button
            onClick={() => handleAction('REJECT')}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject Repair (Reopen Work Order)
          </button>
        </div>
      )}

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
