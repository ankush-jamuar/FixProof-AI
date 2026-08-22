'use client';

import Link from 'next/link';
import { Cpu, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw, Lightbulb, Activity } from 'lucide-react';
import { MaintenanceInsight } from '@/lib/intelligence/maintenanceInsights';

interface MaintenanceInsightsPanelProps {
  insights: MaintenanceInsight[];
}

export default function MaintenanceInsightsPanel({ insights }: MaintenanceInsightsPanelProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-indigo-900/60 space-y-6">
      
      {/* Header & Product Evolution Value Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            HISTORICAL MAINTENANCE INTELLIGENCE
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight font-sans flex items-center gap-2">
            Recurring Pattern Detection & Preventive Recommendations
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-2xl">
            FixProof doesn't stop at closing a work order. It learns from completed maintenance history to surface recurring problems before they become repeated failures.
          </p>
        </div>

        <div className="shrink-0 font-mono text-xs text-cyan-300 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
          <span className="text-slate-500 uppercase block text-[10px]">Detected Patterns</span>
          <strong className="text-sm font-bold text-white">{insights.length} Insight{insights.length !== 1 ? 's' : ''}</strong>
        </div>
      </div>

      {/* Insights Cards List OR Professional Empty State */}
      {insights.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Lightbulb className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white font-sans">Not enough incident history yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            FixProof will surface recurring maintenance patterns as more verified incidents accumulate across campus locations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {insights.map((insight) => {
            const isCritical = insight.severity === 'CRITICAL';
            const isHigh = insight.severity === 'HIGH';
            const issueIdsQuery = insight.supportingIssueIds.join(',');

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-2xl bg-slate-900/90 border transition-all space-y-4 flex flex-col justify-between ${
                  isCritical
                    ? 'border-rose-800/80 bg-rose-950/10 shadow-lg shadow-rose-950/20'
                    : isHigh
                    ? 'border-amber-800/80 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Insight Header Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-cyan-300 border border-slate-800">
                      {insight.location || insight.category?.toUpperCase() || 'CAMPUS PATTERN'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">
                        {insight.incidentCount} incident{insight.incidentCount > 1 ? 's' : ''} &bull; {insight.timeWindowDays} days
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border-rose-600'
                          : isHigh
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : 'bg-indigo-950 text-indigo-300 border-indigo-600'
                      }`}>
                        {insight.severity} PATTERN
                      </span>
                    </div>
                  </div>

                  {/* Title & Explanation */}
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {insight.explanation}
                    </p>
                  </div>

                  {/* WHY THIS MATTERS */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                      WHY THIS MATTERS
                    </span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {insight.whyItMatters}
                    </p>
                  </div>

                  {/* RECOMMENDED PREVENTIVE ACTION */}
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-1">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block font-bold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                      RECOMMENDED PREVENTIVE ACTION
                    </span>
                    <p className="text-xs text-indigo-100 font-sans leading-relaxed">
                      {insight.recommendation}
                    </p>
                  </div>

                </div>

                {/* View Related Incidents Action Link */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    Supporting records: {insight.supportingIssueIds.length} ID{insight.supportingIssueIds.length > 1 ? 's' : ''}
                  </span>

                  <Link
                    href={`/issues?ids=${issueIdsQuery}`}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs font-mono font-bold transition-all group"
                  >
                    <span>View related incidents</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
