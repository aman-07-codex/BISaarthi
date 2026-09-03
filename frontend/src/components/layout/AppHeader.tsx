'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Sparkles, ChevronRight, ShieldCheck, Bell } from 'lucide-react';

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
    // In UI MVP, navigate to chat with query or find-standards
    router.push(`/chat?prompt=${encodeURIComponent(quickQuery.trim())}`);
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
          <span className="text-slate-400 dark:text-slate-400 hidden sm:inline truncate">
            {category}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
          <h1 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle: Compact "Ask BISaarthi" Quick Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <form onSubmit={handleQuickAsk} className="w-full relative">
          <div className="relative flex items-center">
            <Sparkles className="w-4 h-4 text-[#2563EB] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask BISaarthi about any Indian Standard or product..."
              className="w-full pl-9 pr-16 py-1.5 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-0.5 text-[11px] font-semibold bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-full transition-colors cursor-pointer"
            >
              Ask
            </button>
          </div>
        </form>
      </div>

      {/* Right: Source verification status & User profile avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Authoritative Sources</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-semibold text-xs flex items-center justify-center border border-blue-400/30">
            AM
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              Aman Mishra
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              MSME Verified
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
