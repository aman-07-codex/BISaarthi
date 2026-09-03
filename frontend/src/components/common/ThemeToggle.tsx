'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'icon' | 'compact';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'icon',
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] text-xs font-semibold text-[#18211D] dark:text-[#F7F5EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-all cursor-pointer shadow-2xs ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-[#B88746]" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-[#5B8272]" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] text-[#18211D] dark:text-[#F7F5EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#B88746] transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#5B8272] transition-transform rotate-0 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
