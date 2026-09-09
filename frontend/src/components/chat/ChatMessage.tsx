'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChatMessageData } from '@/types';
import { StandardCard } from '@/components/standards/StandardCard';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  FileText,
  Database,
  ExternalLink,
  BookOpen,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // User Message: Modern clean right-aligned conversational bubble
  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-in fade-in duration-150">
        <div className="max-w-[90%] sm:max-w-2xl flex flex-col items-end gap-1">
          <div className="bg-[#0D3328] dark:bg-[#1A382D] text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl rounded-tr-xs shadow-2xs text-sm sm:text-[14.5px] leading-relaxed break-words">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.created_at && (
            <span className="text-[10px] text-[#8B978F] px-1 font-medium">
              {message.created_at}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Determine Response Mode Badge
  const isInsufficientContext =
    message.response_mode === 'insufficient_context' ||
    message.grounding_status === 'insufficient_context';
  const isMetadataFallback =
    message.response_mode === 'metadata_fallback' ||
    message.grounding_status === 'partially_grounded';

  const modeBadge = isInsufficientContext ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] dark:bg-[#3D2C10] text-[#92400E] dark:text-[#FCD34D] border border-[#FDE68A] dark:border-[#523A1B]">
      <ShieldAlert className="w-3 h-3 shrink-0" />
      <span>{t('chat.modeInsufficient')}</span>
    </span>
  ) : isMetadataFallback ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] dark:bg-[#133026] text-[#137333] dark:text-[#81C995] border border-[#CEEAD6] dark:border-[#1E5438]">
      <Database className="w-3 h-3 shrink-0" />
      <span>{t('chat.modeMetadata')}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] border border-[#D9DDD8] dark:border-[#253831]">
      <ShieldCheck className="w-3 h-3 shrink-0" />
      <span>{t('chat.modeGrounded')}</span>
    </span>
  );

  // Assistant Message: Modern flowing AI response
  return (
    <div className="flex justify-start mb-8 animate-in fade-in duration-150 w-full">
      <div className="w-full flex items-start gap-3 sm:gap-4">
        {/* BISaarthi Assistant Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0D3328] dark:bg-[#1E3B30] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-[#5B8272]/40">
          <ShieldCheck className="w-4 h-4 text-[#A7B8AE]" />
        </div>

        {/* Conversational Assistant Body */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header row: Assistant Name + Grounding Badge + Timestamp */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                BISaarthi
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] border border-[#D9DDD8] dark:border-[#253831]">
                {t('chat.assistantBadge')}
              </span>
              {modeBadge}
            </div>

            {message.created_at && (
              <span className="text-[10px] text-[#8B978F]">
                {message.created_at}
              </span>
            )}
          </div>

          {/* Insufficient Context Special Banner */}
          {isInsufficientContext && (
            <div className="p-3.5 rounded-xl bg-[#FEF3C7]/60 dark:bg-[#3D2C10]/40 border border-[#FDE68A] dark:border-[#523A1B] text-[#92400E] dark:text-[#FCD34D] text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold">{t('chat.modeInsufficient')}</p>
                <p>{t('chat.insufficientContextDesc')}</p>
              </div>
            </div>
          )}

          {/* Flowing Markdown Text Content */}
          <div className="text-sm sm:text-[14.5px] text-[#18211D] dark:text-[#E2E8E5] leading-relaxed space-y-3.5">
            {message.content.split('\n\n').map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();

              // Section Header
              if (trimmed.startsWith('### ')) {
                const title = trimmed.replace('### ', '');
                const isEvidenceHeader =
                  title.toLowerCase().includes('evidence limitation') ||
                  title.toLowerCase().includes('साक्ष्य सीमा') ||
                  title.toLowerCase().includes('संदर्भ एवं साक्ष्य सीमा');

                if (isEvidenceHeader) {
                  return null;
                }

                return (
                  <h4
                    key={pIdx}
                    className="font-black text-sm sm:text-base mt-4 mb-2 flex items-center gap-2 text-[#18211D] dark:text-[#F7F5EF]"
                  >
                    <span className="w-1.5 h-4 rounded-full inline-block bg-[#5B8272]" />
                    <span>{title}</span>
                  </h4>
                );
              }

              // Numbered List
              if (trimmed.includes('\n1. ') || /^\d+\.\s+/.test(trimmed)) {
                const items = trimmed.split('\n');
                return (
                  <div key={pIdx} className="space-y-2 my-2.5 pl-0.5">
                    {items.map((line, lIdx) => {
                      const match = line.match(/^(\d+)\.\s+(.*)$/);
                      if (match) {
                        return (
                          <div
                            key={lIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-[#18211D] dark:text-[#BAC5BF]"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#A7F3D0] border border-[#D9DDD8] dark:border-[#253831] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {match[1]}
                            </span>
                            <div className="flex-1 leading-relaxed">
                              {renderFormattedText(match[2])}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <p key={lIdx} className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF]">
                          {renderFormattedText(line)}
                        </p>
                      );
                    })}
                  </div>
                );
              }

              // Bullet List (handles •, -, *)
              if (
                trimmed.includes('\n• ') ||
                trimmed.includes('\n- ') ||
                trimmed.includes('\n* ') ||
                /^[•\-*]\s+/.test(trimmed)
              ) {
                const items = trimmed.split('\n');
                return (
                  <div key={pIdx} className="space-y-2 my-2.5 pl-0.5">
                    {items.map((line, lIdx) => {
                      const cleanLine = line.replace(/^[•\-*]\s+/, '');
                      return (
                        <div
                          key={lIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[#18211D] dark:text-[#BAC5BF]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B8272] shrink-0 mt-2" />
                          <div className="flex-1 leading-relaxed">
                            {renderFormattedText(cleanLine)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Suppress Evidence Limitation Paragraph Callout / Disclaimers
              if (
                trimmed.toLowerCase().includes('evidence limitation') ||
                trimmed.toLowerCase().includes('साक्ष्य सीमा') ||
                trimmed.toLowerCase().includes('official bis documentation') ||
                trimmed.toLowerCase().includes('आधिकारिक बीआईएस दस्तावेजों') ||
                trimmed.toLowerCase().includes('exact technical and legal applicability')
              ) {
                return null;
              }

              return (
                <p key={pIdx} className="text-xs sm:text-sm text-[#18211D] dark:text-[#E2E8E5] leading-relaxed">
                  {renderFormattedText(trimmed)}
                </p>
              );
            })}
          </div>

          {/* Supporting Standard Cards */}
          {message.standard_cards && message.standard_cards.length > 0 && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#EFECE6] dark:border-[#1C2E28]">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5B8272]" />
                  <span className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wider">
                    {language === 'HI' ? 'संदर्भित भारतीय मानक' : 'Relevant Indian Standards'} (
                    {message.standard_cards.length})
                  </span>
                </div>
                <span className="text-[11px] text-[#8B978F]">
                  {t('chat.clickToInspect')}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {message.standard_cards.map((std) => (
                  <StandardCard key={std.is_number} standard={std} />
                ))}
              </div>
            </div>
          )}

          {/* Dedicated Sources / BISaarthi Evidence Section */}
          {message.citations && message.citations.length > 0 && (
            <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B]">
                  <BookOpen className="w-3.5 h-3.5 text-[#5B8272]" />
                  <span>{t('chat.sourcesHeading')}</span>
                  <span className="text-[10px] text-[#8B978F] font-normal">
                    ({message.citations.length})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.citations.map((cit, cIdx) => {
                  const isMetadataOnly =
                    cit.chunk_id.startsWith('meta-') ||
                    cit.section === 'Corpus Metadata' ||
                    isMetadataFallback;

                  return (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] hover:border-[#5B8272] dark:hover:border-[#5B8272] transition-colors flex flex-col justify-between gap-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#0D3328] dark:text-[#A7F3D0] tracking-tight">
                          {cit.is_number}
                        </span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                            isMetadataOnly
                              ? 'bg-[#E8F4EC] dark:bg-[#133026] text-[#137333] dark:text-[#81C995]'
                              : 'bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B]'
                          }`}
                        >
                          {isMetadataOnly
                            ? language === 'HI'
                              ? 'कॉर्पस मेटाडेटा'
                              : 'Corpus Metadata'
                            : cit.section || 'Standard Chunk'}
                        </span>
                      </div>

                      {cit.title && (
                        <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] line-clamp-1 leading-snug">
                          {cit.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-[#FAF9F5] dark:border-[#1E2E28] text-[10.5px] text-[#8B978F]">
                        <span className="font-mono text-[9px] truncate max-w-[140px]">
                          ID: {cit.chunk_id}
                        </span>
                        <Link
                          href={`/standards?is_number=${encodeURIComponent(cit.is_number)}`}
                          className="inline-flex items-center gap-0.5 text-[#5B8272] hover:text-[#0D3328] dark:hover:text-white font-medium transition-colors"
                        >
                          <span>{language === 'HI' ? 'देखें' : 'View'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          {/* Actions & Source Citations Row */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#8B978F] font-semibold">
                {language === 'HI' ? 'प्रामाणिकता:' : 'Authority:'}
              </span>
              {message.source_refs && message.source_refs.length > 0 ? (
                <SourceReferenceTag sources={message.source_refs} />
              ) : (
                <span className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] inline-flex items-center gap-1">
                  <Database className="w-3 h-3 text-[#5B8272]" />
                  <span>{t('chat.corpusMetadataTag')}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-[#606E66] dark:text-[#8FA89B] hover:text-[#0D3328] dark:hover:text-white px-2 py-1 rounded-md hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26] transition-colors cursor-pointer"
              title={t('chat.copyBtn')}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2D9D5D]" />
                  <span className="text-[#2D9D5D] font-bold">
                    {t('chat.copySuccess')}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('chat.copyBtn')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Simple text formatter for bold **text** and standard codes */
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

