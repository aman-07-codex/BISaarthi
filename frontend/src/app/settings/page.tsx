'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { MOCK_SOURCES } from '@/data/mockChatData';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Check,
  Edit3,
  X,
  Sliders,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Aman Mishra',
    role: 'Industry / Consumer User',
    email: 'aman@example.com',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [responseDetail, setResponseDetail] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [showSources, setShowSources] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditModalOpen(false);
    showToast('Profile preferences updated (demo state).');
  };

  const handleResetPreferences = () => {
    setLanguage('EN');
    setTheme('system');
    setResponseDetail('balanced');
    setShowSources(true);
    setProfile({
      name: 'Aman Mishra',
      role: 'Industry / Consumer User',
      email: 'aman@example.com',
    });
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

        {/* 1. PROFILE SECTION */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                  User Profile
                </h2>
                <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                  Local profile information used during this session
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditForm({ ...profile });
                setIsEditModalOpen(true);
              }}
              className="font-bold text-xs"
            >
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {profile.name}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Industry Role
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {profile.role}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Contact Email
              </p>
              <p className="text-xs sm:text-sm font-mono text-[#18211D] dark:text-[#F7F5EF] truncate">
                {profile.email}
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
              {theme === 'dark' && <Check className="w-4 h-4 text-[#8FA89B]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                showToast('Theme set to System default.');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-[#8B978F]" />
                <span className="text-xs font-bold">System Default</span>
              </div>
              {theme === 'system' && <Check className="w-4 h-4 text-[#0D3328]" />}
            </button>
          </div>
        </div>

        {/* 4. AI EXPERIENCE / RESPONSE PREFERENCES */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                AI Response Preferences
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                Configure answer depth and provenance display preferences.
              </p>
            </div>
          </div>

          {/* Response Detail Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Response Detail Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { key: 'concise', label: 'Concise', desc: 'Direct clause highlights' },
                  { key: 'balanced', label: 'Balanced', desc: 'Standard guidance & tables' },
                  { key: 'detailed', label: 'Detailed', desc: 'Full testing & QCO matrices' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => {
                    setResponseDetail(lvl.key);
                    showToast(`Response detail set to ${lvl.label}.`);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    responseDetail === lvl.key
                      ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#0D3328] dark:border-[#5B8272] text-[#0D3328] dark:text-[#A7F3D0] font-bold'
                      : 'bg-white dark:bg-[#1B2B26]/40 border-[#D9DDD8] dark:border-[#253831] text-[#606E66] dark:text-[#BAC5BF] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p className="text-[10px] text-[#8B978F] mt-0.5">
                    {lvl.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Source References Toggle */}
          <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Show source references
              </p>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                Show BIS and government source references with AI responses.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showSources}
              onClick={() => {
                const next = !showSources;
                setShowSources(next);
                showToast(next ? 'Source references enabled.' : 'Source references disabled.');
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                showSources ? 'bg-[#0D3328]' : 'bg-[#D9DDD8] dark:bg-[#253831]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  showSources ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 5. TRUST & SOURCES */}
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
              <SourceReferenceTag sources={[MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco]} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] flex items-start gap-2.5 text-xs text-[#606E66] dark:text-[#BAC5BF]">
            <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
            </p>
          </div>
        </div>

        {/* 6. RESET / DANGER ZONE */}
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

        {/* EDIT PROFILE MODAL (Local Visual Demo State) */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#091E18]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#1C2E28] pb-3">
                <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Edit Profile (Demo)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-[#8B978F] hover:text-[#18211D] dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Industry Role
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28]">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="font-bold text-xs"
                  >
                    Cancel
                  </Button>
                  <Button variant="pill" size="sm" type="submit" className="font-bold text-xs">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
