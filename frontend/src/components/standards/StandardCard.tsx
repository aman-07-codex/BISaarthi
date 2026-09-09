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
      className={`group relative bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-5 shadow-2xs hover:shadow-md hover:border-[#5B8272] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header row: IS Number + Badges */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-base text-[#0D3328] dark:text-[#8FA89B] tracking-tight">
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
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#E8F4EC] dark:bg-[#113624] border-[#C2E4CD] dark:border-[#1E5438] text-[#1B5E39] dark:text-[#A7F3D0]'
                  : 'border-[#D9DDD8] dark:border-[#253831] text-[#8B978F] hover:text-[#18211D] dark:hover:text-[#F7F5EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26]'
              }`}
              title={isSaved ? "Saved to your list" : "Save Standard"}
            >
              {isSaved ? (
                <Check className="w-4 h-4 text-[#1B5E39] dark:text-[#A7F3D0]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Standard Title */}
        <h3 className="text-sm sm:text-base font-bold text-[#18211D] dark:text-[#F7F5EF] leading-snug mb-3 group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] transition-colors">
          {standard.title}
        </h3>

        {/* Why This Standard Is Relevant Callout */}
        {(standard.reason_selected || standard.why_applicable) && (
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border-l-4 border-l-[#0D3328] dark:border-l-[#5B8272] border border-[#EFECE6] dark:border-[#253831] mb-4 space-y-2">
            <div>
              <p className="text-[11px] font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wider mb-1">
                Why This Standard Is Relevant
              </p>
              <p className="text-xs text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
                {standard.reason_selected || standard.why_applicable}
              </p>
            </div>
            {standard.primary_use_case && (
              <div className="pt-2 border-t border-[#EFECE6] dark:border-[#253831]">
                <p className="text-[10px] font-bold text-[#606E66] dark:text-[#BAC5BF] uppercase tracking-wider mb-0.5">
                  Primary Application
                </p>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  {standard.primary_use_case}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer row: Source Reference Tag + View Details CTA */}
      <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex flex-wrap items-center justify-between gap-3 mt-2">
        <div>
          <SourceReferenceTag sources={standard.source_refs || []} />
        </div>

        <Link
          href={`/standards/${encodeURIComponent(standard.is_number)}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] hover:text-[#164B3A] dark:text-[#8FA89B] dark:hover:text-[#A7B8AE] transition-colors group-hover:translate-x-0.5 transform duration-150 cursor-pointer ml-auto"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
