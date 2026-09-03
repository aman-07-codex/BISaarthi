'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  MessageSquare,
  Search,
  Scale,
  Sparkles,
  ArrowRight,
  Bookmark,
  History,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { RecentConversation, SavedStandardShortcut } from '@/types';
import { MOCK_CHAT_HISTORY_LIST } from '@/data/mockChatData';
import { MOCK_INITIAL_SAVED_STANDARDS } from '@/data/mockSavedStandards';

const MOCK_RECENT_CONVERSATIONS: RecentConversation[] = MOCK_CHAT_HISTORY_LIST.slice(0, 3);

const MOCK_SAVED_STANDARDS = MOCK_INITIAL_SAVED_STANDARDS.slice(0, 3);

export default function DashboardPage() {
  const router = useRouter();
  const [promptText, setPromptText] = useState('');

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-blue-900/60">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-medium backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Authoritative BIS Standards & Regulatory Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Welcome to BISaarthi
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Your AI-powered guide for Indian Standards, certification pathways, and BIS compliance. Simplify regulatory discovery, identify applicable IS codes, and verify testing expectations with source-backed confidence.
            </p>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <ShieldCheck className="w-96 h-96 text-white" />
          </div>
        </section>

        {/* Prominent "Ask BISaarthi" Quick Prompt Input */}
        <section className="bg-white dark:bg-slate-800/95 rounded-xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Ask BISaarthi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type a product query, compliance question, or standard number to begin
              </p>
            </div>
          </div>

          <form onSubmit={handleAskSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Example: I want to manufacture an electric heater. Which BIS standards are applicable and what tests are mandatory?"
                rows={3}
                className="w-full p-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">Popular:</span>
                <button
                  type="button"
                  onClick={() => setPromptText('I want to manufacture an electric heater. Which BIS standards apply?')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 text-xs transition-colors cursor-pointer"
                >
                  Electric Heater
                </button>
                <button
                  type="button"
                  onClick={() => setPromptText('Is certification mandatory for LED lamps under IS 16102?')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 text-xs transition-colors cursor-pointer hidden sm:inline"
                >
                  LED Lamps
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                className="ml-auto"
              >
                Ask BISaarthi
              </Button>
            </div>
          </form>
        </section>

        {/* Feature Capabilities */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              What can BISaarthi help you with?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Key tools to navigate Indian Standards and compliance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1: AI Chatbot */}
            <div className="group relative bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/80 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Chatbot
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Two-way conversational guidance for MSMEs. Ask multi-turn regulatory questions, understand scheme nuances, and clarify compliance requirements in simple language.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Start Conversation</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Find Standards */}
            <div className="group relative bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/80 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Find Standards
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  One-time discovery engine. Enter keywords, describe your product, or optionally upload a product specification document to receive ranked applicable standards, requirements, tests, and laboratories.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  href="/find-standards"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Discover Standards</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Compare Standards */}
            <div className="group relative bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/80 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Compare Standards
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compare two Indian Standards side by side to understand differences in scope, testing parameters, and certification requirements.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Compare Standards</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Chatbot Conversations */}
          <div className="bg-white dark:bg-slate-800/95 rounded-xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Recent Chat Conversations
                  </h3>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {MOCK_RECENT_CONVERSATIONS.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/chat/${encodeURIComponent(conv.id)}`}
                    className="block p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-blue-50/50 dark:hover:bg-slate-700/40 hover:border-blue-200 dark:hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 line-clamp-1">
                        {conv.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conv.updated_at}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {conv.preview}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 text-right">
              <Link
                href="/chat"
                className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-blue-700"
              >
                + Start New Chat
              </Link>
            </div>
          </div>

          {/* Recently Saved Standards */}
          <div className="bg-white dark:bg-slate-800/95 rounded-xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Saved Standards
                  </h3>
                </div>
                <Link
                  href="/saved-standards"
                  className="text-xs font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {MOCK_SAVED_STANDARDS.map((std) => (
                  <div
                    key={std.is_number}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400">
                          {std.is_number}
                        </span>
                        <StatusBadge status={std.status} />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                        {std.title}
                      </p>
                    </div>

                    <Link
                      href={`/standards/${encodeURIComponent(std.is_number)}`}
                      className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 shrink-0"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 text-right">
              <Link
                href="/find-standards"
                className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-blue-700"
              >
                Search More Standards →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
