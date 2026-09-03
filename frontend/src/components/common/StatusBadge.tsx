import React from 'react';
import { StandardStatus, TestApplicability } from '@/types';

interface StatusBadgeProps {
  status: StandardStatus | TestApplicability;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'mandatory':
        return {
          label: 'Mandatory Certification',
          bg: 'bg-red-50 dark:bg-red-950/50',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          dot: 'bg-red-500',
        };
      case 'voluntary':
        return {
          label: 'Voluntary Scheme',
          bg: 'bg-blue-50 dark:bg-blue-950/50',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'under_revision':
        return {
          label: 'Under Revision',
          bg: 'bg-amber-50 dark:bg-amber-950/50',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'superseded':
        return {
          label: 'Superseded',
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          bg: 'bg-rose-50 dark:bg-rose-950/50',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
      case 'unknown':
      default:
        return {
          label: 'Status Unverified',
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
