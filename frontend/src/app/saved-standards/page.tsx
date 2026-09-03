'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StandardCard } from '@/components/standards/StandardCard';
import { Button } from '@/components/common/Button';
import { MOCK_INITIAL_SAVED_STANDARDS } from '@/data/mockSavedStandards';
import { StandardCardData } from '@/types';
import {
  Bookmark,
  Search,
  ChevronRight,
  RefreshCw,
  FolderHeart,
  Compass,
  X,
} from 'lucide-react';

export default function SavedStandardsPage() {
  const [savedStandards, setSavedStandards] = useState<StandardCardData[]>(
    MOCK_INITIAL_SAVED_STANDARDS
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'number' | 'relevance'>('recent');

  const handleUnsave = (isNumber: string, saved: boolean) => {
    if (!saved) {
      setSavedStandards((prev) => prev.filter((s) => s.is_number !== isNumber));
    }
  };

  const handleRestoreSamples = () => {
    setSavedStandards(MOCK_INITIAL_SAVED_STANDARDS);
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('recent');
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
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              Saved Standards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>{savedStandards.length} Standards Bookmarked</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#606E66] dark:text-[#BAC5BF] bg-[#FAF9F5] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                  {savedStandards.length} saved standard{savedStandards.length === 1 ? '' : 's'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                Saved Standards
              </h1>

              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
                Keep frequently referenced standards in one place for quick access.
              </p>
            </div>

            {/* Quick Find Standards CTA */}
            <div className="shrink-0">
              <Link href="/find-standards">
                <Button variant="pill" size="sm" icon={<Compass className="w-4 h-4" />} className="font-bold text-xs">
                  Find More Standards
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Controls Toolbar (Search, Filter, Sort) */}
        {savedStandards.length > 0 && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved standards by number or title..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/20 focus:border-[#0D3328] transition-all"
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
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328] transition-all cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Standards Only</option>
                  <option value="under_revision">Under Revision</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'number' | 'relevance')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328] transition-all cursor-pointer"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="number">Standard Number (A–Z)</option>
                  <option value="relevance">Highest Relevance</option>
                </select>
              </div>
            </div>

            {/* Results Count & Reset Filter */}
            <div className="flex items-center justify-between text-xs text-[#606E66] dark:text-[#BAC5BF] pt-1 px-1">
              <span>
                Showing {filteredStandards.length} of {savedStandards.length} saved standard{savedStandards.length === 1 ? '' : 's'}
              </span>
              {(searchQuery !== '' || statusFilter !== 'all' || sortBy !== 'recent') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSortBy('recent');
                  }}
                  className="text-[#0D3328] dark:text-[#8FA89B] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Saved Standards List or Filter Empty State */}
        {savedStandards.length > 0 ? (
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
            /* No Filter Matches State */
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-8 text-center space-y-3 shadow-xs">
              <Search className="w-8 h-8 text-[#8B978F] mx-auto" />
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                No saved standards match your search
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] max-w-md mx-auto">
                No results found for &ldquo;{searchQuery}&rdquo;. Try clearing your search query or adjusting your filters.
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
                Clear Search & Filters
              </Button>
            </div>
          )
        ) : (
          /* EMPTY STATE (All standards removed) */
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-10 sm:p-14 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] mx-auto">
              <FolderHeart className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                No saved standards yet
              </h2>
              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                Save standards from Find Standards or Standard Details to access them quickly later.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/find-standards">
                <Button variant="pill" size="md" icon={<Compass className="w-4 h-4" />} className="font-bold text-xs">
                  Find Standards
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRestoreSamples}
                icon={<RefreshCw className="w-4 h-4" />}
                className="font-bold text-xs"
              >
                Restore Sample Standards
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
