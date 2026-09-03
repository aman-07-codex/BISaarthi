import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

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
      className={`p-3.5 rounded-lg border-l-4 border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-xs space-y-1">
        <p className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
          <span>Authoritative Verification Notice</span>
        </p>
        <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};
