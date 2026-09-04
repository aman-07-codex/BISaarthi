'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DisclaimerFooterProps {
  className?: string;
}

export const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({ className = '' }) => {
  const { t } = useLanguage();

  return (
    <footer
      className={`border-t border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5]/80 dark:bg-[#15221E]/60 py-4 px-6 text-center text-xs text-[#606E66] dark:text-[#BAC5BF] ${className}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#0D3328] dark:text-[#A7B8AE]">
          <Shield className="w-3.5 h-3.5 text-[#5B8272] shrink-0" />
        </div>
        <p className="leading-normal">
          {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
};
