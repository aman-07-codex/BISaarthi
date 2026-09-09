'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { SourceRef } from '@/types';
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Check,
  Sliders,
  Info,
  LogOut,
  LogIn,
} from 'lucide-react';

const VERIFIED_SAMPLE_SOURCES: SourceRef[] = [
  {
    source_id: 'bis-is302',
    title: 'IS 302-1: Safety of Household Electrical Appliances',
    reference_url: 'https://standards.bis.gov.in',
    reliability_tier: 'primary',
    source_type: 'bis_standard',
  },
  {
    source_id: 'dpiit-qco',
    title: 'DPIIT Electrical Appliances Quality Control Order',
    reference_url: 'https://dpiit.gov.in',
    reliability_tier: 'primary',
    source_type: 'qco_order',
  },
];

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleResetPreferences = () => {
    setLanguage('EN');
    setTheme('system');
    showToast('Preferences restored to defaults.');
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto pb-8">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#606E66] dark:text-[#BAC5BF]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href="/dashboard"
              className="text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white font-medium"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              Settings
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>Application Preferences</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
            <Settings className="w-5 h-5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
            Settings
          </h1>

          <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
            Manage your BISaarthi preferences and application experience.
          </p>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0D3328] text-white px-4 py-2.5 rounded-full shadow-lg border border-[#5B8272]/40 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-3 duration-150">
            <Check className="w-4 h-4 text-[#A7B8AE]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. PROFILE / AUTH SECTION */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                  Account Status
                </h2>
                <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                  {isAuthenticated ? 'Authenticated user profile' : 'Guest session active'}
                </p>
              </div>
            </div>

            {isAuthenticated ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => {
                  logout();
                  showToast('Logged out successfully.');
                }}
                className="font-bold text-xs"
              >
                Log Out
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="pill"
                  size="sm"
                  icon={<LogIn className="w-3.5 h-3.5" />}
                  className="font-bold text-xs"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {user?.name || (isAuthenticated ? 'Registered User' : 'Guest User')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Session Mode
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {isAuthenticated ? 'Authenticated (JWT)' : 'Guest (Local Explorer)'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Account Email
              </p>
              <p className="text-xs sm:text-sm font-mono text-[#18211D] dark:text-[#F7F5EF] truncate">
                {user?.email || 'N/A — Not Signed In'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. LANGUAGE PREFERENCE */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                {t('settings.langSection')}
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                {t('settings.langDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setLanguage('EN');
                showToast(language === 'HI' ? 'इंटरफ़ेस भाषा: English' : 'Interface language set to English.');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                language === 'EN'
                  ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
              }`}
            >
              <div>
                <p className="text-sm font-bold">English (EN)</p>
                <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-0.5">
                  Standard regulatory terminology
                </p>
              </div>
              {language === 'EN' && (
                <div className="w-5 h-5 rounded-full bg-[#0D3328] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage('HI');
                showToast(language === 'EN' ? 'भाषा प्राथमिकता: हिन्दी सक्रिय' : 'भाषा प्राथमिकता: हिन्दी');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                language === 'HI'
                  ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
              }`}
            >
              <div>
                <p className="text-sm font-bold">हिन्दी (Hindi)</p>
                <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-0.5">
                  भारतीय मानक एवं अनुपालन मार्गदर्शन
                </p>
              </div>
              {language === 'HI' && (
                <div className="w-5 h-5 rounded-full bg-[#0D3328] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 3. APPEARANCE */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                Appearance
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                Choose how BISaarthi looks on your device.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                showToast('Light mode active.');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-[#B88746]" />
                <span className="text-xs font-bold">Light</span>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-[#0D3328]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                showToast('Dark mode active.');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-[#8FA89B]" />
                <span className="text-xs font-bold">Dark</span>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-[#0D3328]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                showToast('System appearance mode active.');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-[#5B8272]" />
                <span className="text-xs font-bold">System Default</span>
              </div>
              {theme === 'system' && <Check className="w-4 h-4 text-[#0D3328]" />}
            </button>
          </div>
        </div>

        {/* 4. TRUST & SOURCES */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                Trust & Sources
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                Authoritative citations and statutory disclaimers
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
            <p>
              BISaarthi is designed to provide compliance guidance based on official Indian Standards, DPIIT Quality Control Orders (QCOs), and the Bureau of Indian Standards Act, 2016.
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">Active Provenance Tier:</span>
              <SourceReferenceTag sources={VERIFIED_SAMPLE_SOURCES} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] flex items-start gap-2.5 text-xs text-[#606E66] dark:text-[#BAC5BF]">
            <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
            </p>
          </div>
        </div>

        {/* 5. RESET PREFERENCES */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
              Reset Preferences
            </h2>
            <p className="text-xs text-[#606E66] dark:text-[#8B978F] leading-relaxed">
              Restore BISaarthi interface preferences to their defaults.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetPreferences}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="font-bold text-xs"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
