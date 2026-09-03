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
  Clock,
} from 'lucide-react';
import { RecentConversation } from '@/types';
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
        {/* Welcome Section Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#091E18] via-[#0D3328] to-[#164B3A] text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-[#1E4D3E]">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#A7B8AE] border border-white/15 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8FA89B]" />
              <span>Authoritative BIS Standards & Regulatory Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Welcome to BISaarthi
            </h1>

            <p className="text-sm sm:text-base text-[#BAC5BF] leading-relaxed font-normal">
              Your AI-powered guide for Indian Standards, certification pathways, and BIS compliance. Simplify regulatory discovery, identify applicable IS codes, and verify testing expectations with source-backed confidence.
            </p>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
            <ShieldCheck className="w-96 h-96 text-white" />
          </div>
        </section>

        {/* Prominent "Ask BISaarthi" Quick Prompt Input */}
        <section className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
              <Sparkles className="w-4 h-4 text-[#5B8272]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Ask BISaarthi
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
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
                className="w-full p-4 text-sm rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] focus:outline-none focus:border-[#0D3328] focus:ring-2 focus:ring-[#5B8272]/20 text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] resize-none transition-all leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#606E66] dark:text-[#8B978F]">
                <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">Popular:</span>
                <button
                  type="button"
                  onClick={() => setPromptText('I want to manufacture an electric heater. Which BIS standards apply?')}
                  className="px-2.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#E5E2DC] text-xs transition-colors cursor-pointer"
                >
                  Electric Heater
                </button>
                <button
                  type="button"
                  onClick={() => setPromptText('Is certification mandatory for LED lamps under IS 16102?')}
                  className="px-2.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#E5E2DC] text-xs transition-colors cursor-pointer hidden sm:inline"
                >
                  LED Lamps
                </button>
              </div>

              <Button
                type="submit"
                variant="pill"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                className="ml-auto font-bold text-xs"
              >
                Ask BISaarthi
              </Button>
            </div>
          </form>
        </section>

        {/* Feature Capabilities Grid */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-[#18211D] dark:text-[#F7F5EF]">
              What can BISaarthi help you with?
            </h2>
            <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
              Key tools to navigate Indian Standards and compliance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1: AI Chatbot */}
            <div className="group relative bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs hover:shadow-md hover:border-[#5B8272] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  AI Chatbot
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  Two-way conversational guidance for MSMEs. Ask multi-turn regulatory questions, understand scheme nuances, and clarify compliance requirements in simple language.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-[#EFECE6] dark:border-[#1C2E28]">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A] transition-colors"
                >
                  <span>Start Conversation</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Find Standards */}
            <div className="group relative bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs hover:shadow-md hover:border-[#5B8272] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Find Standards
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  One-time discovery engine. Enter keywords, describe your product, or optionally upload a product specification document to receive ranked applicable standards, requirements, tests, and laboratories.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-[#EFECE6] dark:border-[#1C2E28]">
                <Link
                  href="/find-standards"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A] transition-colors"
                >
                  <span>Discover Standards</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Compare Standards */}
            <div className="group relative bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs hover:shadow-md hover:border-[#5B8272] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] group-hover:scale-105 transition-transform">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Compare Standards
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  Compare two Indian Standards side by side to understand differences in scope, testing parameters, and certification requirements.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-[#EFECE6] dark:border-[#1C2E28]">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A] transition-colors"
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
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#1C2E28] mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#5B8272]" />
                  <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Recent Chat Conversations
                  </h3>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline flex items-center gap-1"
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
                    className="block p-3.5 rounded-2xl border border-[#EFECE6] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 hover:border-[#5B8272] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] line-clamp-1">
                        {conv.title}
                      </h4>
                      <span className="text-[10px] text-[#8B978F] whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conv.updated_at}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] line-clamp-1">
                      {conv.preview}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] text-right">
              <Link
                href="/chat"
                className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A]"
              >
                + Start New Chat
              </Link>
            </div>
          </div>

          {/* Recently Saved Standards */}
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#1C2E28] mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#5B8272]" />
                  <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Saved Standards
                  </h3>
                </div>
                <Link
                  href="/saved-standards"
                  className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {MOCK_SAVED_STANDARDS.map((std) => (
                  <div
                    key={std.is_number}
                    className="p-3.5 rounded-2xl border border-[#EFECE6] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 flex items-center justify-between gap-3 hover:border-[#5B8272] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black text-[#0D3328] dark:text-[#8FA89B]">
                          {std.is_number}
                        </span>
                        <StatusBadge status={std.status} />
                      </div>
                      <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] line-clamp-1">
                        {std.title}
                      </p>
                    </div>

                    <Link
                      href={`/standards/${encodeURIComponent(std.is_number)}`}
                      className="p-1.5 rounded-full hover:bg-[#EFECE6] dark:hover:bg-[#20312B] text-[#606E66] dark:text-[#BAC5BF] shrink-0"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] text-right">
              <Link
                href="/find-standards"
                className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A]"
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
