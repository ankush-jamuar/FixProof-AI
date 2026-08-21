'use client';

import { useState, useEffect } from 'react';
import {
  Wrench,
  MapPin,
  CheckCircle2,
  Loader2,
  Play,
  Camera,
  Phone,
  ShieldAlert,
  Upload,
  Clock
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import SafeImage from '@/components/ui/SafeImage';
import { validateImageFile } from '@/lib/validation/schemas';

interface TechnicianData {
  id: string;
  name: string;
  category: string;
  isAvailable: boolean;
  phone: string;
}

interface WorkOrderJob {
  id: string;
  issueId: string;
  category: string;
  problem: string;
  severity: string;
  location: string;
  description: string;
  status: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  technicianNotes?: string;
  createdAt: string;
}

export default function TechnicianPortalPage() {
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('tech-1');
  const [workOrders, setWorkOrders] = useState<WorkOrderJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // File upload state per work order
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [techNotes, setTechNotes] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fetchTechnicianPortalData = async (techId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/technician/data?techId=${techId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTechnicians(data.technicians || []);
        setWorkOrders(data.workOrders || []);
      } else {
        throw new Error(data.error?.message || 'Failed to load technician portal data.');
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to load field jobs.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianPortalData(selectedTechId);
  }, [selectedTechId]);

  const handleStartWork = async (workOrderId: string) => {
    setActionLoadingId(workOrderId);
    setToastMessage(null);

    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/start`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to start repair job.');
      }

      setToastMessage({
        type: 'success',
        text: 'Repair work started! Status updated to IN_PROGRESS.',
      });
      fetchTechnicianPortalData(selectedTechId);
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to start repair work.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFileSelect = (workOrderId: string, file: File | null) => {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setToastMessage({ type: 'error', text: validation.error || 'Invalid evidence photo format.' });
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [workOrderId]: file }));

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews((prev) => ({ ...prev, [workOrderId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRepair = async (workOrderId: string) => {
    const file = selectedFiles[workOrderId];
    if (!file) {
      setToastMessage({ type: 'error', text: 'An after-repair photograph is required as proof of completion.' });
      return;
    }

    setActionLoadingId(workOrderId);
    setToastMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('technicianNotes', techNotes[workOrderId] || '');

      const res = await fetch(`/api/work-orders/${workOrderId}/complete`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit repair proof.');
      }

      setToastMessage({
        type: 'success',
        text: 'After-repair proof uploaded successfully! Awaiting 2nd-stage AI verification.',
      });

      // Clear local file state
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[workOrderId];
        return next;
      });

      fetchTechnicianPortalData(selectedTechId);
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to upload repair proof.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentTech = technicians.find((t) => t.id === selectedTechId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      
      {/* Field Portal Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              TECHNICIAN FIELD PORTAL
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              My Field Dispatch Jobs
            </h1>
            <p className="text-slate-400 text-xs">
              Mobile-optimized portal for campus technicians to inspect issues, record repairs, and upload after-repair evidence.
            </p>
          </div>

          {/* Technician Role Selector (Demo Environment) */}
          <div className="space-y-1 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              DEMO TECHNICIAN SELECTOR
            </span>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Tech Card */}
        {currentTech && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400 font-mono">
                {currentTech.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-white block">{currentTech.name}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Category: <span className="text-cyan-300 uppercase font-bold">{currentTech.category}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTech.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <span className="text-xs font-mono text-slate-400 block">Loading field dispatch tasks...</span>
        </div>
      ) : workOrders.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">All Work Orders Completed</h3>
          <p className="text-slate-400 text-xs">No pending field jobs assigned to {currentTech?.name}.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {workOrders.map((wo) => {
            const isAssigned = wo.status === 'ASSIGNED';
            const isInProgress = wo.status === 'IN_PROGRESS';
            const isPendingVerification = wo.status === 'PENDING_VERIFICATION';
            const isReopened = wo.status === 'REOPENED';
            const isVerifiedOrClosed = ['VERIFIED', 'CLOSED'].includes(wo.status);

            const isCurrentActionLoading = actionLoadingId === wo.id;
            const previewUrl = filePreviews[wo.id];

            return (
              <div
                key={wo.id}
                className={`glass-panel rounded-2xl border transition-all space-y-5 p-6 ${
                  isReopened
                    ? 'border-rose-800/80 bg-rose-950/10 shadow-lg shadow-rose-950/20'
                    : isVerifiedOrClosed
                    ? 'border-emerald-900/60 bg-emerald-950/10'
                    : 'border-slate-800'
                }`}
              >

                {/* Reopened Alert Banner */}
                {isReopened && (
                  <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-700/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-300 font-mono">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      AI VERIFICATION FAILED — REPAIR REOPENED FOR RETRY
                    </div>
                    <p className="text-rose-200/90 text-[11px] leading-relaxed">
                      The 2nd-stage AI repair verification detected remaining unresolved defects in the previous repair proof. Please inspect the issue again, complete the necessary repairs, and upload fresh photo evidence.
                    </p>
                  </div>
                )}

                {/* Job Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">WO #{wo.id.slice(0, 8)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-indigo-300 border border-slate-800">
                        {wo.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        {wo.severity} severity
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{wo.problem}</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                    isVerifiedOrClosed
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : isReopened
                      ? 'bg-rose-950 text-rose-300 border-rose-600'
                      : isInProgress
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                  }`}>
                    STATUS: {wo.status}
                  </span>
                </div>

                {/* Location & Original User Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-medium">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{wo.location}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {wo.description}
                    </p>
                  </div>

                  {/* Before Evidence Thumbnail */}
                  {wo.beforeImageUrl && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-xs font-mono text-slate-400 uppercase block font-bold">BEFORE REPAIR (REPORTED ISSUE)</span>
                      <div className="relative rounded-lg overflow-hidden h-36 bg-slate-950 border border-slate-800">
                        <SafeImage src={wo.beforeImageUrl} alt="Original issue" fallbackLabel="Before Photo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                </div>

                {/* Field Technician Actions */}
                <div className="pt-2 border-t border-slate-800/80 space-y-4">

                  {/* Action 1: Start Work (for ASSIGNED or REOPENED) */}
                  {(isAssigned || isReopened) && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                          {isReopened ? 'Re-Start Repair Work On-Site' : 'Start Repair Work On-Site'}
                        </span>
                        <span className="text-slate-400 text-[11px]">Click when arriving at repair location</span>
                      </div>

                      <button
                        onClick={() => handleStartWork(wo.id)}
                        disabled={isCurrentActionLoading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCurrentActionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating Status to IN_PROGRESS...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            {isReopened ? 'Start Repair Work Again' : 'Start Repair Work'}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Action 2: Upload After-Repair Photo (for IN_PROGRESS) */}
                  {isInProgress && (
                    <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-800/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-2">
                          <Camera className="w-4 h-4 text-emerald-400" />
                          Submit Completed Repair Evidence
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 uppercase">Step 2: Proof Submission</span>
                      </div>

                      {/* File Upload Control */}
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-slate-300">
                          Upload After-Repair Photograph (Required for 2nd-Stage AI Verification):
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(wo.id, e.target.files?.[0] || null)}
                          className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer"
                        />

                        {/* Image Preview */}
                        {previewUrl && (
                          <div className="p-2 rounded-xl bg-slate-950 border border-emerald-700/60 space-y-1">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Selected Proof Image Preview:</span>
                            <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain rounded-lg bg-slate-950" />
                          </div>
                        )}

                        {/* Technician Notes */}
                        <div className="space-y-1 pt-1">
                          <label className="block text-[11px] font-mono text-slate-400">Technician Repair Notes (Optional):</label>
                          <textarea
                            rows={2}
                            value={techNotes[wo.id] || ''}
                            onChange={(e) => setTechNotes((prev) => ({ ...prev, [wo.id]: e.target.value }))}
                            placeholder="Describe parts replaced, seal applied, or work performed..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Submit Proof Trigger */}
                      <button
                        onClick={() => handleSubmitRepair(wo.id)}
                        disabled={isCurrentActionLoading || !selectedFiles[wo.id]}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCurrentActionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading Proof to Cloudinary...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Submit Repair Proof for AI Verification
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Status Indicator for PENDING_VERIFICATION */}
                  {isPendingVerification && (
                    <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold font-mono">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        Awaiting 2nd-Stage Multimodal AI Repair Verification
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        After-repair evidence has been uploaded. Supervisors can trigger AI verification on the Issue Command Center screen.
                      </p>
                    </div>
                  )}

                  {/* Status Indicator for VERIFIED or CLOSED */}
                  {isVerifiedOrClosed && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Repair Verified & Issue Closed Cleanly
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
