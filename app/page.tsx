import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Wrench, 
  ShieldCheck, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  FileText,
  BarChart2
} from 'lucide-react';

export default function Home() {
  const steps = [
    {
      step: '01',
      title: 'PERCEIVE',
      description: 'Multimodal AI extracts category, problem & severity from image + text evidence with structured output schemas.',
      icon: Eye,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      step: '02',
      title: 'VALIDATE',
      description: 'Business rules validate confidence score against threshold (0.80). Low confidence or contradiction flags for human review.',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      step: '03',
      title: 'REASON & ACT',
      description: 'AI agent queries inventory and technician availability via controlled tools to create and assign work orders.',
      icon: Zap,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      step: '04',
      title: 'VERIFY',
      description: 'A 2nd independent AI model compares BEFORE vs AFTER repair photos to objectively output PASS or FAIL.',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      step: '05',
      title: 'RECOVER',
      description: 'On verification FAIL, the issue automatically reopens, escalates, and re-routes without closing fraudulently.',
      icon: RotateCcw,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    }
  ];

  const portals = [
    {
      title: 'Report Maintenance Issue',
      href: '/report',
      desc: 'Submit photo, text description & location for instant AI perception parsing.',
      icon: AlertCircle,
      badge: 'User / Supervisor',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Supervisor Dashboard & Agent',
      href: '/issues',
      desc: 'Track reported issues, inspect AI agent reasoning steps & tool actions.',
      icon: ShieldCheck,
      badge: 'Supervisor Portal',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Technician Work Order Portal',
      href: '/technician',
      desc: 'View assigned jobs, update work status & upload after-repair image proof.',
      icon: Wrench,
      badge: 'Technician Interface',
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: 'AI Verification Audit',
      href: '/verification',
      desc: 'Independent 2nd model visual diff comparison (Before vs After repair).',
      icon: Eye,
      badge: 'Verification Engine',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Evaluation Benchmark Harness',
      href: '/evaluation',
      desc: 'Run 20 live evaluation cases (plumbing, electrical, cleaning & failure modes).',
      icon: BarChart2,
      badge: 'Red-Team Harness',
      color: 'from-rose-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-10 py-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-8 md:p-12 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            CLOSED-LOOP AI MAINTENANCE ENGINE
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Prove Maintenance Is Fixed. <br />
            <span className="gradient-text-cyan">Never Trust Verbal Claims.</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            FixProof AI automates campus maintenance workflows from initial visual perception and safe tool-assisted routing to independent 2nd-stage visual repair verification and failure recovery.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              Report an Issue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/issues"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              Supervisor Console
            </Link>
          </div>
        </div>
      </section>

      {/* Closed-Loop Workflow Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            The 5-Stage Closed-Loop Architecture
          </h2>
          <span className="text-xs font-mono text-slate-400">P0 MVP CORE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`rounded-xl p-5 border ${item.bg} glass-panel flex flex-col justify-between space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">{item.step}</span>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm tracking-wide ${item.color}`}>{item.title}</h3>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Portals Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">System Navigation Portals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.href}
                href={portal.href}
                className="group relative rounded-xl glass-panel glass-panel-interactive p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${portal.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {portal.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      {portal.title}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-cyan-400" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{portal.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Originality Constraints Box */}
      <section className="rounded-xl bg-slate-950/80 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Hackathon Originality Constraints Target
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-1">1. Two Models Cooperating</span>
            <p className="text-slate-400">Model 1 (Perception) extracts issue schemas. Model 2 (Verification) independently checks repair proof without perception bias.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="font-bold text-amber-300 block mb-1">2. Degrade Gracefully</span>
            <p className="text-slate-400">AI rate limit, timeout, or schema failure triggers safe retries or flags issues as `PENDING_REVIEW` without crashing.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="font-bold text-rose-300 block mb-1">3. Handle Being Wrong</span>
            <p className="text-slate-400">Uncertainty visible to supervisors. Verification FAIL automatically reopens work orders instead of false closing.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
