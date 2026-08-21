'use client';

import { Cpu, CheckCircle2, ShieldCheck, Wrench, ArrowRight } from 'lucide-react';

export interface ToolTraceItem {
  timestamp: string;
  step: string;
  toolUsed: string;
  action: string;
  details: string;
}

interface AgentToolTraceProps {
  logs: ToolTraceItem[];
}

export default function AgentToolTrace({ logs }: AgentToolTraceProps) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          AI Agent Controlled Tool Execution Trace ({logs.length} Tool Steps)
        </h3>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
          Controlled Tool Safety Enforced
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {logs.map((log, idx) => (
          <div
            key={`tool_step_${idx}`}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">Step {idx + 1}:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                  {log.toolUsed || 'ControlledTool'}
                </span>
                <span className="text-slate-400 font-bold">{log.action}</span>
              </div>
              <span className="text-slate-500 text-[10px]">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              {log.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
