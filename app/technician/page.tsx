'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  MapPin, 
  Clock, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  ImageIcon, 
  Play, 
  AlertCircle, 
  Eye,
  UserCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { WorkOrderStatus, IssueCategory, IssueSeverity } from '@/types/domain';

interface WorkOrderJoined {
  id: string;
  issueId: string;
  technicianId?: string;
  category: IssueCategory;
  problem: string;
  severity: IssueSeverity;
  location: string;
  description: string;
  status: WorkOrderStatus;
  afterImageUrl?: string;
  technicianNotes?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  issue?: {
    beforeImageUrl: string;
    title: string;
  };
}

interface TechnicianOption {
  id: string;
  name: string;
  category: IssueCategory;
  phone?: string;
}

export default function TechnicianPortalPage() {
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [workOrders, setWorkOrders] = useState<WorkOrderJoined[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Repair submission form state
  const [activeWOId, setActiveWOId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [techNotes, setTechNotes] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial technicians & work orders
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/technician/data');
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data.technicians || []);
        if (data.technicians && data.technicians.length > 0 && !selectedTechId) {
          setSelectedTechId(data.technicians[0].id);
        }
        setWorkOrders(data.workOrders || []);
      }
    } catch (err) {
      console.error('Failed to fetch technician data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = async (woId: string) => {
    setActionLoadingId(woId);
    setToastMessage(null);

    try {
      const res = await fetch(`/api/work-orders/${woId}/start`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to start work order.');
      }

      setToastMessage({ type: 'success', text: 'Work started! Status updated to IN_PROGRESS.' });
      fetchData();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to start work order.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteWork = async (woId: string) => {
    if (!uploadFile) {
      setToastMessage({ type: 'error', text: 'An after-repair photograph is required as evidence.' });
      return;
    }

    setActionLoadingId(woId);
    setToastMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('technicianNotes', techNotes);

      const res = await fetch(`/api/work-orders/${woId}/complete`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit repair proof.');
      }

      setToastMessage({ type: 'success', text: 'Repair proof uploaded! Status updated to PENDING_VERIFICATION.' });
      setUploadFile(null);
      setPreviewUrl(null);
      setTechNotes('');
      setActiveWOId(null);
      fetchData();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to submit repair proof.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setUploadFile(null);
      setPreviewUrl(null);
      return;
    }
    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const currentTech = technicians.find(t => t.id === selectedTechId);
  const assignedWorkOrders = workOrders.filter(w => w.technicianId === selectedTechId || !w.technicianId);

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-mono">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            FIELD TECHNICIAN WORKFORCE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Technician Repair Portal
          </h1>
          <p className="text-slate-400 text-sm">
            View assigned work orders, accept jobs, and submit photo proof of completed repairs.
          </p>
        </div>

        {/* DEMO_MODE Technician Selector */}
        <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-1.5 shrink-0 min-w-[280px]">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            Viewing as Technician:
          </label>
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-amber-500"
          >
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Jobs Section */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
          <span>Loading assigned work orders...</span>
        </div>
      ) : assignedWorkOrders.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No Pending Work Orders</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Technician {currentTech?.name || ''} has no active assigned jobs right now.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignedWorkOrders.map((wo) => {
            const isAssigned = wo.status === 'ASSIGNED';
            const isReopened = wo.status === 'REOPENED';
            const isInProgress = wo.status === 'IN_PROGRESS';
            const isPendingVerification = wo.status === 'PENDING_VERIFICATION';

            return (
              <div
                key={wo.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5"
              >
                {/* Status & Category Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700/60">
                      {wo.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono uppercase bg-slate-900 text-slate-300 border border-slate-700">
                      {wo.severity} severity
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                    isAssigned
                      ? 'bg-blue-950 text-blue-300 border-blue-700'
                      : isReopened
                      ? 'bg-rose-950 text-rose-300 border-rose-700 shadow-sm shadow-rose-500/20'
                      : isInProgress
                      ? 'bg-purple-950 text-purple-300 border-purple-700'
                      : 'bg-yellow-950 text-yellow-300 border-yellow-700'
                  }`}>
                    {wo.status}
                  </span>
                </div>

                {/* Reopened Alert Banner */}
                {isReopened && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      REPAIR VERIFICATION FAILED &mdash; REPAIR REOPENED
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      AI Verification detected remaining unaddressed defect or insufficient proof in previous attempt. Please re-inspect, complete repair, and upload new evidence photo.
                    </p>
                  </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left (1 Col): Original Before Image */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Original Reported Evidence
                    </span>
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-48">
                      {wo.issue?.beforeImageUrl ? (
                        <img
                          src={wo.issue.beforeImageUrl}
                          alt={wo.problem}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                          No Before Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle (2 Cols): Problem & Action Controls */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{wo.problem}</h3>
                      <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium mt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{wo.location}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {wo.description}
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2">
                      {(isAssigned || isReopened) && (
                        <button
                          onClick={() => handleStartWork(wo.id)}
                          disabled={actionLoadingId === wo.id}
                          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center gap-2"
                        >
                          {actionLoadingId === wo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isReopened ? (
                            <RefreshCw className="w-4 h-4 text-cyan-300" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          {isReopened ? 'Start Repair Work Again' : 'Start Repair Work'}
                        </button>
                      )}

                      {isInProgress && (
                        <div className="space-y-4 p-4 rounded-xl bg-slate-950/80 border border-purple-900/40">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4 text-purple-400" />
                              Submit Repair Evidence Photo
                            </span>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            className="hidden"
                          />

                          {!previewUrl ? (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl text-center text-xs text-slate-400 hover:text-purple-300 bg-slate-900/50 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Upload After-Repair Photo (Required)
                            </button>
                          ) : (
                            <div className="relative rounded-lg overflow-hidden border border-purple-700/60 h-40">
                              <img src={previewUrl} alt="Repair preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleFileChange(null)}
                                className="absolute top-2 right-2 px-2 py-1 bg-slate-950/80 text-rose-300 text-[10px] rounded border border-rose-800"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          <input
                            type="text"
                            placeholder="Optional repair notes (e.g. Replaced rubber gasket and sealed joint)."
                            value={techNotes}
                            onChange={(e) => setTechNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />

                          <button
                            onClick={() => handleCompleteWork(wo.id)}
                            disabled={actionLoadingId === wo.id || !uploadFile}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                          >
                            {actionLoadingId === wo.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Submit Completed Repair & Evidence
                          </button>
                        </div>
                      )}

                      {isPendingVerification && (
                        <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-700/40 text-yellow-300 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold">
                            <Eye className="w-4 h-4 text-yellow-400" />
                            Pending AI Verification
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            Repair evidence submitted! The 2nd-stage AI Verification Engine will inspect before vs after photos.
                          </p>
                          {wo.afterImageUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-yellow-800 h-36 mt-2">
                              <img src={wo.afterImageUrl} alt="Submitted repair proof" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
