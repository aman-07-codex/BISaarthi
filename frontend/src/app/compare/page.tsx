'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { Button } from '@/components/common/Button';
import { ComparisonTable } from '@/components/standards/ComparisonTable';
import {
  SUGGESTED_SELECTABLE_STANDARDS,
  getStandardComparisonData,
} from '@/data/mockCompareData';
import { StandardDetailsData, StandardComparisonData } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  Scale,
  Search,
  ArrowRight,
  Check,
  Bookmark,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export default function CompareStandardsPage() {
  const { language, t } = useLanguage();
  const [standard1, setStandard1] = useState<StandardDetailsData | null>(null);
  const [standard2, setStandard2] = useState<StandardDetailsData | null>(null);

  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);

  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<StandardComparisonData | null>(null);

  const [isSaved1, setIsSaved1] = useState(false);
  const [isSaved2, setIsSaved2] = useState(false);

  const filteredStandards1 = useMemo(() => {
    return SUGGESTED_SELECTABLE_STANDARDS.filter(
      (s) =>
        s.is_number.toLowerCase().includes(search1.toLowerCase()) ||
        s.title.toLowerCase().includes(search1.toLowerCase()) ||
        s.product_category.toLowerCase().includes(search1.toLowerCase())
    );
  }, [search1]);

  const filteredStandards2 = useMemo(() => {
    return SUGGESTED_SELECTABLE_STANDARDS.filter(
      (s) =>
        s.is_number.toLowerCase().includes(search2.toLowerCase()) ||
        s.title.toLowerCase().includes(search2.toLowerCase()) ||
        s.product_category.toLowerCase().includes(search2.toLowerCase())
    );
  }, [search2]);

  const isDuplicate = standard1 && standard2 && standard1.is_number === standard2.is_number;
  const canCompare = standard1 && standard2 && !isDuplicate;

  const handleRunComparison = (s1?: StandardDetailsData, s2?: StandardDetailsData) => {
    const target1 = s1 || standard1;
    const target2 = s2 || standard2;

    if (!target1 || !target2 || target1.is_number === target2.is_number) return;

    setIsComparing(true);
    setTimeout(() => {
      const result = getStandardComparisonData(target1.is_number, target2.is_number);
      setComparisonResult(result);
      setIsComparing(false);
    }, 400);
  };

  const handleResetComparison = () => {
    setStandard1(null);
    setStandard2(null);
    setComparisonResult(null);
    setSearch1('');
    setSearch2('');
    setIsSaved1(false);
    setIsSaved2(false);
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
              {t('nav.dashboard')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              {t('nav.compare')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>{language === 'HI' ? '2 मानकों की तुलना' : 'Compare 2 Standards'}</span>
            </span>
          </div>
        </div>

        {/* Page Title & Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B]">
            <Scale className="w-5 h-5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
            {t('compare.title')}
          </h1>

          <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal max-w-3xl">
            {t('compare.subtitle')}
          </p>
        </div>

        {/* 1. SELECTION WORKSPACE (EXACTLY TWO STANDARDS) */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFECE6] dark:border-[#1C2E28] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                {language === 'HI' ? 'तुलना के लिए मानक चुनें' : 'Select Standards to Compare'}
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-0.5">
                {language === 'HI'
                  ? 'साथ-साथ तुलना देखने के लिए दो मानक चुनें।'
                  : 'Select two standards to generate a side-by-side comparison.'}
              </p>
            </div>

            {comparisonResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetComparison}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="font-bold text-xs"
              >
                {language === 'HI' ? 'नई तुलना शुरू करें' : 'Start New Comparison'}
              </Button>
            )}
          </div>

          {/* Selectors Grid: Standard 1 | VS | Standard 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-start">
            {/* Standard 1 Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0D3328] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Standard 1</span>
                </label>
                {standard1 && (
                  <button
                    type="button"
                    onClick={() => setStandard1(null)}
                    className="text-xs text-[#8B978F] hover:text-[#C86D51] flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {standard1 ? (
                /* Compact Selected Card 1 */
                <div className="p-4 rounded-2xl border border-[#5B8272] bg-[#FAF9F5] dark:bg-[#1B2B26] space-y-2 relative animate-in fade-in duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-black text-[#0D3328] dark:text-[#8FA89B]">
                        {standard1.is_number}
                      </p>
                      <h4 className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] line-clamp-2 mt-0.5">
                        {standard1.title}
                      </h4>
                    </div>
                    <StatusBadge status={standard1.status} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] dark:border-[#253831] text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                    <span>{standard1.product_category}</span>
                    <span className="font-bold text-[#1B5E39] dark:text-[#A7F3D0]">Selected</span>
                  </div>
                </div>
              ) : (
                /* Search / Dropdown 1 */
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search1}
                      onFocus={() => setIsDropdown1Open(true)}
                      onChange={(e) => {
                        setSearch1(e.target.value);
                        setIsDropdown1Open(true);
                      }}
                      placeholder="Type standard or search (e.g. IS 302)..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/20 focus:border-[#0D3328] transition-all"
                    />
                  </div>

                  {isDropdown1Open && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] shadow-lg divide-y divide-[#EFECE6] dark:divide-[#1C2E28] animate-in fade-in duration-100">
                      {filteredStandards1.map((std) => (
                        <button
                          key={std.is_number}
                          type="button"
                          onClick={() => {
                            setStandard1(std);
                            setIsDropdown1Open(false);
                            setSearch1('');
                          }}
                          className="w-full p-3.5 text-left hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-colors flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] truncate">
                              {std.is_number}
                            </p>
                            <p className="text-xs text-[#18211D] dark:text-[#F7F5EF] line-clamp-1 mt-0.5">
                              {std.title}
                            </p>
                            <p className="text-[10px] text-[#8B978F] mt-0.5">
                              {std.product_category}
                            </p>
                          </div>
                          <StatusBadge status={std.status} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* VS Badge Connector */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-6">
              <div className="w-10 h-10 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] text-[#0D3328] dark:text-[#8FA89B] font-black text-xs flex items-center justify-center shadow-2xs">
                VS
              </div>
            </div>

            {/* Standard 2 Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5B8272] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Standard 2</span>
                </label>
                {standard2 && (
                  <button
                    type="button"
                    onClick={() => setStandard2(null)}
                    className="text-xs text-[#8B978F] hover:text-[#C86D51] flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {standard2 ? (
                /* Compact Selected Card 2 */
                <div className="p-4 rounded-2xl border border-[#5B8272] bg-[#FAF9F5] dark:bg-[#1B2B26] space-y-2 relative animate-in fade-in duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-black text-[#0D3328] dark:text-[#8FA89B]">
                        {standard2.is_number}
                      </p>
                      <h4 className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] line-clamp-2 mt-0.5">
                        {standard2.title}
                      </h4>
                    </div>
                    <StatusBadge status={standard2.status} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] dark:border-[#253831] text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                    <span>{standard2.product_category}</span>
                    <span className="font-bold text-[#1B5E39] dark:text-[#A7F3D0]">Selected</span>
                  </div>
                </div>
              ) : (
                /* Search / Dropdown 2 */
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search2}
                      onFocus={() => setIsDropdown2Open(true)}
                      onChange={(e) => {
                        setSearch2(e.target.value);
                        setIsDropdown2Open(true);
                      }}
                      placeholder="Type standard or search (e.g. IS 302 Part 1)..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/20 focus:border-[#0D3328] transition-all"
                    />
                  </div>

                  {isDropdown2Open && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] shadow-lg divide-y divide-[#EFECE6] dark:divide-[#1C2E28] animate-in fade-in duration-100">
                      {filteredStandards2.map((std) => (
                        <button
                          key={std.is_number}
                          type="button"
                          onClick={() => {
                            setStandard2(std);
                            setIsDropdown2Open(false);
                            setSearch2('');
                          }}
                          className="w-full p-3.5 text-left hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] transition-colors flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] truncate">
                              {std.is_number}
                            </p>
                            <p className="text-xs text-[#18211D] dark:text-[#F7F5EF] line-clamp-1 mt-0.5">
                              {std.title}
                            </p>
                            <p className="text-[10px] text-[#8B978F] mt-0.5">
                              {std.product_category}
                            </p>
                          </div>
                          <StatusBadge status={std.status} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Validation Warnings & Compare Button Area */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {isDuplicate && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#9E3A20] dark:text-[#FECACA] bg-[#FDF2EE] dark:bg-[#3E1A14] px-3.5 py-2 rounded-2xl border border-[#FBE0D6] dark:border-[#52251D] animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#C86D51]" />
                  <span>Please select two different standards to compare.</span>
                </div>
              )}

              {!isDuplicate && (!standard1 || !standard2) && (
                <p className="text-xs text-[#8B978F]">
                  {!standard1 && !standard2
                    ? 'Select two standards above to compare.'
                    : !standard1
                    ? 'Select Standard 1 to proceed with comparison.'
                    : 'Select Standard 2 to proceed with comparison.'}
                </p>
              )}

              {canCompare && !isComparing && !comparisonResult && (
                <p className="text-xs text-[#1B5E39] dark:text-[#A7F3D0] font-bold">
                  ✓ Ready to compare {standard1?.is_number} and {standard2?.is_number}.
                </p>
              )}
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Button
                variant="pill"
                size="md"
                disabled={!canCompare || isComparing}
                onClick={() => handleRunComparison()}
                className="w-full sm:w-auto font-bold text-xs"
                icon={<Scale className="w-4 h-4" />}
              >
                {isComparing ? 'Comparing...' : 'Compare Standards'}
              </Button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {isComparing && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-12 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] mx-auto animate-pulse">
              <Scale className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Comparing standard scope and requirements...
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] max-w-sm mx-auto">
                Aligning product scopes, testing matrices, statutory QCO notifications, and certification pathways.
              </p>
            </div>
          </div>
        )}

        {/* 3. COMPARISON RESULT VIEW */}
        {comparisonResult && !isComparing && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Side-by-Side Comparison Header */}
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                    Side-by-side comparison
                  </span>
                  <span className="text-xs text-[#8B978F]">
                    Comparison Overview
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetComparison}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="font-bold text-xs"
                >
                  Start New Comparison
                </Button>
              </div>

              {/* Side by side Standard Cards Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard 1 Header Card */}
                <div className="p-5 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0D3328]" />
                        <p className="font-mono text-xs font-black text-[#0D3328] dark:text-[#8FA89B]">
                          {comparisonResult.standard1.is_number}
                        </p>
                      </div>
                      <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                        {comparisonResult.standard1.title}
                      </h3>
                    </div>
                    <StatusBadge status={comparisonResult.standard1.status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFECE6] dark:border-[#253831] text-xs">
                    <SourceReferenceTag sources={comparisonResult.standard1.source_refs} />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSaved1(!isSaved1)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          isSaved1
                            ? 'bg-[#E8F4EC] dark:bg-[#113624] border-[#C2E4CD] text-[#1B5E39] dark:text-[#A7F3D0]'
                            : 'bg-white dark:bg-[#15221E] border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#F7F5EF]'
                        }`}
                      >
                        {isSaved1 ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                        <span>{isSaved1 ? 'Saved' : 'Save'}</span>
                      </button>

                      <Link href={`/standards/${encodeURIComponent(comparisonResult.standard1.is_number)}`}>
                        <Button variant="secondary" size="sm" icon={<FileText className="w-3 h-3" />}>
                          View Standard 1
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Standard 2 Header Card */}
                <div className="p-5 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5B8272]" />
                        <p className="font-mono text-xs font-black text-[#5B8272] dark:text-[#BAC5BF]">
                          {comparisonResult.standard2.is_number}
                        </p>
                      </div>
                      <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                        {comparisonResult.standard2.title}
                      </h3>
                    </div>
                    <StatusBadge status={comparisonResult.standard2.status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFECE6] dark:border-[#253831] text-xs">
                    <SourceReferenceTag sources={comparisonResult.standard2.source_refs} />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSaved2(!isSaved2)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          isSaved2
                            ? 'bg-[#E8F4EC] dark:bg-[#113624] border-[#C2E4CD] text-[#1B5E39] dark:text-[#A7F3D0]'
                            : 'bg-white dark:bg-[#15221E] border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#F7F5EF]'
                        }`}
                      >
                        {isSaved2 ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                        <span>{isSaved2 ? 'Saved' : 'Save'}</span>
                      </button>

                      <Link href={`/standards/${encodeURIComponent(comparisonResult.standard2.is_number)}`}>
                        <Button variant="secondary" size="sm" icon={<FileText className="w-3 h-3" />}>
                          View Standard 2
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlap & Relationship Informational Card */}
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
                <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                  How These Standards Relate
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border-l-4 border-l-[#0D3328] border border-[#EFECE6] dark:border-[#253831] text-xs sm:text-sm text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
                {comparisonResult.relationship_overview}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5B8272]" />
                  <span>Comprehensive Comparison Matrix</span>
                </h2>
                <span className="text-[11px] text-[#8B978F]">10 Comparative Dimensions</span>
              </div>

              <ComparisonTable
                standard1Number={comparisonResult.standard1.is_number}
                standard2Number={comparisonResult.standard2.is_number}
                rows={comparisonResult.rows}
              />
            </div>

            {/* Key Differences Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B88746]" />
                  <span>Key Differences</span>
                </h2>
                <span className="text-[11px] text-[#8B978F]">Essential Analytical Takeaways</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonResult.key_differences.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] shadow-2xs space-y-3"
                  >
                    <div className="border-b border-[#EFECE6] dark:border-[#1C2E28] pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full">
                        Dimension: {diff.dimension}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-0.5">
                        <p className="font-mono text-[11px] font-black text-[#0D3328] dark:text-[#8FA89B]">
                          {comparisonResult.standard1.is_number}
                        </p>
                        <p className="text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                          {diff.standard1_point}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-0.5">
                        <p className="font-mono text-[11px] font-black text-[#5B8272] dark:text-[#BAC5BF]">
                          {comparisonResult.standard2.is_number}
                        </p>
                        <p className="text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                          {diff.standard2_point}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#8B978F] italic pt-1 border-t border-[#EFECE6] dark:border-[#1C2E28]">
                      <strong>Summary:</strong> {diff.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source & Verification Notice */}
            <UncertaintyNotice message="Comparison is provided as guidance based on available standard metadata. Always verify the latest BIS publication, scope, amendments, and applicable regulatory requirements before relying on this comparison." />

            {/* Action Navigation Footer */}
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Ready to explore detailed clause requirements?
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
                  Open full Standard Details, Testing Roadmaps, or Recognized Laboratories for either standard.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/standards/${encodeURIComponent(comparisonResult.standard1.is_number)}`}>
                  <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open {comparisonResult.standard1.is_number}
                  </Button>
                </Link>
                <Link href={`/standards/${encodeURIComponent(comparisonResult.standard2.is_number)}`}>
                  <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open {comparisonResult.standard2.is_number}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
