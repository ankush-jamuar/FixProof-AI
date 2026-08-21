'use client';

import { 
  Activity, 
  Bot, 
  UserCheck, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export interface AuditEventItem {
  id: string;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  actorType: 'SYSTEM' | 'AI_AGENT' | 'TECHNICIAN' | 'SUPERVISOR';
  actorName?: string;
  details?: string;
  timestamp: string;
  success?: boolean;
}

interface SystemAuditTimelineProps {
  events: AuditEventItem[];
}

export default function SystemAuditTimeline({ events }: SystemAuditTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center text-slate-500 font-mono text-xs">
        No audit log events recorded yet.
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Chronological System Audit Trail ({events.length} Events)
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Audited & Immutable
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {events.map((evt) => {
          const isAi = evt.actorType === 'AI_AGENT';
          const isTech = evt.actorType === 'TECHNICIAN';
          const isSupervisor = evt.actorType === 'SUPERVISOR';

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Marker Icon */}
              <div className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                isAi 
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                  : isTech 
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                  : isSupervisor
                  ? 'bg-purple-950 border-purple-500 text-purple-300'
                  : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}>
                {isAi ? <Bot className="w-3 h-3" /> : isTech ? <WrenchIcon className="w-3 h-3" /> : isSupervisor ? <UserCheck className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap font-mono text-xs">
                  <div className="flex items-center gap-2">
                    {/* Actor Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isAi 
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800' 
                        : isTech 
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        : isSupervisor
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {evt.actorType}
                    </span>

                    {/* Event Type Name */}
                    <span className="font-bold text-white text-xs">{evt.eventType}</span>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Event Details */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {evt.details}
                </p>

                {/* Status Transition Badge */}
                {evt.previousStatus && evt.newStatus && (
                  <div className="pt-1 flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-500">{evt.previousStatus}</span>
                    <span className="text-cyan-400">&rarr;</span>
                    <span className="text-emerald-400 font-bold">{evt.newStatus}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WrenchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
