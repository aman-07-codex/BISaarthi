import React from 'react';
import { Shield } from 'lucide-react';

interface DisclaimerFooterProps {
  className?: string;
}

export const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <Shield className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
          <span>Regulatory Disclaimer:</span>
        </div>
        <p className="leading-normal">
          BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
        </p>
      </div>
    </footer>
  );
};
