import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'FixProof AI - Closed-Loop Campus Maintenance System',
  description: 'AI-powered campus maintenance perceive, validate, reason, act, verify, and recover system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#060911] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="w-full border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>FixProof AI &copy; 2026 — Closed-Loop Maintenance Workflow</span>
            <span className="font-mono text-[11px] text-slate-400">PERCEIVE &rarr; VALIDATE &rarr; REASON &rarr; ACT &rarr; VERIFY &rarr; RECOVER</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
