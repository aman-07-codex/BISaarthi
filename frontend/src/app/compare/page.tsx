'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { Button } from '@/components/common/Button';
import { ComparisonTable } from '@/components/standards/ComparisonTable';
import {
  SUGGESTED_SELECTABLE_STANDARDS,
  SUGGESTED_COMPARISON_PAIRS,
  getStandardComparisonData,
} from '@/data/mockCompareData';
import { StandardDetailsData, StandardComparisonData } from '@/types';
import {
  Scale,
  Search,
  ArrowRight,
  ArrowLeft,
  Check,
  Bookmark,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  Info,
  ShieldCheck,
  X,
  Plus,
  Compass,
} from 'lucide-react';

export default function CompareStandardsPage() {
  // Selection state (Accepts EXACTLY TWO standards)
  const [standard1, setStandard1] = useState<StandardDetailsData | null>(null);
  const [standard2, setStandard2] = useState<StandardDetailsData | null>(null);

  // Search filter query within dropdowns
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);

  // Comparison & loading state
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<StandardComparisonData | null>(null);

  // Save bookmark visual state
  const [isSaved1, setIsSaved1] = useState(false);
  const [isSaved2, setIsSaved2] = useState(false);

  // Filtered standards for dropdown 1
  const filteredStandards1 = useMemo(() => {
    return SUGGESTED_SELECTABLE_STANDARDS.filter(
      (s) =>
        s.is_number.toLowerCase().includes(search1.toLowerCase()) ||
        s.title.toLowerCase().includes(search1.toLowerCase()) ||
        s.product_category.toLowerCase().includes(search1.toLowerCase())
    );
  }, [search1]);

  // Filtered standards for dropdown 2
  const filteredStandards2 = useMemo(() => {
    return SUGGESTED_SELECTABLE_STANDARDS.filter(
      (s) =>
        s.is_number.toLowerCase().includes(search2.toLowerCase()) ||
        s.title.toLowerCase().includes(search2.toLowerCase()) ||
        s.product_category.toLowerCase().includes(search2.toLowerCase())
    );
  }, [search2]);

  // Validation rules
  const isDuplicate = standard1 && standard2 && standard1.is_number === standard2.is_number;
  const canCompare = standard1 && standard2 && !isDuplicate;

  // Handle comparison trigger
  const handleRunComparison = (s1?: StandardDetailsData, s2?: StandardDetailsData) => {
    const target1 = s1 || standard1;
    const target2 = s2 || standard2;

    if (!target1 || !target2 || target1.is_number === target2.is_number) return;

    setIsComparing(true);
    // Simulate brief frontend loading transition for crisp feedback
    setTimeout(() => {
      const result = getStandardComparisonData(target1.is_number, target2.is_number);
      setComparisonResult(result);
      setIsComparing(false);
    }, 400);
  };

  // Quick selection from suggested comparison pair
  const handleSelectPair = (standard1Is: string, standard2Is: string) => {
    const found1 =
      SUGGESTED_SELECTABLE_STANDARDS.find((s) => s.is_number === standard1Is) ||
      SUGGESTED_SELECTABLE_STANDARDS[0];
    const found2 =
      SUGGESTED_SELECTABLE_STANDARDS.find((s) => s.is_number === standard2Is) ||
      SUGGESTED_SELECTABLE_STANDARDS[1];

    setStandard1(found1);
    setStandard2(found2);
    setSearch1('');
    setSearch2('');
    setIsDropdown1Open(false);
    setIsDropdown2Open(false);
    handleRunComparison(found1, found2);
  };

  // Reset comparison state
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
              Compare Standards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Compare 2 Standards</span>
            </span>
          </div>
        </div>

        {/* Page Title & Header Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
            <Scale className="w-5 h-5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-blue-400 tracking-tight leading-tight">
            Compare Standards
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-3xl">
            Compare two Indian Standards side by side to understand their scope, applicability, requirements, and key differences.
          </p>
        </div>

        {/* 1. SELECTION WORKSPACE (EXACTLY TWO STANDARDS) */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Select Standards to Compare
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select two standards to generate a side-by-side comparison.
              </p>
            </div>

            {comparisonResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetComparison}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Start New Comparison
              </Button>
            )}
          </div>

          {/* Selectors Grid: Standard 1 | VS | Standard 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-start">
            {/* Standard 1 Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Standard 1</span>
                </label>
                {standard1 && (
                  <button
                    type="button"
                    onClick={() => setStandard1(null)}
                    className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {standard1 ? (
                /* Compact Selected Card 1 */
                <div className="p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700/80 bg-blue-50/40 dark:bg-slate-900/60 space-y-2 relative animate-in fade-in duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400">
                        {standard1.is_number}
                      </p>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5">
                        {standard1.title}
                      </h4>
                    </div>
                    <StatusBadge status={standard1.status} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{standard1.product_category}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Selected</span>
                  </div>
                </div>
              ) : (
                /* Search / Dropdown 1 */
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search1}
                      onFocus={() => setIsDropdown1Open(true)}
                      onChange={(e) => {
                        setSearch1(e.target.value);
                        setIsDropdown1Open(true);
                      }}
                      placeholder="Type standard or search (e.g. IS 302)..."
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>

                  {isDropdown1Open && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in duration-100">
                      {filteredStandards1.map((std) => (
                        <button
                          key={std.is_number}
                          type="button"
                          onClick={() => {
                            setStandard1(std);
                            setIsDropdown1Open(false);
                            setSearch1('');
                          }}
                          className="w-full p-3 text-left hover:bg-blue-50/70 dark:hover:bg-slate-700/60 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400 truncate">
                              {std.is_number}
                            </p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5">
                              {std.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
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
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-750 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shadow-xs">
                VS
              </div>
            </div>

            {/* Standard 2 Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Standard 2</span>
                </label>
                {standard2 && (
                  <button
                    type="button"
                    onClick={() => setStandard2(null)}
                    className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {standard2 ? (
                /* Compact Selected Card 2 */
                <div className="p-4 rounded-xl border-2 border-indigo-300 dark:border-indigo-700/80 bg-indigo-50/40 dark:bg-slate-900/60 space-y-2 relative animate-in fade-in duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400">
                        {standard2.is_number}
                      </p>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5">
                        {standard2.title}
                      </h4>
                    </div>
                    <StatusBadge status={standard2.status} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{standard2.product_category}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Selected</span>
                  </div>
                </div>
              ) : (
                /* Search / Dropdown 2 */
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search2}
                      onFocus={() => setIsDropdown2Open(true)}
                      onChange={(e) => {
                        setSearch2(e.target.value);
                        setIsDropdown2Open(true);
                      }}
                      placeholder="Type standard or search (e.g. IS 302 Part 1)..."
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>

                  {isDropdown2Open && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in duration-100">
                      {filteredStandards2.map((std) => (
                        <button
                          key={std.is_number}
                          type="button"
                          onClick={() => {
                            setStandard2(std);
                            setIsDropdown2Open(false);
                            setSearch2('');
                          }}
                          className="w-full p-3 text-left hover:bg-indigo-50/70 dark:hover:bg-slate-700/60 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400 truncate">
                              {std.is_number}
                            </p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5">
                              {std.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
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
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Please select two different standards to compare.</span>
                </div>
              )}

              {!isDuplicate && (!standard1 || !standard2) && (
                <p className="text-xs text-slate-400">
                  {!standard1 && !standard2
                    ? 'Select two standards above or pick a suggested pair below.'
                    : !standard1
                    ? 'Select Standard 1 to proceed with comparison.'
                    : 'Select Standard 2 to proceed with comparison.'}
                </p>
              )}

              {canCompare && !isComparing && !comparisonResult && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Ready to compare {standard1?.is_number} and {standard2?.is_number}.
                </p>
              )}
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                disabled={!canCompare || isComparing}
                onClick={() => handleRunComparison()}
                className="w-full sm:w-auto"
                icon={<Scale className="w-4 h-4" />}
              >
                {isComparing ? 'Comparing...' : 'Compare Standards'}
              </Button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {isComparing && (
          <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 mx-auto animate-pulse">
              <Scale className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Comparing standard scope and requirements...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Aligning product scopes, testing matrices, statutory QCO notifications, and certification pathways.
              </p>
            </div>
          </div>
        )}

        {/* 2. EMPTY STATE (When no comparison is active) */}
        {!comparisonResult && !isComparing && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-lg mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Compare two standards
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select exactly two IS standards to see their scope, applicability, and key differences side by side.
                </p>
              </div>
            </div>

            {/* Suggested Comparison Pairs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Suggested Comparison Pairs</span>
                </h3>
                <span className="text-[11px] text-slate-400">Click to compare instantly</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUGGESTED_COMPARISON_PAIRS.map((pair) => (
                  <button
                    key={pair.id}
                    type="button"
                    onClick={() => handleSelectPair(pair.standard1_is, pair.standard2_is)}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all text-left space-y-3 group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        {pair.tag}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                        {pair.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {pair.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono font-bold text-[#1E3A8A] dark:text-blue-400">
                      <span className="truncate">{pair.standard1_is} ↔ {pair.standard2_is}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. COMPARISON RESULT VIEW */}
        {comparisonResult && !isComparing && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Side-by-Side Comparison Header */}
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                    Side-by-side comparison
                  </span>
                  <span className="text-xs text-slate-400">
                    Comparison Overview
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetComparison}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Start New Comparison
                </Button>
              </div>

              {/* Side by side Standard Cards Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard 1 Header Card */}
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/80 bg-blue-50/40 dark:bg-slate-900/60 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400">
                          {comparisonResult.standard1.is_number}
                        </p>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {comparisonResult.standard1.title}
                      </h3>
                    </div>
                    <StatusBadge status={comparisonResult.standard1.status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100 dark:border-slate-800 text-xs">
                    <SourceReferenceTag sources={comparisonResult.standard1.source_refs} />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSaved1(!isSaved1)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                          isSaved1
                            ? 'bg-blue-100 dark:bg-blue-900/80 border-blue-400 text-blue-800 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
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
                <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/40 dark:bg-slate-900/60 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400">
                          {comparisonResult.standard2.is_number}
                        </p>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {comparisonResult.standard2.title}
                      </h3>
                    </div>
                    <StatusBadge status={comparisonResult.standard2.status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100 dark:border-slate-800 text-xs">
                    <SourceReferenceTag sources={comparisonResult.standard2.source_refs} />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSaved2(!isSaved2)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                          isSaved2
                            ? 'bg-indigo-100 dark:bg-indigo-900/80 border-indigo-400 text-indigo-800 dark:text-indigo-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
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
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  How These Standards Relate
                </h2>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-slate-900/70 border-l-4 border-l-[#2563EB] border-t border-r border-b border-blue-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {comparisonResult.relationship_overview}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span>Comprehensive Comparison Matrix</span>
                </h2>
                <span className="text-[11px] text-slate-400">10 Comparative Dimensions</span>
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
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Key Differences</span>
                </h2>
                <span className="text-[11px] text-slate-400">Essential Analytical Takeaways</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonResult.key_differences.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 shadow-xs space-y-3"
                  >
                    <div className="border-b border-slate-100 dark:border-slate-700/60 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded">
                        Dimension: {diff.dimension}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 space-y-0.5">
                        <p className="font-mono text-[11px] font-bold text-[#1E3A8A] dark:text-blue-300">
                          {comparisonResult.standard1.is_number}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {diff.standard1_point}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 space-y-0.5">
                        <p className="font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                          {comparisonResult.standard2.is_number}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {diff.standard2_point}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <strong>Summary:</strong> {diff.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source & Verification Notice */}
            <UncertaintyNotice message="Comparison is provided as guidance based on available standard metadata. Always verify the latest BIS publication, scope, amendments, and applicable regulatory requirements before relying on this comparison." />

            {/* Action Navigation Footer */}
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ready to explore detailed clause requirements?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
