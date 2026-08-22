'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, UserCheck, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { IssueCategory } from '@/types/domain';

interface SupervisorOverrideProps {
  issueId: string;
  aiCategory?: IssueCategory | null;
}

export default function SupervisorOverride({ issueId, aiCategory }: SupervisorOverrideProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>(aiCategory || 'plumbing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDispatch = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          supervisorOverrideCategory: selectedCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to dispatch work order.');
      }

      const techName = data.data?.assignedTechnician?.name || data.data?.technicianName || 'Technician';

      setSuccessMessage(`Supervisor override approved: Work order dispatched to ${techName} (${selectedCategory.toUpperCase()})`);

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch work order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-700/40 space-y-4">
      <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        SUPERVISOR ACTION REQUIRED &mdash; ROUTING DISPATCH
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-sans">
        Select or confirm the issue category below to approve dispatch and assign an active technician.
      </p>

      {successMessage ? (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Confirmed Category:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['plumbing', 'electrical', 'cleaning'] as IssueCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDispatch}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Dispatching Work Order...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Approve & Dispatch Work Order
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </>
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
