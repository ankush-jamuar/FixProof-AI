import Link from 'next/link';
import { getIssueById, getWorkOrderByIssueId, getTechnicianById } from '@/lib/db/queries';
import AnalyzeButton from '@/components/issues/AnalyzeButton';
import SupervisorOverride from '@/components/issues/SupervisorOverride';
import AgentDispatchButton from '@/components/issues/AgentDispatchButton';
import { 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ImageIcon, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  Activity,
  AlertCircle,
  Wrench,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { IssueCategory, IssueSeverity, WorkOrderStatus } from '@/types/domain';

export const revalidate = 0; // Server-rendered on every request

interface PageProps {
  params: Promise<{ id: string }>;
}

function CategoryBadge({ category }: { category: IssueCategory }) {
  const colors: Record<IssueCategory, string> = {
    plumbing: 'bg-cyan-950 text-cyan-300 border-cyan-700/60',
    electrical: 'bg-amber-950 text-amber-300 border-amber-700/60',
    cleaning: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase border ${colors[category] || colors.plumbing}`}>
      {category}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const colors: Record<IssueSeverity, string> = {
    low: 'bg-slate-900 text-slate-300 border-slate-700',
    medium: 'bg-blue-950 text-blue-300 border-blue-700/60',
    high: 'bg-amber-950 text-amber-300 border-amber-700/60',
    critical: 'bg-rose-950 text-rose-300 border-rose-700/60',
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase border ${colors[severity] || colors.medium}`}>
      {severity} severity
    </span>
  );
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const issue = await getIssueById(id);

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Issue Not Found</h1>
        <p className="text-slate-400 text-xs">
          The requested maintenance issue ID <code className="font-mono text-cyan-300">{id}</code> does not exist in Neon database.
        </p>
        <div className="pt-2">
          <Link
            href="/issues"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-medium hover:bg-slate-800"
          >
            &larr; Return to Issue Console
          </Link>
        </div>
      </div>
    );
  }

  const workOrder = await getWorkOrderByIssueId(issue.id);
  const assignedTechnician = workOrder?.technicianId ? await getTechnicianById(workOrder.technicianId) : null;

  const hasAnalyzed = Boolean(issue.aiCategory && issue.aiConfidence !== null);
  const confidencePercent = issue.aiConfidence !== null && issue.aiConfidence !== undefined 
    ? Math.round(issue.aiConfidence * 100) 
    : 0;
  const isHighConfidence = confidencePercent >= 80;
  const isPendingReview = issue.status === 'PENDING_REVIEW';
  const isAssignedOrBeyond = ['ASSIGNED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED'].includes(issue.status);

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Supervisor Issue Management
        </Link>
        <span className="text-xs font-mono text-slate-500">
          ISSUE ID: <span className="text-cyan-400">{issue.id.slice(0, 8)}...</span>
        </span>
      </div>

      {/* Main Grid: Evidence & Details vs AI Perception Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Evidence, Work Order, and Side-by-Side Photos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Evidence Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                ORIGINAL REPORT EVIDENCE
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 text-cyan-300 border border-slate-800 font-bold uppercase">
                STATUS: {issue.status}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={issue.beforeImageUrl}
                alt={issue.title}
                className="w-full max-h-[420px] object-contain bg-slate-950"
              />
            </div>

            <div className="space-y-3 pt-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{issue.title}</h1>
              
              <div className="flex items-center gap-2 text-sm text-cyan-300 font-medium">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{issue.location}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                  Original User Description
                </span>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {issue.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Reported: {new Date(issue.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Active Work Order & Assigned Technician Details */}
          {workOrder && (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-900/50 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-bold uppercase">
                  <Wrench className="w-4 h-4 text-indigo-400" />
                  Work Order Dispatch #{workOrder.id.slice(0, 8)}
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-700">
                  {workOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">ASSIGNED TECHNICIAN</span>
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    {assignedTechnician?.name || 'Assigned Technician'}
                  </div>
                  <p className="text-slate-400 text-[11px]">{assignedTechnician?.phone || '+1-555-0101'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">ROUTED CATEGORY & SEVERITY</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <CategoryBadge category={workOrder.category as IssueCategory} />
                    <SeverityBadge severity={workOrder.severity as IssueSeverity} />
                  </div>
                </div>
              </div>

              {/* Agent Decision Audit Log */}
              {workOrder.agentLogs && (workOrder.agentLogs as any[]).length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-wider block">
                    AI Agent Reasoning Audit Trail
                  </span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {(workOrder.agentLogs as any[])[0]?.details || 'Agent selected technician based on category matching and availability.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Before Photo vs After Photo Comparison (Shown when Repair Submitted) */}
          {workOrder?.afterImageUrl && (
            <div className="glass-panel p-6 rounded-2xl border border-yellow-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-300 font-mono text-xs font-bold">
                  <FileCheck className="w-4 h-4 text-yellow-400" />
                  REPAIR EVIDENCE COMPARISON (BEFORE vs AFTER)
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-yellow-950 text-yellow-300 border border-yellow-700">
                  PENDING VERIFICATION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">BEFORE REPAIR (ORIGINAL)</span>
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 h-48 bg-slate-950">
                    <img src={issue.beforeImageUrl} alt="Before repair" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">AFTER REPAIR (TECHNICIAN PROOF)</span>
                  <div className="relative rounded-xl overflow-hidden border border-emerald-800 h-48 bg-slate-950">
                    <img src={workOrder.afterImageUrl} alt="After repair" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {workOrder.technicianNotes && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5">Technician Repair Notes:</span>
                  "{workOrder.technicianNotes}"
                </div>
              )}
            </div>
          )}

          {/* Reserved Section for Stage 7 Verification */}
          {!workOrder?.afterImageUrl && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <Eye className="w-4 h-4" />
                2ND STAGE AI VERIFICATION ENGINE
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Independent visual verification comparing Before vs After repair photos will execute here in Stage 7 once technician completes work.
              </p>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[11px] font-mono border border-slate-800">
                STAGE 7 VERIFICATION PENDING
              </span>
            </div>
          )}

        </div>

        {/* Right Column (1 Col): AI Perception, Agent Routing, & Timeline Sidebar */}
        <div className="space-y-6">
          
          {/* AI Perception Engine Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Perception Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                STAGE 3
              </span>
            </div>

            {/* Analyze Button */}
            <AnalyzeButton issueId={issue.id} hasAnalyzed={hasAnalyzed} />

            {/* Live Analysis Display */}
            {hasAnalyzed ? (
              <div className="space-y-4 pt-2">
                
                {/* Confidence Badge & Meter */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">AI CONFIDENCE SCORE</span>
                    <span className={`text-sm font-bold font-mono ${isHighConfidence ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {confidencePercent}%
                    </span>
                  </div>
                  
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isHighConfidence ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}
                      style={{ width: `${confidencePercent}%` }}
                    ></div>
                  </div>

                  <div className="pt-1">
                    {isHighConfidence ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        High Confidence (&ge;80%) &mdash; Perception Accepted
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          Human Review Required
                        </div>
                        <p className="text-[11px] text-amber-200/80 leading-relaxed">
                          AI confidence is below the 80% threshold. Supervisor verification is required before routing.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categorization & Severity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Category:</span>
                    {issue.aiCategory && <CategoryBadge category={issue.aiCategory} />}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Severity:</span>
                    {issue.aiSeverity && <SeverityBadge severity={issue.aiSeverity} />}
                  </div>
                </div>

                {/* Problem & Reasoning */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    AI Identified Problem
                  </span>
                  <p className="text-xs text-white font-medium">{issue.aiProblem}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Evidence-Based Reasoning
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{issue.aiReasoning}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Clock className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
                <span className="text-xs font-medium text-slate-300 block">AI Analysis Pending</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Click "Analyze Issue with AI" above to run multimodal vision parsing.
                </p>
              </div>
            )}
          </div>

          {/* AI Agent Routing & Dispatch Card */}
          {hasAnalyzed && !isAssignedOrBeyond && (
            <div className="glass-panel rounded-2xl border border-indigo-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  AI Agent Dispatch
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  BLOCK 3
                </span>
              </div>

              {isPendingReview ? (
                <SupervisorOverride issueId={issue.id} aiCategory={issue.aiCategory} />
              ) : (
                <AgentDispatchButton issueId={issue.id} />
              )}
            </div>
          )}

          {/* Workflow Timeline */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Closed-Loop Lifecycle
            </h3>

            <div className="relative pl-6 space-y-5 border-l border-slate-800 text-xs">
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-950"></div>
                <div>
                  <h4 className="font-bold text-cyan-300">1. Issue Reported</h4>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {new Date(issue.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className={`relative ${hasAnalyzed ? '' : 'opacity-50'}`}>
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-950 ${hasAnalyzed ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
                <div>
                  <h4 className={`font-medium ${hasAnalyzed ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                    2. AI Perception Analysis
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {hasAnalyzed ? `${issue.aiCategory?.toUpperCase()} (${confidencePercent}% confidence)` : 'Pending'}
                  </p>
                </div>
              </div>

              <div className={`relative ${isAssignedOrBeyond ? '' : 'opacity-50'}`}>
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-950 ${isAssignedOrBeyond ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                <div>
                  <h4 className={`font-medium ${isAssignedOrBeyond ? 'text-blue-300 font-bold' : 'text-slate-400'}`}>
                    3. Work Order Assigned
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {workOrder ? `Technician: ${assignedTechnician?.name || 'Assigned'}` : 'Pending Agent Routing'}
                  </p>
                </div>
              </div>

              <div className={`relative ${workOrder?.afterImageUrl ? '' : 'opacity-50'}`}>
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-950 ${workOrder?.afterImageUrl ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
                <div>
                  <h4 className={`font-medium ${workOrder?.afterImageUrl ? 'text-yellow-300 font-bold' : 'text-slate-400'}`}>
                    4. Repair Submitted
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {workOrder?.afterImageUrl ? 'Pending Stage 7 Verification' : 'Pending Technician Work'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
