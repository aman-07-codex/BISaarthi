'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StandardCard } from '@/components/standards/StandardCard';
import { Button } from '@/components/common/Button';
import { StandardCardData } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getSavedStandards, deleteSavedStandardApi } from '@/lib/api';
import {
  Bookmark,
  Search,
  ChevronRight,
  RefreshCw,
  FolderHeart,
  Compass,
  X,
  Loader2,
} from 'lucide-react';

export default function SavedStandardsPage() {
  const { language, t } = useLanguage();
  const { token } = useAuth();
  const [savedStandards, setSavedStandards] = useState<StandardCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'number' | 'relevance'>('recent');

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      if (token) {
        getSavedStandards(token, 1, 100)
          .then((res) => {
            if (!isMounted) return;
            const mapped: StandardCardData[] = (res.items || []).map((item) => ({
              is_number: item.standard_is_number,
              title: item.standard?.title || item.standard_is_number,
              status: item.standard?.status?.toLowerCase().includes('active') ? 'active' : 'unknown',
              is_saved: true,
            }));
            setSavedStandards(mapped);
            setIsLoading(false);
          })
          .catch(() => {
            loadLocalSavedStandards();
          });
      } else {
        loadLocalSavedStandards();
      }

      function loadLocalSavedStandards() {
        try {
          const stored = localStorage.getItem('bisaarthi_saved_standards');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              if (isMounted) setSavedStandards(parsed);
            }
          }
        } catch {
          if (isMounted) setSavedStandards([]);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleUnsave = async (isNumber: string, saved: boolean) => {
    if (!saved) {
      setSavedStandards((prev) => {
        const next = prev.filter((s) => s.is_number !== isNumber);
        try {
          localStorage.setItem('bisaarthi_saved_standards', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (token) {
        try {
          await deleteSavedStandardApi(isNumber, token);
        } catch {
          // silent fallback
        }
      }
    }
  };

  const filteredStandards = useMemo(() => {
    let list = savedStandards.filter((std) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        std.is_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (std.why_applicable && std.why_applicable.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || std.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'number') {
      list = [...list].sort((a, b) => a.is_number.localeCompare(b.is_number));
    } else if (sortBy === 'relevance') {
      const rank: Record<string, number> = {
        highly_relevant: 1,
        relevant: 2,
        possibly_relevant: 3,
      };
      list = [...list].sort(
        (a, b) => (rank[a.relevance || ''] || 99) - (rank[b.relevance || ''] || 99)
      );
    }

    return list;
  }, [savedStandards, searchQuery, statusFilter, sortBy]);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#606E66] dark:text-[#BAC5BF]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href="/dashboard"
              className="text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white font-medium"
            >
              {t('nav.dashboard')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              {t('nav.saved')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>
                {language === 'HI'
                  ? `${savedStandards.length} मानक बुकमार्क किए गए`
                  : `${savedStandards.length} Standards Bookmarked`}
              </span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#606E66] dark:text-[#BAC5BF] bg-[#FAF9F5] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                  {language === 'HI'
                    ? `${savedStandards.length} सहेजे गए मानक`
                    : `${savedStandards.length} saved standard${savedStandards.length === 1 ? '' : 's'}`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                {t('saved.title')}
              </h1>

              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
                {t('saved.subtitle')}
              </p>
            </div>

            {/* Quick Find Standards CTA */}
            <div className="shrink-0">
              <Link href="/find-standards">
                <Button variant="pill" size="sm" icon={<Compass className="w-4 h-4" />} className="font-bold text-xs">
                  {language === 'HI' ? 'अधिक मानक खोजें' : 'Find More Standards'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#5B8272] animate-spin" />
            <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">Loading bookmarked standards...</p>
          </div>
        )}

        {/* Controls Toolbar (Search, Filter, Sort) */}
        {!isLoading && savedStandards.length > 0 && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'HI'
                      ? 'IS संख्या या शीर्षक से सहेजे गए मानक खोजें...'
                      : 'Search saved standards by number or title...'
                  }
                  className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/20 focus:border-[#0D3328] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B978F] hover:text-[#18211D] dark:hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/20 focus:border-[#0D3328] transition-all cursor-pointer font-medium"
                >
                  <option value="all">{language === 'HI' ? 'सभी स्थितियाँ' : 'All Statuses'}</option>
                  <option value="active">{language === 'HI' ? 'सक्रिय' : 'Active'}</option>
                  <option value="under_revision">{language === 'HI' ? 'समीक्षाधीन' : 'Under Revision'}</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="sm:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'number' | 'relevance')}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/20 focus:border-[#0D3328] transition-all cursor-pointer font-medium"
                >
                  <option value="recent">{language === 'HI' ? 'हाल में सहेजे गए' : 'Recently Saved'}</option>
                  <option value="number">{language === 'HI' ? 'IS संख्या (क्रमबद्ध)' : 'IS Number'}</option>
                  <option value="relevance">{language === 'HI' ? 'प्रासंगिकता' : 'Relevance'}</option>
                </select>
              </div>
            </div>

            {/* Active search / filter result summary */}
            {(searchQuery !== '' || statusFilter !== 'all') && (
              <div className="flex items-center justify-between text-xs text-[#606E66] dark:text-[#BAC5BF] pt-1 border-t border-[#EFECE6] dark:border-[#1C2E28] px-1">
                <span>
                  {language === 'HI' ? 'दिखाया जा रहा है:' : 'Showing'} {filteredStandards.length} / {savedStandards.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-[#0D3328] dark:text-[#8FA89B] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'HI' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Standards Grid or Empty State */}
        {!isLoading && (
          savedStandards.length > 0 ? (
            filteredStandards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStandards.map((standard) => (
                  <StandardCard
                    key={standard.is_number}
                    standard={standard}
                    onSaveToggle={handleUnsave}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-8 sm:p-12 text-center space-y-3 shadow-xs">
                <Search className="w-8 h-8 text-[#8B978F] mx-auto" />
                <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  {language === 'HI' ? 'कोई मेल खाने वाला मानक नहीं मिला' : 'No matching standards found'}
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] max-w-md mx-auto">
                  {language === 'HI'
                    ? 'अपनी खोज क्वेरी या फ़िल्टर समायोजित करने का प्रयास करें।'
                    : 'Try adjusting your search query or reset filters.'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="font-bold text-xs"
                >
                  {language === 'HI' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
                </Button>
              </div>
            )
          ) : (
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-10 sm:p-14 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] mx-auto">
                <FolderHeart className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  {t('saved.emptyHeading')}
                </h2>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  {t('saved.emptyDesc')}
                </p>
              </div>

              <div className="pt-2">
                <Link href="/find-standards">
                  <Button variant="pill" size="md" icon={<Compass className="w-4 h-4" />} className="font-bold text-xs">
                    {language === 'HI' ? 'मानक खोजें' : 'Find Standards to Bookmark'}
                  </Button>
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
