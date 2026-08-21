'use client';

import { useState } from 'react';
import { Cpu, CheckCircle2, ShieldCheck, UserCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export interface ToolTraceItem {
  timestamp: string;
  step: string;
  toolUsed: string;
  action: string;
  details: string;
}

interface AgentToolTraceProps {
  logs: ToolTraceItem[];
  assignedTechnicianName?: string;
  category?: string;
  severity?: string;
  confidence?: number;
}

export default function AgentToolTrace({
  logs,
  assignedTechnicianName = 'Field Technician',
  category = 'General',
  severity = 'Medium',
  confidence = 90,
}: AgentToolTraceProps) {
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);

  if (!logs || logs.length === 0) return null;

  const isApproved = confidence >= 80;
  const dispatchDetails = logs[logs.length - 1]?.details || 'Agent matched available category technician deterministically.';

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-900/50 space-y-5">
      {/* 1. Concise Human-Readable AI Decision Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            FIXPROOF AI DECISION
          </div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2 font-sans">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Automatically Assigned to {assignedTechnicianName}
          </h3>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
          isApproved
            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
            : 'bg-amber-950 text-amber-300 border-amber-600'
        }`}>
          {isApproved ? 'ROUTING APPROVED' : 'REVIEW REQUIRED'}
        </span>
      </div>

      {/* 2. Primary Decision Metrics Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
          Why this decision?
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Issue Category</span>
            <span className="text-cyan-300 font-bold capitalize">{category}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Severity</span>
            <span className="text-amber-300 font-bold capitalize">{severity}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">AI Confidence</span>
            <span className="text-emerald-400 font-bold">{confidence}%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Category Compatibility</span>
            <span className="text-emerald-400 font-bold">Verified Match</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Tool Architecture</span>
            <span className="text-cyan-300 font-bold">Controlled Tool</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Automated Routing</span>
            <span className={`font-bold ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isApproved ? 'Approved' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Decision Rationale:</span>
          <p className="text-slate-200 text-xs font-sans leading-relaxed">
            "{dispatchDetails}"
          </p>
        </div>
      </div>

      {/* 3. Secondary Progressive Disclosure Expandable Button */}
      <div className="pt-1">
        <button
          onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
          className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            AI Execution Audit — Technical Details ({logs.length} Tool Steps)
          </span>
          {showTechnicalTrace ? (
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* 4. Subordinate Technical Tool Trace */}
        {showTechnicalTrace && (
          <div className="mt-3 space-y-2.5 font-mono text-xs p-4 rounded-xl bg-slate-950/90 border border-slate-800/90">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold pb-1">
              Step-by-step Controlled Tool Invocation Sequence:
            </span>

            {logs.map((log, idx) => (
              <div
                key={`tool_step_${idx}`}
                className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">Step {idx + 1}:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                      {log.toolUsed || 'ControlledTool'}
                    </span>
                    <span className="text-slate-400 font-bold">{log.action}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] font-sans leading-relaxed pt-0.5">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
