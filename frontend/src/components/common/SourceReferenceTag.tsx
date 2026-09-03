'use client';

import React, { useState } from 'react';
import { SourceRef } from '@/types';
import { ShieldCheck, X, BookOpen } from 'lucide-react';

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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E8EFEA] hover:bg-[#DCE7E0] dark:bg-[#1B2B26] dark:hover:bg-[#20312B] text-[#0D3328] dark:text-[#A7B8AE] border border-[#D9DDD8] dark:border-[#253831] transition-colors cursor-pointer ${className}`}
        title="View authoritative BIS source reference"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#5B8272] dark:text-[#8FA89B] shrink-0" />
        <span className="truncate max-w-[180px]">
          {primarySource.title || 'Authoritative Source'}
        </span>
        {sources.length > 1 && (
          <span className="text-[10px] bg-[#5B8272]/20 dark:bg-[#5B8272]/40 px-1 rounded text-[#0D3328] dark:text-[#F7F5EF]">
            +{sources.length - 1}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091E18]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] dark:bg-[#15221E] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#D9DDD8] dark:border-[#253831] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#1C2E28] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] flex items-center justify-center border border-[#D9DDD8] dark:border-[#253831]">
                  <ShieldCheck className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Authoritative BIS Sources
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                    Retrieved from official standards & gazettes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#8B978F] hover:text-[#18211D] dark:hover:text-white p-1 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {sources.map((src, idx) => (
                <div
                  key={src.source_id || idx}
                  className="p-3.5 rounded-xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18211D] dark:text-[#F7F5EF]">
                      <BookOpen className="w-3.5 h-3.5 text-[#0D3328] dark:text-[#8FA89B] shrink-0" />
                      <span>{src.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        src.reliability_tier === 'primary'
                          ? 'bg-[#E8F4EC] dark:bg-[#113624] text-[#1B5E39] dark:text-[#A7F3D0] border border-[#C2E4CD] dark:border-[#1E5438]'
                          : 'bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#BAC5BF] border border-[#D9DDD8] dark:border-[#253831]'
                      }`}
                    >
                      {src.reliability_tier === 'primary' ? 'Primary BIS' : 'Government Source'}
                    </span>
                  </div>

                  {src.source_type && (
                    <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                      Type: <span className="font-mono text-[11px] text-[#18211D] dark:text-[#BAC5BF]">{src.source_type}</span>
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#8B978F]">
                    <span>In-app verified reference</span>
                    {src.reference_url && (
                      <span className="font-mono text-[10px] text-[#8B978F] truncate max-w-[200px]">
                        {src.reference_url}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#EFECE6] hover:bg-[#E5E2DC] dark:bg-[#1B2B26] dark:hover:bg-[#20312B] text-[#18211D] dark:text-[#F7F5EF]"
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
