import Link from 'next/link';
import { getIssueById } from '@/lib/db/queries';
import AnalyzeButton from '@/components/issues/AnalyzeButton';
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
  AlertCircle
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

  const hasAnalyzed = Boolean(issue.aiCategory && issue.aiConfidence !== null);
  const confidencePercent = issue.aiConfidence !== null && issue.aiConfidence !== undefined 
    ? Math.round(issue.aiConfidence * 100) 
    : 0;
  const isHighConfidence = confidencePercent >= 80;

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
        
        {/* Left Column (2 Cols): Evidence & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Evidence Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                ORIGINAL EVIDENCE PHOTO
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 text-cyan-300 border border-slate-800">
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

          {/* Reserved Section for Future Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                <Cpu className="w-4 h-4" />
                AI AGENT & CONTROLLED TOOLS
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Technician matching and controlled tool operations occur in Stage 5.
              </p>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[11px] font-mono border border-slate-800">
                STAGE 5 REASONING PENDING
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <Eye className="w-4 h-4" />
                2ND STAGE AI VERIFICATION
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before vs After visual repair verification occurs in Stage 7.
              </p>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[11px] font-mono border border-slate-800">
                STAGE 7 VERIFICATION PENDING
              </span>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): AI Perception Sidebar & Action */}
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
                  
                  {/* Meter bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isHighConfidence ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}
                      style={{ width: `${confidencePercent}%` }}
                    ></div>
                  </div>

                  {/* High Confidence vs Human Review Banner */}
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

                {/* Identified Problem */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    AI Identified Problem
                  </span>
                  <p className="text-xs text-white font-medium">
                    {issue.aiProblem}
                  </p>
                </div>

                {/* Evidence Reasoning */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Evidence-Based Reasoning
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {issue.aiReasoning}
                  </p>
                </div>

                {/* Model Telemetry */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Model:</span>
                    <span className="text-slate-400">{issue.aiModel || 'gemini-2.5-flash'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prompt Ver:</span>
                    <span className="text-slate-400">{issue.aiPromptVersion || 'v1'}</span>
                  </div>
                  {issue.aiLatencyMs && (
                    <div className="flex items-center justify-between">
                      <span>Latency:</span>
                      <span className="text-slate-400">{issue.aiLatencyMs} ms</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Clock className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
                <span className="text-xs font-medium text-slate-300 block">AI Analysis Pending</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Click "Analyze Issue with AI" above to run multimodal vision parsing into structured category and severity schemas.
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Workflow Timeline
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
                    {hasAnalyzed 
                      ? `${issue.aiCategory?.toUpperCase()} (${confidencePercent}% confidence)` 
                      : 'Pending manual trigger'}
                  </p>
                </div>
              </div>

              <div className="relative opacity-50">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                <div>
                  <h4 className="font-medium text-slate-400">3. Work Order Routing</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stage 5 agent tool selection</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
