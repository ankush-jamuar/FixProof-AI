'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  AlertCircle,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [savedRole, setSavedRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('fixproof_demo_role');
      if (role) {
        setSavedRole(role);
      }
    }
  }, []);

  const selectWorkspace = (role: 'supervisor' | 'technician', path: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fixproof_demo_role', role);
    }
    router.push(path);
  };

  return (
    <div className="space-y-12 py-6 max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-900/50 space-y-6 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            FIXPROOF AI &bull; CLOSED-LOOP MAINTENANCE PLATFORM
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono leading-tight">
            FIXPROOF <span className="gradient-text-cyan">AI</span>
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-200">
            From maintenance report to verified resolution.
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
            An AI-powered closed-loop maintenance platform that detects issues from visual evidence, dispatches the right technician, verifies the repair, and keeps a complete operational audit trail.
          </p>
        </div>

        {/* Closed-Loop Lifecycle Bar */}
        <div className="pt-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800 font-bold">1. REPORT</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 border border-slate-800 font-bold">2. PERCEIVE</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-purple-300 border border-slate-800 font-bold">3. DECIDE</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-blue-300 border border-slate-800 font-bold">4. DISPATCH</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-slate-800 font-bold">5. REPAIR</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-teal-300 border border-slate-800 font-bold">6. PROVE</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-300 border border-slate-800 font-bold">7. VERIFY</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-rose-300 border border-slate-800 font-bold">8. RECOVER</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-bold">9. CLOSE</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-2">
            FixProof closes the maintenance loop — from visual incident detection to verified repair — instead of stopping at AI-generated recommendations.
          </p>
        </div>
      </div>

      {/* Role Gateway / Choose Your Workspace */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Choose your workspace
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            This presentation environment demonstrates two operational perspectives. Select the workspace that matches your presentation role.
          </p>

          {/* Honest Demo Environment Indicator */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span><strong className="text-slate-300">DEMO ENVIRONMENT:</strong> Role selection controls the presentation workspace only. Authentication and permissions are not enabled in this demo.</span>
            </div>
          </div>

          {/* Last Selected Role Banner (Persisted via localStorage) */}
          {savedRole && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Last selected workspace: <strong className="uppercase font-bold">{savedRole}</strong>
                <button
                  onClick={() => selectWorkspace(savedRole as 'supervisor' | 'technician', savedRole === 'supervisor' ? '/supervisor' : '/technician')}
                  className="underline hover:text-white ml-1 font-sans"
                >
                  Continue &rarr;
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Two Large Visually Distinct Workspace Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1: SUPERVISOR OPERATIONS */}
          <div
            onClick={() => selectWorkspace('supervisor', '/supervisor')}
            className="glass-panel glass-panel-interactive p-8 rounded-3xl border border-indigo-900/70 flex flex-col justify-between space-y-8 cursor-pointer group hover:border-indigo-500 transition-all shadow-xl shadow-indigo-950/20"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-700/80 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold uppercase">
                  OPERATIONS CONSOLE
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-extrabold text-white tracking-tight">
                  SUPERVISOR OPERATIONS
                </h4>
                <p className="text-xs text-indigo-300/90 font-mono font-medium">
                  Command center for facility operations
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  Monitor active incidents, review AI perception scores, oversee automated technician dispatches, approve verifications, and recover failed repairs.
                </p>
              </div>

              {/* 4 Concise Capabilities */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Monitor active incidents & SLA risk</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Review AI decisions & confidence scores</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Track technician dispatches & audit trail</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Approve verification & recover failed repairs</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Enter Supervisor Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* CARD 2: FIELD TECHNICIAN */}
          <div
            onClick={() => selectWorkspace('technician', '/technician')}
            className="glass-panel glass-panel-interactive p-8 rounded-3xl border border-cyan-900/70 flex flex-col justify-between space-y-8 cursor-pointer group hover:border-cyan-500 transition-all shadow-xl shadow-cyan-950/20"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Wrench className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold uppercase">
                  FIELD PORTAL
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-extrabold text-white tracking-tight">
                  FIELD TECHNICIAN
                </h4>
                <p className="text-xs text-cyan-300/90 font-mono font-medium">
                  Mobile workspace for assigned repairs
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  Inspect category-matched work orders, follow safety instructions, record repair start times, and submit after-repair photo evidence for 2nd-stage AI verification.
                </p>
              </div>

              {/* 4 Concise Capabilities */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>View assigned work orders only</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Follow repair instructions & safety notes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Submit before & after repair evidence</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Respond to reopened repair retries</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Enter Technician Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* Secondary Direct Link for Incident Intake */}
        <div className="pt-2 text-center">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 text-purple-300 text-xs font-mono font-bold hover:bg-slate-850 transition-all"
          >
            <AlertCircle className="w-4 h-4 text-purple-400" />
            Want to test incident intake? Report a new incident &rarr;
          </Link>
        </div>
      </div>

      {/* Product Differentiation Pillars Section */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold block">
            WHY FIXPROOF IS DIFFERENT
          </span>
          <h3 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Three Operational Differentiation Pillars
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold text-sm block">1. EVIDENCE-FIRST AI</span>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              AI decisions are grounded in visual evidence and numerical confidence scores. High-confidence perception calls route automatically; low-confidence calls pause for human review.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold text-sm block">2. CLOSED-LOOP VERIFICATION</span>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Repairs are not considered complete until after-repair evidence is uploaded and visually verified by a 2nd-stage vision AI model comparing before and after photographs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-rose-400 font-bold text-sm block">3. HUMAN-IN-THE-LOOP CONTROL</span>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Low-confidence decisions, failed repairs, and inconclusive verification escalate to humans instead of silently passing, recording an immutable audit trail.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
