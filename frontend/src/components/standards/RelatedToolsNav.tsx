'use client';

import React from 'react';
import Link from 'next/link';
import { FlaskConical, Building2, ArrowRight } from 'lucide-react';

interface RelatedToolsNavProps {
  isNumber: string;
  className?: string;
}

export const RelatedToolsNav: React.FC<RelatedToolsNavProps> = ({ isNumber, className = '' }) => {
  const encoded = encodeURIComponent(isNumber);

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
          Related Compliance Tools
        </h3>
        <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
          Drill down into testing procedures and accredited laboratory networks for this standard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 1: Tests & Certification */}
        <Link
          href={`/standards/${encoded}/tests-certification`}
          className="group p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] hover:border-[#5B8272] hover:shadow-xs transition-all flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] transition-colors">
                Tests & Certification
              </h4>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] line-clamp-2 mt-0.5 leading-relaxed">
                Explore mandatory/voluntary test routines, Scheme-I ISI Mark procedures, and compliance checklists.
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#8B978F] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Tool 2: Laboratories */}
        <Link
          href={`/standards/${encoded}/laboratories`}
          className="group p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] hover:border-[#5B8272] hover:shadow-xs transition-all flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] transition-colors">
                Recognized Laboratories
              </h4>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] line-clamp-2 mt-0.5 leading-relaxed">
                Directory of BIS central, regional, and NABL-accredited third-party testing laboratories.
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#8B978F] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
