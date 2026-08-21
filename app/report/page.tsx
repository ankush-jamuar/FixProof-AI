'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  MapPin, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Cpu
} from 'lucide-react';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/validation/schemas';

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setErrorMessage(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('Image file size exceeds the 10 MB limit.');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid image type. Please upload a JPG, PNG, WEBP, HEIC, or GIF file.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!location.trim() || location.trim().length < 2) {
      setErrorMessage('Please specify the problem location (e.g. Block C, Room 214).');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setErrorMessage('Please provide a detailed description (at least 5 characters).');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('An evidence photo of the issue is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('file', selectedFile);

      const res = await fetch('/api/report', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit issue report.');
      }

      setSuccessMessage('Incident recorded! Opening Issue Command Center...');
      setTimeout(() => {
        router.push(`/issues/${data.issue.id}`);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while uploading. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          AI-ASSISTED INCIDENT INTAKE
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Report Campus Maintenance Incident
        </h1>
        <p className="text-slate-400 text-sm">
          Upload visual evidence and location details. FixProof AI will parse the photo, classify problem severity, and prepare autonomous dispatch.
        </p>
      </div>

      {/* Guided Intake Progress Indicator */}
      <div className="grid grid-cols-3 gap-3 font-mono text-xs">
        <div className={`p-3 rounded-xl border flex items-center gap-2 ${location ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">1</span>
          <span className="font-bold truncate">1. Location</span>
        </div>
        <div className={`p-3 rounded-xl border flex items-center gap-2 ${selectedFile ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">2</span>
          <span className="font-bold truncate">2. Visual Proof</span>
        </div>
        <div className={`p-3 rounded-xl border flex items-center gap-2 ${isSubmitting ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300 animate-pulse' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">3</span>
          <span className="font-bold truncate">3. AI Parsing</span>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Location Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Location <span className="text-cyan-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Science Building, Floor 2, Cafeteria Restroom"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-all font-mono"
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <FileText className="w-4 h-4 text-cyan-400" />
            Problem Description <span className="text-cyan-400">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Describe the issue in detail (e.g. Water pipe burst under main sink emitting steady leak)."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-all resize-none font-mono"
          />
        </div>

        {/* Photo Evidence Dropzone */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Photo Evidence <span className="text-cyan-400">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/heic,image/gif"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all flex flex-col items-center justify-center space-y-3 group"
            >
              <div className="p-3.5 rounded-full bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/60 transition-all">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors font-mono">
                  Click to upload issue photograph
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  JPG, PNG, WEBP, HEIC up to 10 MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 group bg-slate-950">
              <img
                src={previewUrl}
                alt="Selected evidence preview"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-medium border border-slate-700 hover:border-cyan-500 transition-all"
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-900/80 text-rose-200 text-xs font-medium border border-rose-700 hover:bg-rose-800 transition-all flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-300 border border-slate-700">
                {selectedFile?.name} ({(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 font-mono"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                Uploading Evidence & Initializing AI Pipeline...
              </>
            ) : (
              <>
                Submit Incident Report
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
