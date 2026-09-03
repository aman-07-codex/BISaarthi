'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { MOCK_CHAT_HISTORY_LIST } from '@/data/mockChatData';
import { RecentConversation } from '@/types';
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
  Filter,
} from 'lucide-react';

export default function HistoryPage() {
  // Conversation list state
  const [conversations, setConversations] = useState<RecentConversation[]>(MOCK_CHAT_HISTORY_LIST);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'this_week' | 'older'>('all');

  // Filtered list
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
              History
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{conversations.length} Conversations Logged</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {conversations.length} conversations
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-blue-400 tracking-tight leading-tight">
                Chat History
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Review and continue your previous BISaarthi conversations.
              </p>
            </div>

            {/* + New Chat CTA */}
            <div className="shrink-0">
              <Link href="/chat">
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                  + New Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        {conversations.length > 0 && (
          <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Date Filter Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { key: 'all', label: 'All' },
                    { key: 'today', label: 'Today' },
                    { key: 'this_week', label: 'This Week' },
                    { key: 'older', label: 'Older' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTimeFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      timeFilter === tab.key
                        ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-semibold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active search / filter result summary */}
            {(searchQuery !== '' || timeFilter !== 'all') && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                <span>
                  Showing {filteredConversations.length} of {conversations.length} conversations
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear Filters</span>
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
                  href={`/chat/${encodeURIComponent(conv.id)}`}
                  className="group block p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Icon + Title + Preview */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5 sm:mt-0">
                        <MessageSquareText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors truncate">
                            {conv.title}
                          </h3>
                          {conv.message_count && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.2 rounded font-medium">
                              {conv.message_count} messages
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 leading-relaxed">
                          {conv.preview}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp + Continue Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{conv.updated_at}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 font-semibold text-[#1E3A8A] dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* No Filter Matches State */
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No conversations found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try a different search term or clear your filters.
              </p>
              <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          /* Zero Conversation History Empty State */
          <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-10 sm:p-14 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 mx-auto">
              <MessageSquare className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                No chat history yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Start a conversation with BISaarthi to build your chat history.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/chat">
                <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                  Start New Chat
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
