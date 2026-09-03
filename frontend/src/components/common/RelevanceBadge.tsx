import React from 'react';
import { RelevanceLevel } from '@/types';

interface RelevanceBadgeProps {
  relevance: RelevanceLevel;
  className?: string;
}

export const RelevanceBadge: React.FC<RelevanceBadgeProps> = ({ relevance, className = '' }) => {
  const getBadgeConfig = () => {
    switch (relevance) {
      case 'highly_relevant':
        return {
          label: 'Highly Relevant',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-800 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800/60',
        };
      case 'relevant':
        return {
          label: 'Relevant',
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800/60',
        };
      case 'possibly_relevant':
      default:
        return {
          label: 'Possibly Relevant',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-800 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800/60',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
};
