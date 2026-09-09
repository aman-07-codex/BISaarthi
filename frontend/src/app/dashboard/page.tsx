'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  History,
  ShieldCheck,
  Clock,
  MessageSquarePlus,
  Compass,
} from 'lucide-react';
import { RecentConversation, StandardCardData } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getSavedStandards } from '@/lib/api';
import { DashboardFeatureCards } from '@/components/dashboard/DashboardFeatureCards';

export default function DashboardPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, token } = useAuth();
  const [promptText, setPromptText] = useState('');

  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [savedStandards, setSavedStandards] = useState<StandardCardData[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;

      // 1. Load real recent conversations from local storage
      try {
        const storedChats = localStorage.getItem('bisaarthi_chat_history');
        if (storedChats) {
          const parsed = JSON.parse(storedChats);
          if (Array.isArray(parsed)) {
            setRecentConversations(parsed.slice(0, 3));
          }
        }
      } catch {
        setRecentConversations([]);
      }

      // 2. Load real saved standards from backend or local bookmarks
      if (token) {
        getSavedStandards(token, 1, 3)
          .then((res) => {
            if (!isMounted) return;
            const mapped: StandardCardData[] = (res.items || []).map((item) => ({
              is_number: item.standard_is_number,
              title: item.standard?.title || item.standard_is_number,
              status: item.standard?.status?.toLowerCase().includes('active') ? 'active' : 'unknown',
              is_saved: true,
            }));
            setSavedStandards(mapped);
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
              setSavedStandards(parsed.slice(0, 3));
            }
          }
        } catch {
          setSavedStandards([]);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  const userGreeting = user?.name
    ? (language === 'HI' ? `नमस्ते, ${user.name}` : `Welcome back, ${user.name}`)
    : (language === 'HI' ? 'बीआईएस सारथी में आपका स्वागत है' : 'Welcome to BISaarthi');

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Welcome Section Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#091E18] via-[#0D3328] to-[#164B3A] text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-[#1E4D3E]">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#A7B8AE] border border-white/15 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8FA89B]" />
              <span>{t('nav.authoritative')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {userGreeting}
            </h1>

            <p className="text-sm sm:text-base text-[#BAC5BF] leading-relaxed font-normal">
              {language === 'HI'
                ? 'भारतीय मानकों, प्रमाणन प्रक्रियाओं और बीआईएस अनुपालन के लिए आपका एआई-संचालित मार्गदर्शक। विनियामक खोज को सरल बनाएं, लागू IS कोड पहचानें और परीक्षण नियमों की पुष्टि करें।'
                : 'Your AI-powered guide for Indian Standards, certification pathways, and BIS compliance. Simplify regulatory discovery, identify applicable IS codes, and verify testing expectations with source-backed confidence.'}
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
                {t('nav.ask')}
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                {language === 'HI'
                  ? 'आरंभ करने के लिए उत्पाद का नाम, अनुपालन प्रश्न या मानक संख्या लिखें'
                  : 'Type a product query, compliance question, or standard number to begin'}
              </p>
            </div>
          </div>

          <form onSubmit={handleAskSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={
                  language === 'HI'
                    ? 'उदाहरण: मैं इलेक्ट्रिक हीटर बनाना चाहता हूँ। कौन से बीआईएस मानक लागू हैं और कौन से परीक्षण अनिवार्य हैं?'
                    : 'Example: I want to manufacture an electric heater. Which BIS standards are applicable and what tests are mandatory?'
                }
                rows={3}
                className="w-full p-4 text-sm rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] focus:outline-none focus:border-[#0D3328] focus:ring-2 focus:ring-[#5B8272]/20 text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] resize-none transition-all leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#606E66] dark:text-[#8B978F]">
                <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  {language === 'HI' ? 'लोकप्रिय:' : 'Popular:'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPromptText(
                      language === 'HI'
                        ? 'मैं इलेक्ट्रिक हीटर बनाना चाहता हूँ। कौन से बीआईएस मानक लागू हैं?'
                        : 'I want to manufacture an electric heater. Which BIS standards apply?'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#E5E2DC] text-xs transition-colors cursor-pointer"
                >
                  {language === 'HI' ? 'इलेक्ट्रिक हीटर' : 'Electric Heater'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPromptText(
                      language === 'HI'
                        ? 'क्या IS 16102 के तहत एलईडी लैंप के लिए प्रमाणन अनिवार्य है?'
                        : 'Is certification mandatory for LED lamps under IS 16102?'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#BAC5BF] hover:bg-[#E5E2DC] text-xs transition-colors cursor-pointer hidden sm:inline"
                >
                  {language === 'HI' ? 'एलईडी लैंप' : 'LED Lamps'}
                </button>
              </div>

              <Button
                type="submit"
                variant="pill"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                className="ml-auto font-bold text-xs"
              >
                {t('nav.ask')}
              </Button>
            </div>
          </form>
        </section>

        {/* Feature Capabilities Grid */}
        <DashboardFeatureCards />

        {/* Recent Activity Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Chatbot Conversations */}
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#1C2E28] mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#5B8272]" />
                  <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    {language === 'HI' ? 'हाल की चैट बातचीत' : 'Recent Chat Conversations'}
                  </h3>
                </div>
                {recentConversations.length > 0 && (
                  <Link
                    href="/history"
                    className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline flex items-center gap-1"
                  >
                    <span>{language === 'HI' ? 'सभी देखें' : 'View All'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {recentConversations.length > 0 ? (
                <div className="space-y-2.5">
                  {recentConversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/chat?prompt=${encodeURIComponent(conv.title)}`}
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
              ) : (
                <div className="p-6 text-center space-y-2 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/40 border border-[#EFECE6] dark:border-[#253831]">
                  <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
                    {language === 'HI'
                      ? 'अभी तक कोई हालिया चैट बातचीत उपलब्ध नहीं है।'
                      : 'No recent chat conversations available yet.'}
                  </p>
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>{language === 'HI' ? 'चैट शुरू करें' : 'Start a chat query'}</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] text-right">
              <Link
                href="/chat"
                className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A]"
              >
                {language === 'HI' ? '+ नई चैट शुरू करें' : '+ Start New Chat'}
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
                    {t('nav.saved')}
                  </h3>
                </div>
                {savedStandards.length > 0 && (
                  <Link
                    href="/saved-standards"
                    className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline flex items-center gap-1"
                  >
                    <span>{language === 'HI' ? 'सभी देखें' : 'View All'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {savedStandards.length > 0 ? (
                <div className="space-y-2.5">
                  {savedStandards.map((std) => (
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
                        title={t('btn.viewDetails')}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/40 border border-[#EFECE6] dark:border-[#253831]">
                  <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
                    {language === 'HI'
                      ? 'अभी तक कोई मानक बुकमार्क नहीं किया गया है।'
                      : 'No standards bookmarked yet.'}
                  </p>
                  <Link
                    href="/find-standards"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{language === 'HI' ? 'मानक खोजें' : 'Find Standards to Bookmark'}</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] text-right">
              <Link
                href="/find-standards"
                className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A]"
              >
                {language === 'HI' ? 'अधिक मानक खोजें →' : 'Search More Standards →'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
