'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { ComparisonTable } from '@/components/standards/ComparisonTable';
import { searchStandards, compareStandards, APIError } from '@/lib/api';
import {
  StandardListItem,
  StandardDetailsData,
  StandardComparisonData,
} from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  Scale,
  Search,
  ChevronRight,
  RefreshCw,
  Layers,
  AlertCircle,
  Info,
  X,
  Loader2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function CompareStandardsPage() {
  const { language, t } = useLanguage();
  const [availableStandards, setAvailableStandards] = useState<StandardListItem[]>([]);
  const [standard1, setStandard1] = useState<StandardListItem | null>(null);
  const [standard2, setStandard2] = useState<StandardListItem | null>(null);

  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);

  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<StandardComparisonData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial 100 standards on mount
  useEffect(() => {
    async function loadCorpus() {
      try {
        const res = await searchStandards({ page: 1, page_size: 100 });
        setAvailableStandards(res.items);
      } catch (err) {
        console.error('Failed to load standard choices for comparison', err);
      }
    }
    loadCorpus();
  }, []);

  const filteredStandards1 = useMemo(() => {
    return availableStandards.filter(
      (s) =>
        (s.is_number || '').toLowerCase().includes(search1.toLowerCase()) ||
        (s.title || '').toLowerCase().includes(search1.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(search1.toLowerCase())
    );
  }, [availableStandards, search1]);

  const filteredStandards2 = useMemo(() => {
    return availableStandards.filter(
      (s) =>
        (s.is_number || '').toLowerCase().includes(search2.toLowerCase()) ||
        (s.title || '').toLowerCase().includes(search2.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(search2.toLowerCase())
    );
  }, [availableStandards, search2]);

  const isDuplicate = standard1 && standard2 && standard1.is_number === standard2.is_number;
  const canCompare = standard1 && standard2 && !isDuplicate;

  const handleRunComparison = async (s1?: StandardListItem, s2?: StandardListItem) => {
    const target1 = s1 || standard1;
    const target2 = s2 || standard2;

    if (!target1 || !target2 || target1.is_number === target2.is_number) return;

    setIsComparing(true);
    setErrorMessage(null);

    try {
      const response = await compareStandards({
        standard_a: target1.is_number,
        standard_b: target2.is_number,
      });

      const s1Details: StandardDetailsData = {
        is_number: response.standard_a.is_number,
        title: response.standard_a.title,
        status: response.standard_a.status?.toLowerCase().includes('active') ? 'active' : 'under_revision',
        relevance: 'highly_relevant',
        edition_info: response.standard_a.type || 'Standard Edition',
        publication_date: response.standard_a.formatted_date || response.standard_a.publication_date || 'N/A',
        last_verified_date: 'August 2026',
        product_category: response.standard_a.category,
        standard_type: response.standard_a.type || 'Product Standard',
        scheme_info: response.standard_a.department || 'BIS Scheme-I',
        qco_status: 'mandatory',
        why_applicable: response.standard_a.primary_use_case || response.standard_a.reason_selected || 'Authoritative MVP standard.',
        scope_description: response.standard_a.primary_use_case || response.standard_a.title,
        limitations: [],
        key_requirements: [],
        source_refs: [],
        related_standards_preview: [],
      };

      const s2Details: StandardDetailsData = {
        is_number: response.standard_b.is_number,
        title: response.standard_b.title,
        status: response.standard_b.status?.toLowerCase().includes('active') ? 'active' : 'under_revision',
        relevance: 'highly_relevant',
        edition_info: response.standard_b.type || 'Standard Edition',
        publication_date: response.standard_b.formatted_date || response.standard_b.publication_date || 'N/A',
        last_verified_date: 'August 2026',
        product_category: response.standard_b.category,
        standard_type: response.standard_b.type || 'Product Standard',
        scheme_info: response.standard_b.department || 'BIS Scheme-I',
        qco_status: 'mandatory',
        why_applicable: response.standard_b.primary_use_case || response.standard_b.reason_selected || 'Authoritative MVP standard.',
        scope_description: response.standard_b.primary_use_case || response.standard_b.title,
        limitations: [],
        key_requirements: [],
        source_refs: [],
        related_standards_preview: [],
      };

      const rows = [
        {
          category: 'Corpus Category',
          standard1_value: response.standard_a.category,
          standard2_value: response.standard_b.category,
        },
        {
          category: 'BIS Department',
          standard1_value: response.standard_a.department || 'N/A',
          standard2_value: response.standard_b.department || 'N/A',
        },
        {
          category: 'Technical Committee',
          standard1_value: response.standard_a.committee || 'N/A',
          standard2_value: response.standard_b.committee || 'N/A',
        },
        {
          category: 'Publication Type',
          standard1_value: response.standard_a.type || 'Standard',
          standard2_value: response.standard_b.type || 'Standard',
        },
        {
          category: 'Publication Status',
          standard1_value: response.standard_a.status || 'Active',
          standard2_value: response.standard_b.status || 'Active',
        },
      ];

      setComparisonResult({
        standard1: s1Details,
        standard2: s2Details,
        relationship_overview: response.message,
        relationship_type: response.comparison?.category?.same ? 'Same Category' : 'Cross Category',
        rows,
        key_differences: [],
        comparison_summary: response.comparison_summary,
        relevance_hint: response.relevance_hint,
      });
      setIsComparing(false);
    } catch (err) {
      setIsComparing(false);
      const msg = err instanceof APIError ? err.message : 'Comparison request failed.';
      setErrorMessage(msg);
    }
  };

  const handleResetComparison = () => {
    setStandard1(null);
    setStandard2(null);
    setComparisonResult(null);
    setSearch1('');
    setSearch2('');
    setErrorMessage(null);
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

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] dark:bg-[#2C1616] border border-[#FCA5A5] dark:border-[#7F1D1D] text-[#991B1B] dark:text-[#F87171] text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Selection Workspace */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFECE6] dark:border-[#1C2E28] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                {language === 'HI' ? 'तुलना के लिए मानक चुनें' : 'Select Standards to Compare'}
              </h2>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-0.5">
                {language === 'HI'
                  ? 'साथ-साथ तुलना देखने के लिए दो मानक चुनें।'
                  : 'Select two standards from the 100-standard corpus to generate side-by-side comparison.'}
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

          {/* Selectors Grid */}
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
                    <StatusBadge status={standard1.status?.toLowerCase().includes('active') ? 'active' : 'unknown'} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] dark:border-[#253831] text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                    <span>{standard1.category}</span>
                    <span className="font-bold text-[#1B5E39] dark:text-[#A7F3D0]">Selected</span>
                  </div>
                </div>
              ) : (
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
                      placeholder="Type standard or search (e.g. IS 2082)..."
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
                              {std.category}
                            </p>
                          </div>
                          <StatusBadge status={std.status?.toLowerCase().includes('active') ? 'active' : 'unknown'} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="lg:col-span-1 flex items-center justify-center py-4 lg:py-8">
              <div className="w-8 h-8 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-xs font-black font-mono text-[#606E66] dark:text-[#BAC5BF]">
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
                    <StatusBadge status={standard2.status?.toLowerCase().includes('active') ? 'active' : 'unknown'} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] dark:border-[#253831] text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                    <span>{standard2.category}</span>
                    <span className="font-bold text-[#1B5E39] dark:text-[#A7F3D0]">Selected</span>
                  </div>
                </div>
              ) : (
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
                      placeholder="Type standard or search (e.g. IS 302)..."
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
                              {std.category}
                            </p>
                          </div>
                          <StatusBadge status={std.status?.toLowerCase().includes('active') ? 'active' : 'unknown'} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Duplicate Selection Notice */}
          {isDuplicate && (
            <div className="p-3 rounded-xl bg-[#FDF2EE] dark:bg-[#3E1A14]/40 border border-[#FBE0D6] dark:border-[#52251D] text-[#9E3A20] dark:text-[#FECACA] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please select two different standards to compare.</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-end pt-4 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <Button
              type="button"
              variant="pill"
              disabled={!canCompare || isComparing}
              onClick={() => handleRunComparison()}
              className="font-bold text-xs"
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Comparing Metadata...</span>
                </>
              ) : (
                <span>{language === 'HI' ? 'मानकों की तुलना करें' : 'Compare Standards'}</span>
              )}
            </Button>
          </div>
        </div>

        {/* 2. STRUCTURED COMPARISON RESULTS */}
        {comparisonResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* BISaarthi's Assistant Comparison Summary */}
            {comparisonResult.comparison_summary ? (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#5B8272]/30 dark:border-[#5B8272]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0D3328] dark:bg-[#5B8272] flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-4 h-4 text-[#A7F3D0]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0D3328] dark:text-[#A7F3D0] tracking-tight">
                      {language === 'HI' ? 'BISaarthi की तुलना' : "BISaarthi's Comparison"}
                    </h3>
                    <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                      {language === 'HI'
                        ? 'आधिकारिक कॉर्पस मेटाडेटा पर आधारित अनुप्रयोग क्षेत्र विश्लेषण'
                        : 'Application domain analysis grounded in authoritative corpus metadata'}
                    </p>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-[#18211D] dark:text-[#F7F5EF] leading-relaxed space-y-3 whitespace-pre-line font-normal">
                  {comparisonResult.comparison_summary}
                </div>

                {comparisonResult.relevance_hint && (
                  <div className="pt-4 mt-4 border-t border-[#D9DDD8] dark:border-[#253831] space-y-2">
                    <h4 className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#5B8272]" />
                      <span>{language === 'HI' ? 'कौन सा अधिक प्रासंगिक हो सकता है?' : 'Which may be more relevant?'}</span>
                    </h4>
                    <div className="text-xs text-[#2A4436] dark:text-[#BAC5BF] leading-relaxed whitespace-pre-line bg-white/70 dark:bg-[#15221E]/70 p-3.5 rounded-2xl border border-[#D9DDD8] dark:border-[#253831]">
                      {comparisonResult.relevance_hint}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#D9DDD8] dark:border-[#253831] space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#5B8272]" />
                  <h3 className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] uppercase tracking-wide">
                    {language === 'HI' ? 'मेटाडेटा तुलना विश्लेषण' : 'Metadata Comparison Analysis'}
                  </h3>
                </div>
                <p className="text-xs text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
                  {comparisonResult.relationship_overview}
                </p>
              </div>
            )}

            {/* What We Know — Comparison Table */}
            <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5B8272]" />
                <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                  {language === 'HI' ? 'उपलब्ध मेटाडेटा तुलना' : 'What We Know (Metadata Comparison)'}
                </h3>
              </div>

              <ComparisonTable
                standard1Number={comparisonResult.standard1.is_number}
                standard2Number={comparisonResult.standard2.is_number}
                rows={comparisonResult.rows}
              />
            </div>

            {/* Technical Clause Limitation Notice */}
            <div className="p-5 rounded-3xl bg-[#FEF6F0] dark:bg-[#2C1C16] border border-[#FCD8C5] dark:border-[#663522] space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#C86D51]" />
                <h3 className="text-xs font-bold text-[#9E3A20] dark:text-[#FCA5A5] uppercase tracking-wider">
                  {language === 'HI' ? 'तकनीकी तुलना सीमा' : 'Technical Comparison Limitation'}
                </h3>
              </div>
              <p className="text-xs text-[#782C17] dark:text-[#FECACA] leading-relaxed">
                Detailed clause-level requirements, test methods, numerical limits, and other document-specific differences
                are unavailable until the official BIS documents are legitimately acquired and verified.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
