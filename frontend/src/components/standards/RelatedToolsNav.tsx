'use client';

import React from 'react';
import Link from 'next/link';
import { FlaskConical, Building2, ArrowRight, ShieldAlert } from 'lucide-react';

interface RelatedToolsNavProps {
  isNumber: string;
  className?: string;
}

export const RelatedToolsNav: React.FC<RelatedToolsNavProps> = ({ isNumber, className = '' }) => {
  const encoded = encodeURIComponent(isNumber);

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Related Compliance Tools
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Drill down into testing procedures and accredited laboratory networks for this standard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 1: Tests & Certification */}
        <Link
          href={`/standards/${encoded}/tests-certification`}
          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                Tests & Certification
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                Explore mandatory/voluntary test routines, Scheme-I ISI Mark procedures, and compliance checklists.
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Tool 2: Laboratories */}
        <Link
          href={`/standards/${encoded}/laboratories`}
          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                Recognized Laboratories
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                Directory of BIS central, regional, and NABL-accredited third-party testing laboratories.
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
