import Link from 'next/link';
import { getAllIssues } from '@/lib/db/queries';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowRight, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { WorkOrderStatus } from '@/types/domain';

export const revalidate = 0; // Server-rendered on every request

function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const styles: Record<WorkOrderStatus, { bg: string; text: string; icon: any }> = {
    REPORTED: { bg: 'bg-cyan-950/80 border-cyan-700/60', text: 'text-cyan-300', icon: AlertCircle },
    ANALYZING: { bg: 'bg-indigo-950/80 border-indigo-700/60', text: 'text-indigo-300', icon: Sparkles },
    PENDING_REVIEW: { bg: 'bg-amber-950/80 border-amber-700/60', text: 'text-amber-300', icon: AlertCircle },
    ASSIGNED: { bg: 'bg-blue-950/80 border-blue-700/60', text: 'text-blue-300', icon: Clock },
    IN_PROGRESS: { bg: 'bg-purple-950/80 border-purple-700/60', text: 'text-purple-300', icon: Clock },
    PENDING_VERIFICATION: { bg: 'bg-yellow-950/80 border-yellow-700/60', text: 'text-yellow-300', icon: Clock },
    VERIFIED: { bg: 'bg-emerald-950/80 border-emerald-700/60', text: 'text-emerald-300', icon: CheckCircle2 },
    REOPENED: { bg: 'bg-rose-950/80 border-rose-700/60', text: 'text-rose-300', icon: RotateCcw },
    ESCALATED: { bg: 'bg-rose-950/90 border-rose-600', text: 'text-rose-400', icon: AlertCircle },
    CLOSED: { bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400', icon: CheckCircle2 },
  };

  const current = styles[status] || styles.REPORTED;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${current.bg} ${current.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export default async function IssuesPage() {
  let issuesList: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    beforeImageUrl: string;
    status: WorkOrderStatus;
    createdAt: Date;
  }> = [];

  try {
    issuesList = await getAllIssues();
  } catch (err) {
    console.error('Failed to load issues from database:', err);
  }

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            SUPERVISOR CONSOLE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Maintenance Issue Management
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor reported campus maintenance issues, visual evidence, and system status state.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Issues Grid */}
      {issuesList.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No Issues Reported Yet</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Submit your first maintenance complaint with photo evidence to populate the supervisor console.
            </p>
          </div>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-medium hover:bg-slate-800 transition-all"
          >
            Create Test Report
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issuesList.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className="group glass-panel glass-panel-interactive rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Evidence Thumbnail */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={issue.beforeImageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={issue.status} />
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 text-sm">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{issue.location}</span>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(issue.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-sans font-medium">
                  View Issue &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
