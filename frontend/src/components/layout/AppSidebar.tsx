'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  MessageSquare,
  Search,
  Scale,
  Bookmark,
  History,
  Settings,
  Sun,
  Moon,
  Globe,
  LogOut,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

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
  const { isDark, toggleTheme } = useTheme();

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
          className="fixed inset-0 z-40 bg-[#071F18]/70 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#091E18] text-[#FAF9F5] flex flex-col justify-between border-r border-[#16382E] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#16382E]">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs">
                <Image
                  src="/bisaarthi-logo.png"
                  alt="BISaarthi Emblem"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wide text-white uppercase flex items-center gap-1.5">
                  BISaarthi
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-[#5B8272]/30 text-[#A7B8AE] border border-[#5B8272]/40 rounded-full">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-[#8FA89B] tracking-tight">
                  Your AI Standards Guide
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1 rounded-lg text-[#8FA89B] hover:text-white hover:bg-[#12332A] lg:hidden"
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
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-[#164B3A] text-white border border-[#5B8272]/40 shadow-xs'
                    : 'text-[#BAC5BF] hover:bg-[#12332A] hover:text-white'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className={`w-2 h-2 rounded-full ${pathname === '/dashboard' ? 'bg-[#A7B8AE]' : 'bg-[#5B8272]'}`} />
                </div>
                <span>Dashboard Overview</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-[#8FA89B] uppercase">
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
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#164B3A] text-white shadow-xs border border-[#5B8272]/40'
                          : 'text-[#BAC5BF] hover:bg-[#12332A] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? 'text-[#A7B8AE]' : 'text-[#8FA89B] group-hover:text-[#A7B8AE]'
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
                <span className="text-[11px] font-bold tracking-wider text-[#8FA89B] uppercase">
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
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#164B3A] text-white border border-[#5B8272]/40'
                          : 'text-[#BAC5BF] hover:bg-[#12332A] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? 'text-[#A7B8AE]' : 'text-[#8FA89B] group-hover:text-[#BAC5BF]'
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
                <span className="text-[11px] font-bold tracking-wider text-[#8FA89B] uppercase">
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
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#164B3A] text-white border border-[#5B8272]/40'
                          : 'text-[#BAC5BF] hover:bg-[#12332A] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? 'text-[#A7B8AE]' : 'text-[#8FA89B] group-hover:text-[#BAC5BF]'
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
        <div className="p-3 border-t border-[#16382E] bg-[#071712] space-y-2">
          {/* Quick Toggles: Language & Theme */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#091E18] border border-[#16382E] text-xs text-[#BAC5BF]">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#12332A] text-[#BAC5BF] hover:text-white transition-colors cursor-pointer"
              title="Toggle language (English / Hindi)"
            >
              <Globe className="w-3.5 h-3.5 text-[#5B8272]" />
              <span className="font-semibold">{lang}</span>
            </button>

            {/* Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#12332A] text-[#BAC5BF] hover:text-white transition-colors cursor-pointer"
              title="Toggle Light / Dark mode"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#B88746]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#A7B8AE]" />
              )}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#091E18] border border-[#16382E]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#164B3A] text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-[#5B8272]/40">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  Aman Mishra
                </p>
                <p className="text-[10px] text-[#8FA89B] truncate">
                  MSME Manufacturer
                </p>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-lg text-[#8FA89B] hover:text-[#C86D51] hover:bg-[#12332A] transition-colors"
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
