'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface AppHeaderProps {
  onMobileMenuToggle?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMobileMenuToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState('');

  const getPageTitle = () => {
    if (pathname === '/dashboard') return { title: 'Dashboard', category: 'Overview' };
    if (pathname.startsWith('/chat')) return { title: 'AI Chatbot', category: 'Guidance' };
    if (pathname.startsWith('/find-standards')) return { title: 'Find Standards', category: 'Discovery' };
    if (pathname.startsWith('/compare')) return { title: 'Compare Standards', category: 'Comparison' };
    if (pathname.startsWith('/standards/')) return { title: 'Standard Details', category: 'Standards' };
    if (pathname.startsWith('/saved-standards')) return { title: 'Saved Standards', category: 'Workspace' };
    if (pathname.startsWith('/history')) return { title: 'Chat History', category: 'Workspace' };
    if (pathname.startsWith('/settings')) return { title: 'Settings', category: 'Account' };
    return { title: 'BISaarthi', category: 'Platform' };
  };

  const { title, category } = getPageTitle();

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(quickQuery.trim())}`);
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-[#FAF9F5]/90 dark:bg-[#15221E]/90 backdrop-blur-md border-b border-[#D9DDD8] dark:border-[#253831] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl text-[#606E66] dark:text-[#BAC5BF] hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26] lg:hidden cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
          <span className="text-[#8B978F] hidden sm:inline truncate font-medium">
            {category}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8B978F] hidden sm:inline shrink-0" />
          <h1 className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle: Compact "Ask BISaarthi" Quick Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <form onSubmit={handleQuickAsk} className="w-full relative">
          <div className="relative flex items-center">
            <Sparkles className="w-4 h-4 text-[#5B8272] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask BISaarthi about any Indian Standard or product..."
              className="w-full pl-9 pr-16 py-1.5 text-xs rounded-full bg-[#FFFFFF] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] focus:outline-none focus:border-[#0D3328] focus:ring-2 focus:ring-[#5B8272]/20 text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 text-[11px] font-semibold bg-[#0D3328] hover:bg-[#164B3A] text-white rounded-full transition-colors cursor-pointer"
            >
              Ask
            </button>
          </div>
        </form>
      </div>

      {/* Right: Source verification status, Theme Toggle, & User profile avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F4EC] dark:bg-[#113624] border border-[#C2E4CD] dark:border-[#1E5438] text-[11px] font-semibold text-[#1B5E39] dark:text-[#A7F3D0]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D9D5D]" />
          <span>Authoritative Sources</span>
        </div>

        {/* Global Theme Toggle Button */}
        <ThemeToggle />

        <div className="flex items-center gap-2 pl-2 border-l border-[#D9DDD8] dark:border-[#253831]">
          <div className="w-8 h-8 rounded-full bg-[#0D3328] text-white font-bold text-xs flex items-center justify-center border border-[#5B8272]/40">
            AM
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] leading-tight">
              Aman Mishra
            </p>
            <p className="text-[10px] text-[#8B978F]">
              MSME Verified
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
