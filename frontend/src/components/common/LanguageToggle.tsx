'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'icon' | 'header';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-all cursor-pointer shadow-2xs ${className}`}
        title={t('nav.toggleLang', 'Toggle language (English / Hindi)')}
        aria-label="Toggle Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#5B8272]" />
        <span>{language === 'EN' ? 'हिन्दी' : 'English'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-all cursor-pointer shadow-2xs ${className}`}
      title={t('nav.toggleLang', 'Toggle language (English / Hindi)')}
      aria-label="Toggle Language"
    >
      <Globe className="w-3.5 h-3.5 text-[#5B8272]" />
      <span className="tracking-tight">{language === 'EN' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
};
