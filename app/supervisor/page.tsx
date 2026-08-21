import Link from 'next/link';
import { 
  getAllIssues, 
  getAllWorkOrders, 
  getAllTechnicians 
} from '@/lib/db/queries';
import { computeOperationalRisk } from '@/lib/operationalRisk';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  ArrowRight
} from 'lucide-react';
import { IssueCategory, IssueSeverity, WorkOrderStatus } from '@/types/domain';

export const revalidate = 0; // Server-rendered on every request

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    plumbing: 'bg-cyan-950 text-cyan-300 border-cyan-700/60',
    electrical: 'bg-amber-950 text-amber-300 border-amber-700/60',
    cleaning: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase font-bold border ${colors[category] || colors.plumbing}`}>
      {category}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    low: 'bg-slate-900 text-slate-300 border-slate-700',
    medium: 'bg-blue-950 text-blue-300 border-blue-700/60',
    high: 'bg-amber-950 text-amber-300 border-amber-700/60',
    critical: 'bg-rose-950 text-rose-300 border-rose-700/60 font-bold',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold border ${colors[severity] || colors.medium}`}>
      {severity}
    </span>
  );
}

export default async function SupervisorOperationsPage() {
  const issues = await getAllIssues();
  const workOrders = await getAllWorkOrders();
  const technicians = await getAllTechnicians();

  // Calculate Operational KPI Metrics
  const totalOpen = issues.filter(i => i.status !== 'CLOSED' && i.status !== 'VERIFIED').length;
  const totalCritical = issues.filter(i => i.aiSeverity === 'critical' || i.humanCorrectedCategory === 'electrical').length;
  const inProgress = issues.filter(i => i.status === 'IN_PROGRESS').length;
  const awaitingVerification = issues.filter(i => i.status === 'PENDING_VERIFICATION').length;
  const reopenedRepairs = issues.filter(i => i.status === 'REOPENED').length;
  const pendingReview = issues.filter(i => i.status === 'PENDING_REVIEW').length;

  // Derive Attention Required Issues
  const attentionIssues = issues.filter((i) => {
    const risk = computeOperationalRisk({
      severity: i.aiSeverity,
      status: i.status as WorkOrderStatus,
      aiConfidence: i.aiConfidence,
    });
    return risk.level === 'CRITICAL' || risk.level === 'HIGH';
  });

  return (
    <div className="space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-mono">
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            SUPERVISOR COMMAND CENTER
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Campus Maintenance Operations
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl font-sans">
            Real-time visual maintenance intelligence, AI technician dispatch, and 2nd-stage repair verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/report"
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 font-mono"
          >
            <AlertCircle className="w-4 h-4" />
            Report New Incident
          </Link>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 font-mono text-xs uppercase tracking-wider block font-bold">OPEN INCIDENTS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">{totalOpen}</span>
            <AlertCircle className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-rose-950/60 bg-rose-950/20 space-y-1.5">
          <span className="text-rose-400 font-mono text-xs uppercase tracking-wider block font-bold">CRITICAL HAZARDS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-300 font-mono">{totalCritical}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-cyan-950/60 space-y-1.5">
          <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider block font-bold">IN PROGRESS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-cyan-300 font-mono">{inProgress}</span>
            <Wrench className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-indigo-950/60 space-y-1.5">
          <span className="text-indigo-400 font-mono text-xs uppercase tracking-wider block font-bold">AWAITING VERIFY</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-300 font-mono">{awaitingVerification}</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-rose-950/60 bg-rose-950/20 space-y-1.5">
          <span className="text-rose-400 font-mono text-xs uppercase tracking-wider block font-bold">REOPENED REPAIRS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-300 font-mono">{reopenedRepairs}</span>
            <RefreshCw className="w-4 h-4 text-rose-400 animate-spin-slow" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-950/60 space-y-1.5">
          <span className="text-amber-400 font-mono text-xs uppercase tracking-wider block font-bold">PENDING REVIEW</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-300 font-mono">{pendingReview}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
        </div>

      </div>

      {/* ABOVE-THE-FOLD: WHAT REQUIRES IMMEDIATE ATTENTION */}
      {attentionIssues.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-900/60 bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                What Requires Immediate Attention? ({attentionIssues.length})
              </h3>
              <p className="text-rose-200/80 text-xs font-sans">
                Issues flagged for critical hazard severity, failed verification reopening, or low-confidence AI perception.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attentionIssues.map((issue) => {
              const risk = computeOperationalRisk({
                severity: issue.aiSeverity,
                status: issue.status as WorkOrderStatus,
                aiConfidence: issue.aiConfidence,
              });

              return (
                <Link
                  key={`att_${issue.id}`}
                  href={`/issues/${issue.id}`}
                  className="p-4 rounded-xl bg-slate-900/90 border border-rose-800/80 hover:border-rose-500 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${risk.badgeStyle}`}>
                        {risk.level} ATTENTION
                      </span>
                      <span className="font-mono text-xs text-rose-300 font-bold uppercase">
                        {issue.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {issue.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {risk.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold pt-2 border-t border-slate-800">
                    <span>{issue.location}</span>
                    <span className="flex items-center gap-1">
                      Command Center <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Operations Queue Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-white text-base flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Active Maintenance Operations Queue ({issues.length})
            </h3>
            <p className="text-slate-400 text-xs">
              Click "Command Center" to view AI perception, agent routing, tool traces, and verification evidence.
            </p>
          </div>

          <Link
            href="/issues"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold shrink-0"
          >
            View Full Queue & Filter &rarr;
          </Link>
        </div>

        {/* Issues List Table */}
        {issues.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-mono text-xs text-slate-400">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white font-sans">No Maintenance Issues Reported</h4>
            <p className="text-slate-400 text-xs max-w-sm mx-auto font-sans">
              All campus facilities are currently clean and operational. Use "Report New Incident" to submit an issue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Issue & Location</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Tech</th>
                  <th className="py-3 px-3">AI Confidence</th>
                  <th className="py-3 px-3">Operational Risk</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {issues.map((issue) => {
                  const wo = workOrders.find(w => w.issueId === issue.id);
                  const tech = wo?.technicianId ? technicians.find(t => t.id === wo.technicianId) : null;
                  const risk = computeOperationalRisk({
                    severity: issue.aiSeverity,
                    status: issue.status as WorkOrderStatus,
                    aiConfidence: issue.aiConfidence,
                  });

                  const confidencePercent = issue.aiConfidence !== null && issue.aiConfidence !== undefined
                    ? Math.round(issue.aiConfidence * 100)
                    : 0;

                  return (
                    <tr key={issue.id} className="hover:bg-slate-900/50 transition-colors group">
                      
                      {/* Title & Location */}
                      <td className="py-3.5 px-3 min-w-[220px]">
                        <Link href={`/issues/${issue.id}`} className="font-bold text-white group-hover:text-cyan-300 block truncate">
                          {issue.title}
                        </Link>
                        <span className="text-xs text-cyan-400/80 font-mono block truncate">
                          {issue.location}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        {issue.aiCategory ? (
                          <CategoryBadge category={issue.aiCategory} />
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">UNCLASSIFIED</span>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-3">
                        {issue.aiSeverity ? (
                          <SeverityBadge severity={issue.aiSeverity} />
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">PENDING</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${
                          issue.status === 'VERIFIED' || issue.status === 'CLOSED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : issue.status === 'REOPENED'
                            ? 'bg-rose-950 text-rose-300 border-rose-600'
                            : issue.status === 'PENDING_VERIFICATION'
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}>
                          {issue.status}
                        </span>
                      </td>

                      {/* Technician */}
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {tech ? tech.name.split(' ')[0] : 'Unassigned'}
                      </td>

                      {/* AI Confidence */}
                      <td className="py-3.5 px-3 font-mono">
                        {issue.aiConfidence !== null && issue.aiConfidence !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${confidencePercent >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${confidencePercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-300 font-bold">{confidencePercent}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Unanalyzed</span>
                        )}
                      </td>

                      {/* Operational Risk */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${risk.badgeStyle}`}>
                          {risk.level}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/issues/${issue.id}`}
                          className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold hover:bg-slate-800 hover:border-cyan-500 transition-all"
                        >
                          Command Center &rarr;
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
