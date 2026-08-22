'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface AgentDispatchButtonProps {
  issueId: string;
}

export default function AgentDispatchButton({ issueId }: AgentDispatchButtonProps) {
  const router = useRouter();
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDispatch = async () => {
    setIsDispatching(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'AI Agent dispatch failed.');
      }

      const techName = data.data?.assignedTechnician?.name || data.data?.technicianName || 'Technician';
      const category = data.data?.category || 'Category';

      setIsDispatched(true);
      setSuccessMessage(`Work order successfully dispatched to ${techName} (${category.toUpperCase()})`);

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'AI Agent dispatch failed.');
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-3">
      {successMessage ? (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between gap-2 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700 text-[10px]">
            ASSIGNED
          </span>
        </div>
      ) : (
        <button
          onClick={handleDispatch}
          disabled={isDispatching || isDispatched}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none font-mono"
        >
          {isDispatching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
              AI Agent Matching & Creating Work Order...
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-cyan-300" />
              Run AI Agent Dispatch & Routing
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
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
