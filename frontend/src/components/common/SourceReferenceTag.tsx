'use client';

import React, { useState } from 'react';
import { SourceRef } from '@/types';
import { ShieldCheck, ExternalLink, X, BookOpen } from 'lucide-react';

interface SourceReferenceTagProps {
  sources: SourceRef[];
  className?: string;
}

export const SourceReferenceTag: React.FC<SourceReferenceTagProps> = ({ sources, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  const primarySource = sources[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 transition-colors cursor-pointer ${className}`}
        title="View authoritative BIS source reference"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
        <span className="truncate max-w-[180px]">
          {primarySource.title || 'Authoritative BIS Source'}
        </span>
        {sources.length > 1 && (
          <span className="text-[10px] bg-amber-200/60 dark:bg-amber-800/60 px-1 rounded text-amber-950 dark:text-amber-100">
            +{sources.length - 1}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
                  <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Authoritative BIS Sources
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Retrieved from official standards & gazettes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {sources.map((src, idx) => (
                <div
                  key={src.source_id || idx}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400 shrink-0" />
                      <span>{src.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        src.reliability_tier === 'primary'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {src.reliability_tier === 'primary' ? 'Primary BIS' : 'Government Source'}
                    </span>
                  </div>

                  {src.source_type && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Type: <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{src.source_type}</span>
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>In-app verified reference</span>
                    {src.reference_url && (
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                        {src.reference_url}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
