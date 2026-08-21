'use client';

import { WorkOrderStatus } from '@/types/domain';
import { 
  AlertCircle, 
  Eye, 
  Cpu, 
  UserCheck, 
  Wrench, 
  Camera, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';

interface ClosedLoopPipelineBarProps {
  status: WorkOrderStatus;
  hasAnalyzed: boolean;
  hasAfterPhoto: boolean;
  hasVerified: boolean;
  isReopened: boolean;
}

export default function ClosedLoopPipelineBar({
  status,
  hasAnalyzed,
  hasAfterPhoto,
  hasVerified,
  isReopened,
}: ClosedLoopPipelineBarProps) {
  
  const steps = [
    {
      id: 'REPORTED',
      label: '1. Report',
      icon: AlertCircle,
      active: true, // Always completed if issue exists
      color: 'text-cyan-400 border-cyan-500 bg-cyan-950/80',
    },
    {
      id: 'PERCEPTION',
      label: '2. Perception',
      icon: Eye,
      active: hasAnalyzed || status !== 'REPORTED',
      color: 'text-indigo-400 border-indigo-500 bg-indigo-950/80',
    },
    {
      id: 'DECISION',
      label: '3. Decision',
      icon: Cpu,
      active: hasAnalyzed,
      color: 'text-purple-400 border-purple-500 bg-purple-950/80',
    },
    {
      id: 'DISPATCH',
      label: '4. Dispatch',
      icon: UserCheck,
      active: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'REOPENED', 'CLOSED'].includes(status),
      color: 'text-blue-400 border-blue-500 bg-blue-950/80',
    },
    {
      id: 'REPAIR',
      label: '5. Repair',
      icon: Wrench,
      active: ['IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'REOPENED', 'CLOSED'].includes(status),
      color: 'text-amber-400 border-amber-500 bg-amber-950/80',
    },
    {
      id: 'PROOF',
      label: '6. Proof',
      icon: Camera,
      active: hasAfterPhoto || ['PENDING_VERIFICATION', 'VERIFIED', 'REOPENED', 'CLOSED'].includes(status),
      color: 'text-teal-400 border-teal-500 bg-teal-950/80',
    },
    {
      id: 'VERIFY',
      label: '7. Verify',
      icon: ShieldCheck,
      active: hasVerified || ['VERIFIED', 'CLOSED'].includes(status) || isReopened,
      color: isReopened ? 'text-rose-400 border-rose-500 bg-rose-950/80' : 'text-emerald-400 border-emerald-500 bg-emerald-950/80',
    },
    {
      id: 'RECOVER',
      label: '8. Recover',
      icon: RefreshCw,
      active: isReopened,
      color: isReopened ? 'text-rose-400 border-rose-500 bg-rose-950 animate-pulse' : 'text-slate-600 border-slate-800 bg-slate-950',
    },
    {
      id: 'CLOSED',
      label: '9. Closed',
      icon: CheckCircle2,
      active: ['VERIFIED', 'CLOSED'].includes(status),
      color: 'text-emerald-400 border-emerald-500 bg-emerald-950',
    },
  ];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 font-bold text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          FixProof Closed-Loop AI Maintenance Lifecycle
        </span>
        <span className="text-[10px] text-slate-500">Autonomous Workflow Pipeline</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 pt-1">
        {steps.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                s.active ? s.color : 'bg-slate-950/50 border-slate-800/80 opacity-40'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-mono font-bold leading-tight truncate w-full">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
