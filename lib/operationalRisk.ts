import { IssueSeverity, WorkOrderStatus } from '@/types/domain';

export type AttentionLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface OperationalRiskAssessment {
  level: AttentionLevel;
  reason: string;
  badgeStyle: string;
  borderStyle: string;
}

export function computeOperationalRisk(issue: {
  severity?: IssueSeverity | null;
  status: WorkOrderStatus;
  aiConfidence?: number | null;
  aiCategory?: string | null;
}): OperationalRiskAssessment {
  const status = issue.status;
  const severity = issue.severity || 'medium';
  const confidence = issue.aiConfidence !== null && issue.aiConfidence !== undefined ? issue.aiConfidence : 1;

  // 1. CRITICAL ATTENTION
  if (status === 'REOPENED') {
    return {
      level: 'CRITICAL',
      reason: 'Verification failed — active repair defect remains.',
      badgeStyle: 'bg-rose-950 text-rose-300 border-rose-600',
      borderStyle: 'border-rose-800/80 shadow-rose-950/40',
    };
  }

  if (severity === 'critical' && status !== 'CLOSED' && status !== 'VERIFIED') {
    return {
      level: 'CRITICAL',
      reason: 'Critical safety hazard — urgent intervention required.',
      badgeStyle: 'bg-rose-950 text-rose-300 border-rose-600',
      borderStyle: 'border-rose-800/80 shadow-rose-950/40',
    };
  }

  // 2. HIGH ATTENTION
  if (status === 'PENDING_VERIFICATION') {
    return {
      level: 'HIGH',
      reason: 'After-repair evidence submitted — awaiting AI verification.',
      badgeStyle: 'bg-indigo-950 text-indigo-300 border-indigo-600',
      borderStyle: 'border-indigo-800/80',
    };
  }

  if (status === 'PENDING_REVIEW' || confidence < 0.80) {
    return {
      level: 'HIGH',
      reason: `AI confidence (${(confidence * 100).toFixed(0)}%) < 80% — Human review required.`,
      badgeStyle: 'bg-amber-950 text-amber-300 border-amber-600',
      borderStyle: 'border-amber-800/80',
    };
  }

  if (status === 'ESCALATED') {
    return {
      level: 'HIGH',
      reason: 'Zero matching technicians available — supervisor dispatch needed.',
      badgeStyle: 'bg-amber-950 text-amber-300 border-amber-600',
      borderStyle: 'border-amber-800/80',
    };
  }

  // 3. MEDIUM ATTENTION
  if (status === 'IN_PROGRESS') {
    return {
      level: 'MEDIUM',
      reason: 'Technician on-site performing repair work.',
      badgeStyle: 'bg-cyan-950 text-cyan-300 border-cyan-700',
      borderStyle: 'border-slate-800',
    };
  }

  if (severity === 'high' && status === 'ASSIGNED') {
    return {
      level: 'MEDIUM',
      reason: 'High severity task dispatched to field technician.',
      badgeStyle: 'bg-cyan-950 text-cyan-300 border-cyan-700',
      borderStyle: 'border-slate-800',
    };
  }

  // 4. LOW ATTENTION
  if (status === 'CLOSED' || status === 'VERIFIED') {
    return {
      level: 'LOW',
      reason: 'Issue verified & closed cleanly.',
      badgeStyle: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      borderStyle: 'border-slate-800',
    };
  }

  return {
    level: 'LOW',
    reason: 'Standard routine maintenance issue.',
    badgeStyle: 'bg-slate-900 text-slate-400 border-slate-700',
    borderStyle: 'border-slate-800',
  };
}
