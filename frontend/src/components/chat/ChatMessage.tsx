'use client';

import React from 'react';
import { ChatMessageData } from '@/types';
import { StandardCard } from '@/components/standards/StandardCard';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { ShieldCheck, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-in fade-in duration-150">
        <div className="max-w-[85%] sm:max-w-xl flex items-start gap-2.5">
          <div className="bg-[#0D3328] text-white p-4 rounded-2xl rounded-tr-xs shadow-xs text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
            <div className="text-[10px] text-[#A7B8AE] text-right mt-1.5 font-medium">
              {message.created_at}
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] flex items-center justify-center shrink-0 mt-1 text-[#0D3328] dark:text-[#A7B8AE] border border-[#D9DDD8] dark:border-[#253831]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl flex items-start gap-3">
        {/* Subtle AI Icon Badge */}
        <div className="w-8 h-8 rounded-full bg-[#0D3328] text-white flex items-center justify-center shrink-0 shadow-xs mt-1 border border-[#5B8272]/40">
          <ShieldCheck className="w-4 h-4 text-[#A7B8AE]" />
        </div>

        {/* AI Response Card */}
        <div className="flex-1 min-w-0 bg-[#FAF9F5] dark:bg-[#15221E] rounded-3xl rounded-tl-xs border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-6 shadow-xs space-y-4">
          {/* Main content body with formatted text */}
          <div className="text-sm text-[#18211D] dark:text-[#F7F5EF] leading-relaxed space-y-3">
            {message.content.split('\n\n').map((paragraph, pIdx) => {
              // Simple markdown headers
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="font-bold text-[#18211D] dark:text-white text-sm mt-3 mb-1">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }

              // Simple numbered/bullet list rendering
              if (paragraph.includes('\n1. ') || paragraph.startsWith('1. ')) {
                const items = paragraph.split('\n');
                return (
                  <div key={pIdx} className="space-y-1.5 my-2 pl-1">
                    {items.map((line, lIdx) => (
                      <p key={lIdx} className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF]">
                        {renderFormattedText(line)}
                      </p>
                    ))}
                  </div>
                );
              }

              return (
                <p key={pIdx} className="text-xs sm:text-sm">
                  {renderFormattedText(paragraph)}
                </p>
              );
            })}
          </div>

          {/* Embedded Standard Cards */}
          {message.standard_cards && message.standard_cards.length > 0 && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wider">
                  Relevant Indian Standards ({message.standard_cards.length})
                </span>
                <span className="text-[11px] text-[#8B978F]">
                  Applicable Standards
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3.5">
                {message.standard_cards.map((std) => (
                  <StandardCard key={std.is_number} standard={std} />
                ))}
              </div>
            </div>
          )}

          {/* Uncertainty Notice if present */}
          {message.uncertainty_notice && (
            <div className="pt-1">
              <UncertaintyNotice message={message.uncertainty_notice} />
            </div>
          )}

          {/* Source Reference Tag Chips & Timestamp */}
          <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#8B978F] font-medium">Sources:</span>
              {message.source_refs && message.source_refs.length > 0 ? (
                <SourceReferenceTag sources={message.source_refs} />
              ) : (
                <span className="text-[11px] text-[#8B978F]">BIS Official Portal</span>
              )}
            </div>
            <span className="text-[10px] text-[#8B978F]">
              {message.created_at}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Simple text formatter for bold **text** strings */
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-[#18211D] dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
