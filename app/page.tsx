import Link from 'next/link';
import {
  LayoutDashboard,
  Wrench,
  AlertCircle,
  Cpu,
  ArrowRight
} from 'lucide-react';

export const revalidate = 0; // Server-rendered on every request

export default function LandingPage() {
  return (
    <div className="space-y-12 py-6">
      
      {/* Hero Section */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-900/50 space-y-6 text-center relative overflow-hidden">

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Demo Mode Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          DEMO PRESENTATION ENVIRONMENT &bull; ROLE SELECTION ACTIVE
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono leading-tight">
            FixProof <span className="gradient-text-cyan">AI</span>
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-300">
            Closed-Loop Campus Maintenance Intelligence Platform
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
            FixProof AI transforms raw visual evidence into an accountable, closed-loop maintenance workflow — from AI perception diagnosis and autonomous dispatch to technician repair proof, multimodal AI verification, recovery loops, and immutable audit closure.
          </p>
        </div>

        {/* Closed-Loop Core Value Lifecycle Pill */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300">1. SEE</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-300">2. UNDERSTAND</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-purple-300">3. DISPATCH</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300">4. REPAIR</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-300">5. VERIFY</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-rose-300">6. RECOVER</span>
        </div>

      </div>

      {/* Role Entrance Selector Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Select Evaluator Presentation Role
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Authentication is disabled for evaluator review
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Role Card 1: Supervisor Operations Console */}
          <Link
            href="/supervisor"
            className="glass-panel glass-panel-interactive p-6 rounded-2xl border border-indigo-900/60 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">OPERATIONS</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">SUPERVISOR</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">Supervisor Operations Console</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time operational dashboard for monitoring open incidents, SLA risk levels, AI agent dispatches, confidence flags, and supervisor overrides.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Enter Supervisor View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Role Card 2: Technician Field Portal */}
          <Link
            href="/technician"
            className="glass-panel glass-panel-interactive p-6 rounded-2xl border border-cyan-900/60 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold font-mono">FIELD OPERATIONS</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">TECHNICIAN</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">Technician Field Portal</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mobile-optimized field workspace for inspecting assigned repair tasks, starting on-site work, and uploading after-repair photo evidence.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Enter Technician View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Role Card 3: Report Incident Intake */}
          <Link
            href="/report"
            className="glass-panel glass-panel-interactive p-6 rounded-2xl border border-purple-900/60 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">INCIDENT INTAKE</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">NEW REPORT</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">Report New Incident</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit visual evidence and problem details to initiate the AI perception parsing, classification, and autonomous agent routing pipeline.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-purple-400 group-hover:text-purple-300">
              <span>Start Incident Intake</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* Closed-Loop AI Maintenance Narrative Showcase */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold block">
            HOW FIXPROOF AI DIFFERENTIATES FROM A GENERIC AI WRAPPER
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Accountable Operational AI Lifecycle Architecture
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Generic AI wrappers merely generate text answers. FixProof AI operates a closed-loop visual maintenance pipeline with deterministic application rules, safety thresholds, and 2nd-stage visual verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block">1. MULTIMODAL PERCEPTION</span>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
              Google Gemini vision models parse visual evidence, categorize defects, and score confidence against an 80% safety threshold.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-bold block">2. CONTROLLED DISPATCH</span>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
              AI Agent executes step-by-step controlled tools to match active available technicians without arbitrary database writes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block">3. 2ND-STAGE VERIFICATION</span>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
              Independent vision model compares Before vs After photos side-by-side to confirm problem resolution before closing the job.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-rose-400 font-bold block">4. RECOVERY & AUDIT</span>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
              Verification failures automatically reopen work orders for technician retries while recording an immutable audit trail.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
