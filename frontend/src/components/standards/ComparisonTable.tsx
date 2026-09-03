'use client';

import React from 'react';
import { ComparisonRow } from '@/types';
import { AlertCircle } from 'lucide-react';

interface ComparisonTableProps {
  standard1Number: string;
  standard2Number: string;
  rows: ComparisonRow[];
  className?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  standard1Number,
  standard2Number,
  rows,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] shadow-2xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/80">
              <th className="py-4 px-5 sm:px-6 text-xs font-black text-[#606E66] dark:text-[#BAC5BF] uppercase tracking-wider w-1/4">
                Comparison Dimension
              </th>
              <th className="py-4 px-5 sm:px-6 text-xs font-black font-mono text-[#0D3328] dark:text-[#8FA89B] w-[37.5%] border-l border-[#D9DDD8] dark:border-[#253831]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D3328] dark:bg-[#8FA89B]" />
                  <span>{standard1Number}</span>
                </div>
              </th>
              <th className="py-4 px-5 sm:px-6 text-xs font-black font-mono text-[#5B8272] dark:text-[#BAC5BF] w-[37.5%] border-l border-[#D9DDD8] dark:border-[#253831]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5B8272] dark:bg-[#BAC5BF]" />
                  <span>{standard2Number}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6] dark:divide-[#1C2E28] text-xs sm:text-sm">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26]/50 transition-colors"
              >
                {/* Category Column */}
                <td className="py-4 px-5 sm:px-6 font-bold text-[#18211D] dark:text-[#F7F5EF] bg-[#FAF9F5]/40 dark:bg-[#1B2B26]/20 align-top">
                  <div className="space-y-1">
                    <p>{row.category}</p>
                    {row.requires_verification && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8C6126] dark:text-[#FDE68A] bg-[#FAF4EB] dark:bg-[#38240D] px-2 py-0.5 rounded-full border border-[#F2E4CD] dark:border-[#523A1B]">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Requires source verification</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Standard 1 Value */}
                <td className="py-4 px-5 sm:px-6 text-[#18211D] dark:text-[#BAC5BF] border-l border-[#EFECE6] dark:border-[#253831] align-top leading-relaxed text-xs sm:text-sm">
                  {row.standard1_value === 'Requires source verification' ? (
                    <span className="text-[#8B978F] italic">Requires source verification</span>
                  ) : (
                    row.standard1_value
                  )}
                </td>

                {/* Standard 2 Value */}
                <td className="py-4 px-5 sm:px-6 text-[#18211D] dark:text-[#BAC5BF] border-l border-[#EFECE6] dark:border-[#253831] align-top leading-relaxed text-xs sm:text-sm">
                  {row.standard2_value === 'Requires source verification' ? (
                    <span className="text-[#8B978F] italic">Requires source verification</span>
                  ) : (
                    row.standard2_value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
