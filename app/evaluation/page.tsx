'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { EVALUATION_CASES } from '@/lib/evaluation/cases';

interface EvaluationCaseRunResult {
  caseId: string;
  name: string;
  category: string;
  isAdversarial: boolean;
  expectedStatus: string;
  actualStatus: string;
  expectedVerificationResult: string;
  actualVerificationResult: string;
  passed: boolean;
  reason?: string;
  durationMs: number;
}

interface SuiteSummary {
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  durationMs: number;
  results: EvaluationCaseRunResult[];
  ranAt?: string;
}

export default function EvaluationHarnessPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [suiteSummary, setSuiteSummary] = useState<SuiteSummary | null>(null);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/evaluation/run', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to execute evaluation suite.');
      }

      setSuiteSummary(data);
      setToastMessage({
        type: 'success',
        text: `Evaluation suite completed cleanly! ${data.passed}/${data.total} cases passed (${data.passRate}% pass rate).`,
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to execute evaluation suite.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCaseId(expandedCaseId === id ? null : id);
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-mono">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            AI RELIABILITY & BENCHMARK HARNESS
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Evaluation Harness Dashboard
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Stress test FixProof AI's closed-loop pipeline across classification, deterministic routing, recovery loops, and adversarial safeguards.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunEvaluation}
          disabled={isRunning}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 shrink-0 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
              Running 15 Evaluation Benchmark Cases...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-cyan-300 fill-cyan-300" />
              Run Full Evaluation Suite
            </>
          )}
        </button>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Metrics Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block">
            TOTAL EVALUATION CASES
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              {suiteSummary ? suiteSummary.total : EVALUATION_CASES.length}
            </span>
            <span className="text-xs font-mono text-cyan-400">15 Benchmarks</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block">
            PASS RATE
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold font-mono ${
              suiteSummary && suiteSummary.passRate >= 90 ? 'text-emerald-400' : suiteSummary ? 'text-rose-400' : 'text-slate-500'
            }`}>
              {suiteSummary ? `${suiteSummary.passRate}%` : '---'}
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block">
            PASSED / FAILED
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {suiteSummary ? `${suiteSummary.passed} Passed` : '---'}
            </span>
            {suiteSummary && suiteSummary.failed > 0 && (
              <span className="text-xs font-mono text-rose-400 font-bold">
                {suiteSummary.failed} Failed
              </span>
            )}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block">
            SUITE LATENCY & MODEL
          </span>
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-cyan-300 font-mono">
              {suiteSummary ? `${suiteSummary.durationMs}ms Total` : 'Ready'}
            </div>
            <span className="text-[10px] font-mono text-slate-500 block">
              Gemini 2.5 Flash &bull; Prompt v1 &bull; Zod Guard
            </span>
          </div>
        </div>

      </div>

      {/* Evaluation Cases Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Benchmark Cases & Safeguard Evaluation ({EVALUATION_CASES.length} Cases)
          </h3>
          {suiteSummary?.ranAt && (
            <span className="text-xs font-mono text-slate-500">
              Last Executed: {new Date(suiteSummary.ranAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {EVALUATION_CASES.map((caseDef, idx) => {
            const runResult = suiteSummary?.results?.find(r => r.caseId === caseDef.id);
            const isExpanded = expandedCaseId === caseDef.id;

            return (
              <div
                key={caseDef.id}
                className={`rounded-xl border transition-all ${
                  runResult
                    ? runResult.passed
                      ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-700/60'
                      : 'bg-rose-950/20 border-rose-800/60'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                {/* Case Row Header */}
                <div
                  onClick={() => toggleExpand(caseDef.id)}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-[280px] shrink-0">
                    <span className="font-mono text-xs text-slate-500 w-7">#{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-white text-xs">{caseDef.name}</h4>
                      <p className="text-[11px] text-slate-400">{caseDef.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Category Badge */}
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-950 text-cyan-300 border border-slate-800">
                      {caseDef.category}
                    </span>

                    {/* Adversarial / Standard Badge */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      caseDef.isAdversarial
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}>
                      {caseDef.isAdversarial ? 'ADVERSARIAL / GUARD' : 'STANDARD'}
                    </span>

                    {/* Pass/Fail Status */}
                    {runResult ? (
                      runResult.passed ? (
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          PASS
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-500 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          FAIL
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-950 text-slate-500 border border-slate-800">
                        UNRUN
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expandable Details Panel */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">EXPECTED SEVERITY</span>
                        <span className="text-white font-bold uppercase">{caseDef.expectedSeverity}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">EXPECTED STATUS</span>
                        <span className="text-cyan-300 font-bold uppercase">{caseDef.expectedStatus}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">ACTUAL STATUS</span>
                        <span className={`font-bold uppercase ${
                          runResult?.actualStatus === caseDef.expectedStatus ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {runResult?.actualStatus || 'N/A'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">CASE LATENCY</span>
                        <span className="text-slate-300 font-bold">{runResult ? `${runResult.durationMs}ms` : '---'}</span>
                      </div>
                    </div>

                    {runResult?.reason && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                          Execution Audit Output:
                        </span>
                        <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                          {runResult.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
