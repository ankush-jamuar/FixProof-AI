import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIssueById } from '@/lib/db/queries';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ImageIcon, 
  FileText, 
  Sparkles, 
  Wrench, 
  Eye, 
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { WorkOrderStatus } from '@/types/domain';

export const revalidate = 0; // Server-rendered on every request

interface PageProps {
  params: Promise<{ id: string }>;
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

      {/* Main Grid: Evidence & Issue Info vs AI & Closed-Loop Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Reported Evidence & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Evidence Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                PRIMARY EVIDENCE PHOTO
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
                  Original Description
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
            
            {/* AI Agent Reasoning & Routing Placeholder */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                <Cpu className="w-4 h-4" />
                AI AGENT & CONTROLLED TOOLS
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work order routing, technician matching, and controlled tool operations will occur here in Stage 5.
              </p>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[11px] font-mono border border-slate-800">
                STAGE 5 REASONING PENDING
              </span>
            </div>

            {/* AI Verification Audit Placeholder */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <Eye className="w-4 h-4" />
                2ND STAGE AI VERIFICATION
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Independent visual verification comparing Before vs After repair photos will occur here in Stage 7.
              </p>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[11px] font-mono border border-slate-800">
                STAGE 7 VERIFICATION PENDING
              </span>
            </div>

          </div>

        </div>

        {/* Right Column (1 Col): AI Perception & Timeline Sidebar */}
        <div className="space-y-6">
          
          {/* AI Perception Status Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Perception Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                STAGE 3
              </span>
            </div>

            {issue.aiCategory ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-mono text-[10px]">CATEGORY & PROBLEM</span>
                  <span className="text-cyan-300 font-bold uppercase">{issue.aiCategory}</span>
                  <span className="text-slate-300 block">{issue.aiProblem}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-mono text-[10px]">SEVERITY & CONFIDENCE</span>
                  <span className="text-amber-300 font-semibold capitalize">{issue.aiSeverity} severity</span>
                  <span className="text-slate-400 block">Confidence: {((issue.aiConfidence || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Clock className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
                <span className="text-xs font-medium text-slate-300 block">AI Perception Pending</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Multimodal vision parsing into structured category, problem, and severity schemas will execute in Stage 3.
                </p>
              </div>
            )}
          </div>

          {/* Closed-Loop Decision Timeline */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Closed-Loop Workflow Timeline
            </h3>

            <div className="relative pl-6 space-y-6 border-l border-slate-800">
              
              {/* Step 1: Reported */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-300">1. Issue Reported & Evidence Saved</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Original photo uploaded to Cloudinary, issue created in Neon PostgreSQL.
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">
                    {new Date(issue.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Step 2: AI Perception */}
              <div className="relative opacity-60">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400">2. Multimodal AI Perception</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pending Stage 3 Gemini vision analysis.</p>
                </div>
              </div>

              {/* Step 3: Agent Routing */}
              <div className="relative opacity-60">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400">3. Work Order Routing</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pending Stage 5 agent tool selection.</p>
                </div>
              </div>

              {/* Step 4: Verification */}
              <div className="relative opacity-60">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400">4. AI Verification & Closure</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pending Stage 7 before vs after visual verification.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
