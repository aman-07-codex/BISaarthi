'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { StandardCard } from '@/components/standards/StandardCard';
import { DocumentDropzone } from '@/components/standards/DocumentDropzone';
import { StandardCardData } from '@/types';
import {
  MOCK_FIND_STANDARDS_ELECTRIC_HEATER,
  MOCK_FIND_STANDARDS_LED,
  MOCK_FIND_STANDARDS_BATTERY,
} from '@/data/mockFindStandards';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  SlidersHorizontal,
  Info,
  ShieldCheck,
} from 'lucide-react';

type AnalysisStep = 'idle' | 'analyzing_input' | 'matching_categories' | 'ranking_standards' | 'completed';

export default function FindStandardsPage() {
  const { language, t } = useLanguage();
  const [productQuery, setProductQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [results, setResults] = useState<StandardCardData[] | null>(null);
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const examplePrompts = [
    {
      title: language === 'HI' ? 'इलेक्ट्रिक हीटर' : 'Electric Heater',
      text: language === 'HI' ? 'मैं इलेक्ट्रिक हीटर बनाना चाहता हूँ। कौन से बीआईएस मानक लागू हैं?' : 'I want to manufacture an electric heater. Which BIS standards apply?',
    },
    {
      title: language === 'HI' ? 'एलईडी लैंप' : 'LED Lamps',
      text: language === 'HI' ? 'मैं सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलास्टेड एलईडी लैंप का निर्माण कर रहा हूँ।' : 'I am manufacturing self-ballasted LED lamps for general lighting services.',
    },
    {
      title: language === 'HI' ? 'प्लग और सॉकेट' : 'Plugs & Sockets',
      text: language === 'HI' ? 'घरेलू 3-पिन प्लग और सॉकेट पर कौन से मानक और अनिवार्य परीक्षण लागू होते हैं?' : 'Which standards and mandatory testing apply to household 3-pin plugs and sockets?',
    },
    {
      title: language === 'HI' ? 'लिथियम बैटरी पैक' : 'Lithium Battery Packs',
      text: language === 'HI' ? 'पोर्टेबल उपकरणों के लिए लिथियम-आयन बैटरी पैक हेतु मानक और सुरक्षा आवश्यकताएं।' : 'Standards and safety requirements for lithium-ion battery packs for portable devices.',
    },
  ];

  const handleSearch = (queryOverride?: string) => {
    const query = queryOverride || productQuery;
    if (!query.trim() && !attachedFile) return;

    if (queryOverride) {
      setProductQuery(queryOverride);
    }

    setAnalysisStep('analyzing_input');
    setResults(null);

    setTimeout(() => {
      setAnalysisStep('matching_categories');
    }, 450);

    setTimeout(() => {
      setAnalysisStep('ranking_standards');
    }, 900);

    setTimeout(() => {
      let matchedResults: StandardCardData[];

      const qLower = query.toLowerCase();
      if (qLower.includes('led') || qLower.includes('lamp') || qLower.includes('lighting')) {
        matchedResults = MOCK_FIND_STANDARDS_LED;
      } else if (qLower.includes('battery') || qLower.includes('lithium') || qLower.includes('cell')) {
        matchedResults = MOCK_FIND_STANDARDS_BATTERY;
      } else {
        matchedResults = MOCK_FIND_STANDARDS_ELECTRIC_HEATER;
      }

      setResults(matchedResults);
      setAnalysisStep('completed');
    }, 1350);
  };

  const handleReset = () => {
    setProductQuery('');
    setAttachedFile(null);
    setAnalysisStep('idle');
    setResults(null);
  };

  const filteredResults = results?.filter((std) => {
    if (relevanceFilter !== 'all' && std.relevance !== relevanceFilter) return false;
    if (statusFilter !== 'all' && std.status !== statusFilter) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Page Title & Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9DDD8] dark:border-[#253831]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight">
              {t('find.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] mt-1">
              {t('find.subtitle')}
            </p>
          </div>

          {results && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
              className="self-start sm:self-auto font-bold"
            >
              {language === 'HI' ? 'नई खोज' : 'New Search'}
            </Button>
          )}
        </div>

        {/* Search & Input Workspace */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-7 shadow-xs space-y-5">
          {/* Main Product Description Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18211D] dark:text-[#F7F5EF] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#5B8272]" />
                <span>{language === 'HI' ? 'अपने उत्पाद या आवश्यकता का विवरण दें' : 'Describe Your Product or Regulatory Need'}</span>
              </label>
              <span className="text-[11px] text-[#8B978F]">
                {t('find.descTab')}
              </span>
            </div>

            <textarea
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder={
                language === 'HI'
                  ? 'उदा. पोर्टेबल इलेक्ट्रिक इमर्शन वाटर हीटर, 1500W, 230V AC, 3-पिन प्लग और घरेलू उपयोग हेतु स्टेनलेस स्टील हीटिंग ट्यूब...'
                  : 'Example: I want to manufacture an electric immersion water heater for domestic use. What BIS standards apply to the heating element, body insulation, and power cord?'
              }
              rows={3}
              className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] focus:outline-none focus:border-[#0D3328] focus:ring-2 focus:ring-[#5B8272]/20 text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Example Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-[#606E66] dark:text-[#BAC5BF] mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#B88746]" /> {language === 'HI' ? 'उदाहरण:' : 'Examples:'}
            </span>
            {examplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(p.text)}
                className="px-3 py-1 rounded-full text-xs bg-[#EFECE6] dark:bg-[#1B2B26] hover:bg-[#E5E2DC] dark:hover:bg-[#20312B] text-[#18211D] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-[#F7F5EF] border border-[#D9DDD8] dark:border-[#253831] transition-colors cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Optional Document Upload Zone */}
          <div className="pt-2 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <DocumentDropzone onFileSelect={(file) => setAttachedFile(file)} />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <div className="flex items-center gap-2 text-xs text-[#606E66] dark:text-[#BAC5BF]">
              <ShieldCheck className="w-4 h-4 text-[#2D9D5D]" />
              <span>
                {language === 'HI'
                  ? 'भारतीय मानकों और गुणवत्ता नियंत्रण आदेशों (QCO) से संदर्भित'
                  : 'Referenced from Indian Standards & Quality Control Orders'}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {productQuery && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-bold text-[#8B978F] hover:text-[#18211D] dark:hover:text-white"
                >
                  {t('btn.clear')}
                </button>
              )}
              <Button
                type="button"
                variant="pill"
                onClick={() => handleSearch()}
                disabled={!productQuery.trim() && !attachedFile}
                icon={<ArrowRight className="w-4 h-4" />}
                className="font-bold text-xs"
              >
                {analysisStep !== 'idle' && analysisStep !== 'completed'
                  ? (language === 'HI' ? 'विश्लेषण हो रहा है...' : 'Analyzing...')
                  : t('nav.find')}
              </Button>
            </div>
          </div>
        </div>

        {/* Staged Mock Analysis Progress State */}
        {analysisStep !== 'idle' && analysisStep !== 'completed' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {language === 'HI'
                  ? 'बीआईएस सारथी आपके उत्पाद विवरण का विश्लेषण कर रहा है...'
                  : 'BISaarthi is analyzing your product description...'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                  analysisStep === 'analyzing_input' || analysisStep === 'matching_categories' || analysisStep === 'ranking_standards'
                    ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#C2E4CD] dark:border-[#1E5438] text-[#1B5E39] dark:text-[#A7F3D0] font-bold'
                    : 'bg-[#FAF9F5] dark:bg-[#1B2B26] border-[#D9DDD8] dark:border-[#253831] text-[#8B978F]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#2D9D5D] shrink-0" />
                <span>{language === 'HI' ? '1. उत्पाद विनिर्देश का विश्लेषण' : '1. Understanding product specification'}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                  analysisStep === 'matching_categories' || analysisStep === 'ranking_standards'
                    ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#C2E4CD] dark:border-[#1E5438] text-[#1B5E39] dark:text-[#A7F3D0] font-bold'
                    : 'bg-[#FAF9F5] dark:bg-[#1B2B26] border-[#D9DDD8] dark:border-[#253831] text-[#8B978F]'
                }`}
              >
                {analysisStep === 'matching_categories' || analysisStep === 'ranking_standards' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2D9D5D] shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-[#8B978F] shrink-0" />
                )}
                <span>{language === 'HI' ? '2. मानक श्रेणियों की पहचान' : '2. Identifying standard categories'}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                  analysisStep === 'ranking_standards'
                    ? 'bg-[#E8EFEA] dark:bg-[#113624] border-[#C2E4CD] dark:border-[#1E5438] text-[#1B5E39] dark:text-[#A7F3D0] font-bold'
                    : 'bg-[#FAF9F5] dark:bg-[#1B2B26] border-[#D9DDD8] dark:border-[#253831] text-[#8B978F]'
                }`}
              >
                {analysisStep === 'ranking_standards' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2D9D5D] shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-[#8B978F] shrink-0" />
                )}
                <span>{language === 'HI' ? '3. लागू मानकों का क्रम निर्धारण' : '3. Ranking applicable standards'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ranked Results View */}
        {results && analysisStep === 'completed' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Results Header with Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs">
              <div>
                <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF] flex items-center gap-2">
                  <span>{language === 'HI' ? 'पहचाने गए लागू भारतीय मानक' : 'Potentially Applicable Standards'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8EFEA] text-[#0D3328] dark:text-[#A7B8AE] font-mono font-bold">
                    {filteredResults?.length} {language === 'HI' ? 'मिले' : 'Found'}
                  </span>
                </h2>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] mt-0.5">
                  {language === 'HI'
                    ? 'उत्पाद सुरक्षा, हीटिंग तत्व और कनेक्शन घटकों के आधार पर क्रमबद्ध।'
                    : 'Ranked by qualitative applicability based on product heating, electrical safety, and connection components.'}
                </p>
              </div>

              {/* Lightweight Filter / Sort UI */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs text-[#606E66] dark:text-[#BAC5BF]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B978F]" />
                  <span className="font-bold">{language === 'HI' ? 'फ़िल्टर:' : 'Filter:'}</span>
                </div>

                <select
                  value={relevanceFilter}
                  onChange={(e) => setRelevanceFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-full bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328] cursor-pointer"
                >
                  <option value="all">{language === 'HI' ? 'सभी प्रासंगिकता' : 'All Relevance'}</option>
                  <option value="highly_relevant">{language === 'HI' ? 'अत्यधिक प्रासंगिक' : 'Highly Relevant'}</option>
                  <option value="relevant">{language === 'HI' ? 'प्रासंगिक' : 'Relevant'}</option>
                  <option value="possibly_relevant">{language === 'HI' ? 'संभावित प्रासंगिक' : 'Possibly Relevant'}</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-full bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:border-[#0D3328] cursor-pointer"
                >
                  <option value="all">{language === 'HI' ? 'सभी स्थितियां' : 'All Statuses'}</option>
                  <option value="active">{language === 'HI' ? 'केवल सक्रिय' : 'Active Only'}</option>
                  <option value="under_revision">{language === 'HI' ? 'संशोधनाधीन' : 'Under Revision'}</option>
                </select>
              </div>
            </div>

            {/* Explanation Callout Panel */}
            <div className="p-5 rounded-3xl bg-[#E8EFEA] dark:bg-[#1B2B26]/60 border border-[#D9DDD8] dark:border-[#253831] space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
                <h3 className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wide">
                  {t('find.whyStandards')}
                </h3>
              </div>
              <p className="text-xs text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
                {t('find.whyStandardsDesc')}
              </p>
            </div>
            {/* List of Ranked Standard Cards */}
            <div className="space-y-4">
              {filteredResults && filteredResults.length > 0 ? (
                filteredResults.map((std) => (
                  <StandardCard key={std.is_number} standard={std} />
                ))
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] text-xs text-[#8B978F]">
                  {t('find.noResults')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial / Empty State: How Find Standards Works */}
        {!results && analysisStep === 'idle' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5B8272]" />
                <span>{t('find.howItWorks')}</span>
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-1">
                {language === 'HI'
                  ? 'निर्माताओं को लागू मानक पहचानने में मदद करने के लिए 3-चरणीय प्रक्रिया।'
                  : 'A simple 3-step workflow designed to help manufacturers identify applicable standards.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#E8EFEA] text-[#0D3328] font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  {language === 'HI' ? 'उत्पाद विवरण' : 'Describe Product'}
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  {language === 'HI'
                    ? 'अपने उत्पाद का प्रकार, इच्छित अनुप्रयोग दर्ज करें या तकनीकी डेटाशीट संलग्न करें।'
                    : 'Enter your product type, target application, or attach an optional technical datasheet.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#E8EFEA] text-[#0D3328] font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  {language === 'HI' ? 'मानकों का मिलान' : 'Standards Matching'}
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  {language === 'HI'
                    ? 'बीआईएस सारथी अनुक्रमित भारतीय मानक डेटाबेस और गुणवत्ता नियंत्रण आदेशों (QCO) में खोज करता है।'
                    : 'BISaarthi searches indexed Indian Standards databases, gazettes, and Quality Control Orders (QCOs).'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#E8EFEA] text-[#0D3328] font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  {language === 'HI' ? 'आवश्यकताएं और परीक्षण देखें' : 'Explore Requirements & Tests'}
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  {language === 'HI'
                    ? 'पहचाने गए मानकों की समीक्षा करें, प्रयोज्यता का कारण समझें और विशिष्ट परीक्षण नियमों की जांच करें।'
                    : 'Review ranked standards, understand why they apply, and drill into specific testing and certification processes.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
