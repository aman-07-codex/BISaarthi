'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/common/Button';
import { StandardCard } from '@/components/standards/StandardCard';
import { DocumentDropzone } from '@/components/standards/DocumentDropzone';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { StandardCardData } from '@/types';
import {
  MOCK_FIND_STANDARDS_ELECTRIC_HEATER,
  MOCK_FIND_STANDARDS_LED,
  MOCK_FIND_STANDARDS_BATTERY,
} from '@/data/mockFindStandards';
import {
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  SlidersHorizontal,
  Info,
  Layers,
  ShieldCheck,
} from 'lucide-react';

type AnalysisStep = 'idle' | 'analyzing_input' | 'matching_categories' | 'ranking_standards' | 'completed';

export default function FindStandardsPage() {
  const [productQuery, setProductQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [results, setResults] = useState<StandardCardData[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const examplePrompts = [
    {
      title: 'Electric Heater',
      text: 'I want to manufacture an electric heater. Which BIS standards apply?',
    },
    {
      title: 'LED Lamps',
      text: 'I am manufacturing self-ballasted LED lamps for general lighting services.',
    },
    {
      title: 'Plugs & Sockets',
      text: 'Which standards and mandatory testing apply to household 3-pin plugs and sockets?',
    },
    {
      title: 'Lithium Battery Packs',
      text: 'Standards and safety requirements for lithium-ion battery packs for portable devices.',
    },
  ];

  const handleSearch = (queryOverride?: string) => {
    const query = queryOverride || productQuery;
    if (!query.trim() && !attachedFile) return;

    if (queryOverride) {
      setProductQuery(queryOverride);
    }

    // Begin staged mock analysis
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Find Applicable Standards
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Describe your product, process, or requirement and BISaarthi will identify potentially applicable Indian Standards.
            </p>
          </div>

          {results && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
              className="self-start sm:self-auto"
            >
              New Search
            </Button>
          )}
        </div>

        {/* Search & Input Workspace */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Main Product Description Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Describe Your Product or Regulatory Need</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Natural language description
              </span>
            </div>

            <textarea
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Example: I want to manufacture an electric immersion water heater for domestic use. What BIS standards apply to the heating element, body insulation, and power cord?"
              rows={3}
              className="w-full p-4 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Example Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Examples:
            </span>
            {examplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(p.text)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#1E3A8A] dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Optional Document Upload Zone */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <DocumentDropzone onFileSelect={(file) => setAttachedFile(file)} />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Referenced from Indian Standards & Quality Control Orders</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {productQuery && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
              <Button
                type="button"
                variant="primary"
                onClick={() => handleSearch()}
                disabled={!productQuery.trim() && !attachedFile}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {analysisStep !== 'idle' && analysisStep !== 'completed'
                  ? 'Analyzing...'
                  : 'Find Standards'}
              </Button>
            </div>
          </div>
        </div>

        {/* Staged Mock Analysis Progress State */}
        {analysisStep !== 'idle' && analysisStep !== 'completed' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                BISaarthi is analyzing your product description...
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                  analysisStep === 'analyzing_input' || analysisStep === 'matching_categories' || analysisStep === 'ranking_standards'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. Understanding product specification</span>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                  analysisStep === 'matching_categories' || analysisStep === 'ranking_standards'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {analysisStep === 'matching_categories' || analysisStep === 'ranking_standards' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>2. Identifying standard categories</span>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                  analysisStep === 'ranking_standards'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {analysisStep === 'ranking_standards' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>3. Ranking applicable standards</span>
              </div>
            </div>
          </div>
        )}

        {/* Ranked Results View */}
        {results && analysisStep === 'completed' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Results Header with Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Potentially Applicable Standards</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1E3A8A] dark:text-blue-300 font-mono">
                    {filteredResults?.length} Found
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ranked by qualitative applicability based on product heating, electrical safety, and connection components.
                </p>
              </div>

              {/* Lightweight Filter / Sort UI */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">Filter:</span>
                </div>

                <select
                  value={relevanceFilter}
                  onChange={(e) => setRelevanceFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">All Relevance</option>
                  <option value="highly_relevant">Highly Relevant</option>
                  <option value="relevant">Relevant</option>
                  <option value="possibly_relevant">Possibly Relevant</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="under_revision">Under Revision</option>
                </select>
              </div>
            </div>

            {/* Explanation Callout Panel */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Why These Standards?
                </h3>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Based on your product description, BISaarthi identified electrical heating element design, household appliance general safety, and 3-pin plug cord set requirements as the primary regulatory domains under the <strong>Electrical Appliances Quality Control Order (QCO)</strong>.
              </p>
            </div>

            {/* Uncertainty Notice */}
            <UncertaintyNotice message="Results are guidance and do not constitute a formal certification determination. Specific test limits, earthing parameters, and laboratory test protocols must be verified with the official BIS standard clauses before starting mass production." />

            {/* List of Ranked Standard Cards */}
            <div className="space-y-4">
              {filteredResults && filteredResults.length > 0 ? (
                filteredResults.map((std) => (
                  <StandardCard key={std.is_number} standard={std} />
                ))
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                  No standards match the selected filters. Try clearing your filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial / Empty State: How Find Standards Works */}
        {!results && analysisStep === 'idle' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>How Find Standards Works</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A simple 3-step workflow designed to help manufacturers identify applicable standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#1E3A8A] dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Describe Product
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your product type, target application, or attach an optional technical datasheet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#1E3A8A] dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Standards Matching
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  BISaarthi searches indexed Indian Standards databases, gazettes, and Quality Control Orders (QCOs).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#1E3A8A] dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Explore Requirements & Tests
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Review ranked standards, understand why they apply, and drill into specific testing and certification processes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
