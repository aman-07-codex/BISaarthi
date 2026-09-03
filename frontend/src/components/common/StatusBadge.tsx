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
          bg: 'bg-[#E8F4EC] dark:bg-[#113624]',
          text: 'text-[#1B5E39] dark:text-[#A7F3D0]',
          border: 'border-[#C2E4CD] dark:border-[#1E5438]',
          dot: 'bg-[#2D9D5D]',
        };
      case 'mandatory':
        return {
          label: 'Mandatory Certification',
          bg: 'bg-[#FDF2EE] dark:bg-[#3E1A14]',
          text: 'text-[#9E3A20] dark:text-[#FECACA]',
          border: 'border-[#FBE0D6] dark:border-[#5C2B20]',
          dot: 'bg-[#C86D51]',
        };
      case 'voluntary':
        return {
          label: 'Voluntary Scheme',
          bg: 'bg-[#E8EFEA] dark:bg-[#1B2B26]',
          text: 'text-[#0D3328] dark:text-[#BAC5BF]',
          border: 'border-[#D9DDD8] dark:border-[#253831]',
          dot: 'bg-[#5B8272]',
        };
      case 'under_revision':
        return {
          label: 'Under Revision',
          bg: 'bg-[#FAF4EB] dark:bg-[#38240D]',
          text: 'text-[#8C6126] dark:text-[#FDE68A]',
          border: 'border-[#F2E4CD] dark:border-[#523A1B]',
          dot: 'bg-[#B88746]',
        };
      case 'superseded':
        return {
          label: 'Superseded',
          bg: 'bg-[#EFECE6] dark:bg-[#20312B]',
          text: 'text-[#606E66] dark:text-[#BAC5BF]',
          border: 'border-[#D9DDD8] dark:border-[#253831]',
          dot: 'bg-[#8B978F]',
        };
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          bg: 'bg-[#FDF2EE] dark:bg-[#3E1A14]',
          text: 'text-[#9E3A20] dark:text-[#FECACA]',
          border: 'border-[#FBE0D6] dark:border-[#5C2B20]',
          dot: 'bg-[#C86D51]',
        };
      case 'unknown':
      default:
        return {
          label: 'Status Unverified',
          bg: 'bg-[#EFECE6] dark:bg-[#20312B]',
          text: 'text-[#606E66] dark:text-[#BAC5BF]',
          border: 'border-[#D9DDD8] dark:border-[#253831]',
          dot: 'bg-[#8B978F]',
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
