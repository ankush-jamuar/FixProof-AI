'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Loader2, ArrowRight } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface AgentDispatchButtonProps {
  issueId: string;
}

export default function AgentDispatchButton({ issueId }: AgentDispatchButtonProps) {
  const router = useRouter();
  const [isDispatching, setIsDispatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDispatch = async () => {
    setIsDispatching(true);
    setErrorMessage(null);

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

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'AI Agent dispatch failed.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleDispatch}
        disabled={isDispatching}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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
