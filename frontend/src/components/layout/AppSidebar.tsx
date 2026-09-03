'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Search,
  Scale,
  Bookmark,
  History,
  Settings,
  Shield,
  Sun,
  Moon,
  Globe,
  LogOut,
  X,
  Menu,
} from 'lucide-react';

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const mainNav = [
    {
      name: 'AI Chatbot',
      href: '/chat',
      icon: MessageSquare,
    },
    {
      name: 'Find Standards',
      href: '/find-standards',
      icon: Search,
    },
    {
      name: 'Compare Standards',
      href: '/compare',
      icon: Scale,
    },
  ];

  const yourSpaceNav = [
    {
      name: 'Saved Standards',
      href: '/saved-standards',
      icon: Bookmark,
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
    },
  ];

  const accountNav = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-[#1E3A8A] flex items-center justify-center text-white shadow-md shadow-blue-900/40">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1">
                  BISaarthi
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded">
                    MVP
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">
                  AI Indian Standards Guide
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)]">
            {/* Dashboard Home Link */}
            <div>
              <Link
                href="/dashboard"
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span>Dashboard Overview</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Main
                </span>
              </div>

              <nav className="space-y-1">
                {mainNav.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#1E3A8A] text-white shadow-xs border border-blue-500/40'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? 'text-blue-300' : 'text-slate-400 group-hover:text-blue-400'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Your Space Navigation */}
            <div>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Your Space
                </span>
              </div>

              <nav className="space-y-1">
                {yourSpaceNav.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Account Navigation */}
            <div>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Account
                </span>
              </div>

              <nav className="space-y-1">
                {accountNav.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom User Profile & Preferences */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 space-y-2">
          {/* Quick Toggles: Language & Theme */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle language (English / Hindi)"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">{lang}</span>
            </button>

            {/* Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Light / Dark mode"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-blue-300" />
              )}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  Aman Mishra
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  MSME Manufacturer
                </p>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
