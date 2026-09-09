'use client';

import React from 'react';
import { ShieldCheck, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatEmptyStateProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  const { language, t } = useLanguage();

  const suggestedPrompts = [
    {
      title: language === 'HI' ? 'इलेक्ट्रिक गीज़र मानक' : 'Electric Geyser Standards',
      query: t('chat.suggested1'),
      tag: 'IS 2082 / IS 302',
    },
    {
      title: language === 'HI' ? 'घरेलू उपकरण सुरक्षा' : 'Household Appliance Safety',
      query: t('chat.suggested2'),
      tag: 'IS 302 (Part 1)',
    },
    {
      title: language === 'HI' ? 'पेयजल CPVC पाइप्स' : 'Potable Water CPVC Pipes',
      query: t('chat.suggested3'),
      tag: 'IS 15778:2007',
    },
    {
      title: language === 'HI' ? 'इलेक्ट्रिक रूम हीटर' : 'Electric Room Heaters',
      query: t('chat.suggested4'),
      tag: 'IS 369:2019',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Centered Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0D3328] dark:bg-[#1E3B30] text-white shadow-md border border-[#5B8272]/40 mb-1">
          <ShieldCheck className="w-7 h-7 text-[#A7B8AE]" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight">
          {t('chat.emptyHeading')}
        </h2>

        <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] max-w-xl mx-auto leading-relaxed">
          {t('chat.emptyDesc')}
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F4EC] dark:bg-[#113624] border border-[#C2E4CD] dark:border-[#1E5438] text-[11px] font-semibold text-[#1B5E39] dark:text-[#A7F3D0]">
          <Sparkles className="w-3.5 h-3.5 text-[#2D9D5D]" />
          <span>{t('chat.corpusMetadataTag')}</span>
        </div>
      </div>

      {/* Suggested Inquiries Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-[#5B8272]" />
          <span>{t('chat.suggested')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestedPrompts.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectPrompt?.(item.query)}
              className="group text-left p-3.5 rounded-2xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] hover:border-[#5B8272] dark:hover:border-[#5B8272] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#A7F3D0] transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] border border-[#D9DDD8] dark:border-[#253831] shrink-0">
                  {item.tag}
                </span>
              </div>

              <p className="text-[11.5px] text-[#606E66] dark:text-[#BAC5BF] leading-relaxed line-clamp-2">
                {item.query}
              </p>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5B8272] group-hover:text-[#0D3328] dark:group-hover:text-white pt-1">
                <span>{language === 'HI' ? 'पूछें' : 'Ask'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


