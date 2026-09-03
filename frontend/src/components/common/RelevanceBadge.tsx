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
          bg: 'bg-[#E8F4EC] dark:bg-[#113624]',
          text: 'text-[#1B5E39] dark:text-[#A7F3D0]',
          border: 'border-[#C2E4CD] dark:border-[#1E5438]',
        };
      case 'relevant':
        return {
          label: 'Relevant',
          bg: 'bg-[#E8EFEA] dark:bg-[#1B2B26]',
          text: 'text-[#0D3328] dark:text-[#BAC5BF]',
          border: 'border-[#D9DDD8] dark:border-[#253831]',
        };
      case 'possibly_relevant':
      default:
        return {
          label: 'Possibly Relevant',
          bg: 'bg-[#FAF4EB] dark:bg-[#38240D]',
          text: 'text-[#8C6126] dark:text-[#FDE68A]',
          border: 'border-[#F2E4CD] dark:border-[#523A1B]',
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
