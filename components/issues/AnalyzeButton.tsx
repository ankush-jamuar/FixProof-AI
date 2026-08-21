'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface AnalyzeButtonProps {
  issueId: string;
  hasAnalyzed: boolean;
}

export default function AnalyzeButton({ issueId, hasAnalyzed }: AnalyzeButtonProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Extract sanitized user-facing error message ONLY (never raw API key, stack trace, or 400 status string)
        const safeMessage =
          data?.error?.message ||
          (typeof data?.error === 'string' ? data.error : null) ||
          'AI analysis failed. Please try again.';
        throw new Error(safeMessage);
      }

      // Refresh page data to reflect newly saved perception fields
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
          hasAnalyzed
            ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/20 hover:scale-[1.01]'
        } disabled:opacity-50 disabled:pointer-events-none`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
            Analyzing Multimodal Evidence...
          </>
        ) : hasAnalyzed ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Re-Analyze with AI
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-cyan-300" />
            Analyze Issue with AI
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
