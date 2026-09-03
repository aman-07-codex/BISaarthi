'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { MOCK_SOURCES } from '@/data/mockChatData';
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
  FileCheck2,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  // 1. Profile State (Local Mock UI Only)
  const [profile, setProfile] = useState({
    name: 'Aman Mishra',
    role: 'Industry / Consumer User',
    email: 'aman@example.com',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  // 2. Language Preference
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  // 3. Appearance / Theme Preference
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // 4. AI Response Preferences
  const [responseDetail, setResponseDetail] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [showSources, setShowSources] = useState<boolean>(true);

  // 5. Toast / Feedback notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Apply theme to DOM
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Handle Edit Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditModalOpen(false);
    showToast('Profile preferences updated (demo state).');
  };

  // Handle Reset Preferences
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
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href="/dashboard"
              className="text-slate-600 dark:text-slate-300 hover:text-[#1E3A8A] dark:hover:text-blue-400 font-medium"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              Settings
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Application Preferences</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
            <Settings className="w-5 h-5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-blue-400 tracking-tight leading-tight">
            Settings
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Manage your BISaarthi preferences and application experience.
          </p>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl shadow-lg border border-blue-400/30 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-3 duration-150">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. PROFILE SECTION */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  User Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
            >
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {profile.name}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Industry Role
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {profile.role}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Contact Email
              </p>
              <p className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* 2. LANGUAGE PREFERENCE */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Language Preference
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the language used across the BISaarthi interface.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setLanguage('EN');
                showToast('Interface language set to English.');
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                language === 'EN'
                  ? 'bg-blue-50/60 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 text-[#1E3A8A] dark:text-blue-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-sm font-bold">English (EN)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard regulatory terminology
                </p>
              </div>
              {language === 'EN' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage('HI');
                showToast('भाषा प्राथमिकता: हिन्दी (Demo selection).');
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                language === 'HI'
                  ? 'bg-blue-50/60 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 text-[#1E3A8A] dark:text-blue-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-sm font-bold">हिन्दी (Hindi)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  भारतीय मानक एवं अनुपालन मार्गदर्शन
                </p>
              </div>
              {language === 'HI' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 3. APPEARANCE */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Appearance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-blue-50/60 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 text-[#1E3A8A] dark:text-blue-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">Light</span>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                showToast('Dark mode active.');
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-blue-50/60 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 text-[#1E3A8A] dark:text-blue-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">Dark</span>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                showToast('Theme set to System default.');
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-blue-50/60 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 text-[#1E3A8A] dark:text-blue-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold">System Default</span>
              </div>
              {theme === 'system' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>

        {/* 4. AI EXPERIENCE / RESPONSE PREFERENCES */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                AI Response Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure answer depth and provenance display preferences.
              </p>
            </div>
          </div>

          {/* Response Detail Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    responseDetail === lvl.key
                      ? 'bg-blue-50/70 dark:bg-blue-950/80 border-blue-400 dark:border-blue-700 text-[#1E3A8A] dark:text-blue-300 font-semibold'
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lvl.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Source References Toggle */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Show source references
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
                showSources ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
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
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Trust & Sources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authoritative citations and statutory disclaimers
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              BISaarthi is designed to provide compliance guidance based on official Indian Standards, DPIIT Quality Control Orders (QCOs), and the Bureau of Indian Standards Act, 2016.
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Active Provenance Tier:</span>
              <SourceReferenceTag sources={[MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco]} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
            </p>
          </div>
        </div>

        {/* 6. RESET / DANGER ZONE */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Reset Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Restore BISaarthi interface preferences to their defaults.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetPreferences}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset to Defaults
          </Button>
        </div>

        {/* EDIT PROFILE MODAL (Local Visual Demo State) */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Edit Profile (Demo)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Industry Role
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
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
