'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export default function SafeImage({ src, alt, className = '', fallbackLabel = 'Evidence Photo' }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`w-full h-full min-h-[160px] bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 p-4 text-center ${className}`}>
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ImageIcon className="w-5 h-5 text-slate-400" />
        </div>
        <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider block">
          {fallbackLabel}
        </span>
        <span className="text-[11px] text-slate-500 block">
          Visual evidence stored on server
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  );
}
