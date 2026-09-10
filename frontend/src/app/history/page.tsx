'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { RecentConversation } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getConversations } from '@/lib/api';
import {
  History,
  MessageSquare,
  Search,
  Plus,
  ChevronRight,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  MessageSquareText,
} from 'lucide-react';

export default function HistoryPage() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'this_week' | 'older'>('all');

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;

      if (token) {
        getConversations(token, 1, 50)
          .then((res) => {
            if (!isMounted) return;
            const mapped: RecentConversation[] = res.items.map((item) => {
              const date = new Date(item.updated_at);
              const now = new Date();
              const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
              const timeBucket: 'today' | 'this_week' | 'older' =
                diffHours < 24 ? 'today' : diffHours < 168 ? 'this_week' : 'older';

              return {
                id: item.id,
                title: item.title,
                preview: item.preview || 'Conversation thread',
                updated_at: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: date.getTime(),
                time_bucket: timeBucket,
              };
            });
            setConversations(mapped);
          })
          .catch(() => {
            loadLocalHistory();
          });
      } else {
        loadLocalHistory();
      }

      function loadLocalHistory() {
        try {
          const stored = localStorage.getItem('bisaarthi_chat_history');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              if (isMounted) setConversations(parsed);
            }
          }
        } catch {
          if (isMounted) setConversations([]);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.preview.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTime =
        timeFilter === 'all' || conv.time_bucket === timeFilter;

      return matchesSearch && matchesTime;
    });
  }, [conversations, searchQuery, timeFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTimeFilter('all');
  };

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
              {t('nav.dashboard', 'Dashboard')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              {t('nav.history', 'History')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>{conversations.length} {t('history.conversationsLogged', 'Conversations Logged')}</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#606E66] dark:text-[#BAC5BF] bg-[#FAF9F5] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                  {conversations.length} {t('history.conversations', 'conversations')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                {t('history.title', 'Chat History')}
              </h1>

              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
                {t('history.subtitle', 'Review and continue your previous BISaarthi conversations.')}
              </p>
            </div>

            {/* + New Chat CTA */}
            <div className="shrink-0">
              <Link href="/chat">
                <Button variant="pill" size="sm" icon={<Plus className="w-4 h-4" />} className="font-bold text-xs">
                  {t('history.startNew', '+ New Chat')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        {conversations.length > 0 && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('history.searchPlaceholder', 'Search conversations...')}
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

              {/* Date Filter Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { key: 'all', label: t('history.all', 'All') },
                    { key: 'today', label: t('history.today', 'Today') },
                    { key: 'this_week', label: t('history.thisWeek', 'This Week') },
                    { key: 'older', label: t('history.older', 'Older') },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTimeFilter(tab.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      timeFilter === tab.key
                        ? 'bg-[#0D3328] text-white font-bold shadow-2xs'
                        : 'bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#606E66] dark:text-[#BAC5BF] hover:bg-[#EFECE6] dark:hover:bg-[#20312B] border border-[#D9DDD8] dark:border-[#253831]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active search / filter result summary */}
            {(searchQuery !== '' || timeFilter !== 'all') && (
              <div className="flex items-center justify-between text-xs text-[#606E66] dark:text-[#BAC5BF] pt-1 border-t border-[#EFECE6] dark:border-[#1C2E28] px-1">
                <span>
                  {t('history.showing', 'Showing')} {filteredConversations.length} {t('history.of', 'of')} {conversations.length} {t('history.conversations', 'conversations')}
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[#0D3328] dark:text-[#8FA89B] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t('history.clearFilters', 'Clear Filters')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Conversation List Stream */}
        {conversations.length > 0 ? (
          filteredConversations.length > 0 ? (
            <div className="space-y-3">
              {filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat?prompt=${encodeURIComponent(conv.title)}`}
                  className="group block p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] hover:border-[#5B8272] hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Icon + Title + Preview */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 group-hover:scale-105 transition-transform mt-0.5 sm:mt-0">
                        <MessageSquareText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] transition-colors truncate">
                            {conv.title}
                          </h3>
                          {conv.message_count && (
                            <span className="text-[10px] text-[#8B978F] bg-[#FAF9F5] dark:bg-[#1B2B26] px-2 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] font-bold">
                              {conv.message_count} messages
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] line-clamp-1 leading-relaxed">
                          {conv.preview}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp + Continue Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE6] dark:border-[#1C2E28] text-xs">
                      <div className="flex items-center gap-1.5 text-[#8B978F] font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{conv.updated_at}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 font-bold text-[#0D3328] dark:text-[#8FA89B] group-hover:translate-x-0.5 transition-transform">
                        <span>{t('history.continue', 'Continue')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* No Filter Matches State */
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <Search className="w-8 h-8 text-[#8B978F] mx-auto" />
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {t('history.noResults', 'No conversations found')}
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] max-w-md mx-auto">
                {t('history.noResultsDesc', 'Try a different search term or clear your filters.')}
              </p>
              <Button variant="secondary" size="sm" onClick={handleClearFilters} className="font-bold text-xs">
                {t('history.clearFilters', 'Clear Filters')}
              </Button>
            </div>
          )
        ) : (
          /* Zero Conversation History Empty State */
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-10 sm:p-14 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] mx-auto">
              <MessageSquare className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {t('history.emptyHeading', 'No chat history yet')}
              </h2>
              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                {t('history.emptyDesc', 'Start a conversation with BISaarthi to build your chat history.')}
              </p>
            </div>

            <div className="pt-2">
              <Link href="/chat">
                <Button variant="pill" size="md" icon={<Plus className="w-4 h-4" />} className="font-bold text-xs">
                  {t('history.startNew', 'Start New Chat')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
