'use client';

import React from 'react';
import { ComparisonRow } from '@/types';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

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
    <div className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60">
              <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">
                Comparison Dimension
              </th>
              <th className="py-3.5 px-4 sm:px-6 text-xs font-bold font-mono text-[#1E3A8A] dark:text-blue-400 w-[37.5%] border-l border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>{standard1Number}</span>
                </div>
              </th>
              <th className="py-3.5 px-4 sm:px-6 text-xs font-bold font-mono text-[#1E3A8A] dark:text-blue-400 w-[37.5%] border-l border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span>{standard2Number}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs sm:text-sm">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors"
              >
                {/* Category Column */}
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/30 dark:bg-slate-900/20 align-top">
                  <div className="space-y-1">
                    <p>{row.category}</p>
                    {row.requires_verification && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/80">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Requires source verification</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Standard 1 Value */}
                <td className="py-3.5 px-4 sm:px-6 text-slate-700 dark:text-slate-300 border-l border-slate-200/60 dark:border-slate-700/60 align-top leading-relaxed text-xs sm:text-sm">
                  {row.standard1_value === 'Requires source verification' ? (
                    <span className="text-slate-400 italic">Requires source verification</span>
                  ) : (
                    row.standard1_value
                  )}
                </td>

                {/* Standard 2 Value */}
                <td className="py-3.5 px-4 sm:px-6 text-slate-700 dark:text-slate-300 border-l border-slate-200/60 dark:border-slate-700/60 align-top leading-relaxed text-xs sm:text-sm">
                  {row.standard2_value === 'Requires source verification' ? (
                    <span className="text-slate-400 italic">Requires source verification</span>
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
