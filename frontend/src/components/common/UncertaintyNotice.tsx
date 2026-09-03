import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UncertaintyNoticeProps {
  message?: string;
  className?: string;
}

export const UncertaintyNotice: React.FC<UncertaintyNoticeProps> = ({
  message = "This information could not be conclusively verified against authoritative BIS databases. Always confirm with the official Bureau of Indian Standards before taking regulatory actions.",
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border-l-4 border-l-[#B88746] bg-[#FAF4EB] dark:bg-[#38240D]/40 border border-[#F2E4CD] dark:border-[#523A1B] text-[#8C6126] dark:text-[#FDE68A] flex items-start gap-3 shadow-2xs ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-[#B88746] dark:text-[#FDE68A] shrink-0 mt-0.5" />
      <div className="text-xs space-y-1">
        <p className="font-bold text-[#8C6126] dark:text-[#FDE68A] flex items-center gap-1.5">
          <span>Authoritative Verification Notice</span>
        </p>
        <p className="text-[#8C6126]/90 dark:text-[#FDE68A]/90 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};
