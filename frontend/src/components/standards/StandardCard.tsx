'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StandardCardData } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { Bookmark, ArrowRight, Check } from 'lucide-react';

interface StandardCardProps {
  standard: StandardCardData;
  onSaveToggle?: (isNumber: string, saved: boolean) => void;
  className?: string;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  standard,
  onSaveToggle,
  className = '',
}) => {
  const [isSaved, setIsSaved] = useState(standard.is_saved ?? false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onSaveToggle) {
      onSaveToggle(standard.is_number, nextSaved);
    }
  };

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/80 transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header row: IS Number + Badges */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-base text-[#1E3A8A] dark:text-blue-400 tracking-tight">
              {standard.is_number}
            </span>
            <StatusBadge status={standard.status} />
          </div>

          <div className="flex items-center gap-2">
            {standard.relevance && (
              <RelevanceBadge relevance={standard.relevance} />
            )}
            <button
              type="button"
              onClick={handleSave}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              title={isSaved ? "Saved to your list" : "Save Standard"}
            >
              {isSaved ? (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Standard Title */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-3 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
          {standard.title}
        </h3>

        {/* Why Applicable Callout */}
        {standard.why_applicable && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border-l-3 border-l-[#2563EB] border-t border-r border-b border-slate-200/80 dark:border-slate-800 mb-4">
            <p className="text-[11px] font-semibold text-[#1E3A8A] dark:text-blue-400 uppercase tracking-wider mb-1">
              Why Applicable
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {standard.why_applicable}
            </p>
          </div>
        )}
      </div>

      {/* Footer row: Source Reference Tag + View Details CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 mt-2">
        <div>
          <SourceReferenceTag sources={standard.source_refs} />
        </div>

        <Link
          href={`/standards/${encodeURIComponent(standard.is_number)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:text-[#1D4ED8] dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:translate-x-0.5 transform duration-150 cursor-pointer ml-auto"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
