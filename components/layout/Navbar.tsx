'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, Wrench, CheckCircle2, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isTechnicianView = pathname?.startsWith('/technician');
  const isSupervisorView = pathname?.startsWith('/supervisor') || pathname?.startsWith('/issues');

  const [activeRole, setActiveRole] = useState<'supervisor' | 'technician'>('supervisor');

  useEffect(() => {
    if (isTechnicianView) {
      setActiveRole('technician');
    } else if (isSupervisorView) {
      setActiveRole('supervisor');
    }
  }, [pathname, isTechnicianView, isSupervisorView]);

  const handleRoleSwitch = (role: 'supervisor' | 'technician') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fixproof_demo_role', role);
    }
    setActiveRole(role);
    if (role === 'supervisor') {
      router.push('/supervisor');
    } else {
      router.push('/technician');
    }
  };

  const navLinks = isTechnicianView
    ? [
        { href: '/technician', label: 'My Assigned Work', icon: Wrench },
        { href: '/report', label: 'Report Incident', icon: AlertCircle },
      ]
    : [
        { href: '/supervisor', label: 'Operations Overview', icon: LayoutDashboard },
        { href: '/issues', label: 'Issues Queue', icon: ShieldCheck },
        { href: '/report', label: 'Report Incident', icon: AlertCircle },
      ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5 font-mono">
              FIXPROOF <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 font-mono">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono font-medium">
              {isTechnicianView ? 'TECHNICIAN WORKSPACE' : 'SUPERVISOR WORKSPACE'}
            </span>
          </div>
        </Link>

        {/* Workspace Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Demo Workspace Switcher Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2 hidden sm:inline">
              Demo Workspace:
            </span>
            <button
              onClick={() => handleRoleSwitch('supervisor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                !isTechnicianView
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              Supervisor
            </button>

            <button
              onClick={() => handleRoleSwitch('technician')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isTechnicianView
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              Technician
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
