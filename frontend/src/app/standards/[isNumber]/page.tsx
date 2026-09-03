'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { RelatedToolsNav } from '@/components/standards/RelatedToolsNav';
import { Button } from '@/components/common/Button';
import { getStandardDetailsBySlug } from '@/data/mockStandardDetails';
import {
  Bookmark,
  Check,
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  Building,
  Tag,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface StandardDetailsPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function StandardDetailsPage({ params }: StandardDetailsPageProps) {
  const { isNumber } = use(params);
  const standard = getStandardDetailsBySlug(isNumber);
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Breadcrumb & Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href="/find-standards"
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#1E3A8A] dark:hover:text-blue-400 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Find Standards</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Standard Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
              {standard.is_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Indexed BIS Standard</span>
            </span>
          </div>
        </div>

        {/* Standard Identity Header */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  Applicable Standard
                </span>
                <StatusBadge status={standard.status} />
                {standard.relevance && <RelevanceBadge relevance={standard.relevance} />}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-[#1E3A8A] dark:text-blue-400 tracking-tight leading-tight">
                {standard.is_number}
              </h1>

              <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {standard.title}
              </p>
            </div>

            {/* Save Standard Bookmark Toggle Button */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSave}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                  isSaved
                    ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Saved to List</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Save Standard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-700 dark:text-slate-300">Authoritative Citation:</span>
              <SourceReferenceTag sources={standard.source_refs} />
            </div>
            <span className="text-[11px] text-slate-400">
              Last synchronized: {standard.last_verified_date}
            </span>
          </div>
        </div>

        {/* At a Glance: Key Metadata Grid */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              At a Glance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Standard Number
              </p>
              <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                {standard.is_number}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Status
              </p>
              <div className="mt-1">
                <StatusBadge status={standard.status} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Edition / Revision
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">
                {standard.edition_info}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Publication Year
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                {standard.publication_date}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Product Category
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">
                {standard.product_category}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Standard Type
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">
                {standard.standard_type}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Conformity Scheme
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">
                {standard.scheme_info}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Legal Mandate
              </p>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1 uppercase">
                {standard.qco_status} (QCO)
              </p>
            </div>
          </div>
        </div>

        {/* Why this standard may apply */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Why This Standard Applies
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-slate-900/70 border-l-4 border-l-[#2563EB] border-t border-r border-b border-blue-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            {standard.why_applicable}
          </div>

          {/* Scope Limitations & Exclusions */}
          {standard.limitations && standard.limitations.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Scope Boundaries & Limitations</span>
              </h3>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-600 dark:text-slate-400">
                {standard.limitations.map((lim, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <UncertaintyNotice message="Applicability depends on the exact product construction, rating, intended use, and scope conditions. Verify the latest BIS standard and applicable regulatory requirements before testing or certification." />
        </div>

        {/* Scope & Key Requirements */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Scope of the Standard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {standard.scope_description}
            </p>
          </div>

          {/* Categorized Key Requirements Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Key Requirements by Category
              </h3>
              <span className="text-[11px] text-slate-400">
                High-level engineering benchmarks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standard.key_requirements.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                >
                  <div className="border-b border-slate-200/80 dark:border-slate-800 pb-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {cat.category}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {cat.points.map((pt, pIdx) => (
                      <div key={pIdx} className="space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            • {pt.title}
                          </p>
                          {pt.requires_verification && (
                            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/80 shrink-0">
                              Requires clause verification
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 pl-3 leading-relaxed">
                          {pt.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory & Certification Context */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Regulatory & Certification Context
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                  Mandatory QCO Coverage
                </span>
              </div>
              <p className="text-xs text-red-900/90 dark:text-red-200/90 leading-relaxed">
                This standard is notified under the <strong>{standard.qco_order_name || 'Quality Control Order'}</strong>. Commercial production, import, and distribution requires a valid BIS License and ISI marking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  Conformity Assessment Pathway
                </span>
              </div>
              <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed">
                Requires factory audit, in-house quality testing machinery, routine testing logs, and third-party sample testing at a recognized BIS laboratory.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Note: BISaarthi provides guidance and does not determine statutory compliance. Always consult official DPIIT and BIS gazette releases for legal enforcement timelines.
          </p>
        </div>

        {/* Related Standards Preview */}
        {standard.related_standards_preview && standard.related_standards_preview.length > 0 && (
          <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Related Indian Standards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {standard.related_standards_preview.map((rel, idx) => (
                <Link
                  key={idx}
                  href={`/standards/${encodeURIComponent(rel.is_number)}`}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-blue-50/50 dark:hover:bg-slate-700/40 hover:border-blue-300 dark:hover:border-slate-600 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400 group-hover:underline">
                      {rel.is_number}
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {rel.relation_note}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Compliance Tools Section */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs">
          <RelatedToolsNav isNumber={standard.is_number} />
        </div>

        {/* Authoritative Sources Section */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Authoritative Sources & Citations
            </h2>
          </div>

          <div className="space-y-3">
            {standard.source_refs.map((src, idx) => (
              <div
                key={src.source_id || idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {src.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        src.reliability_tier === 'primary'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {src.reliability_tier === 'primary' ? 'Primary BIS' : 'Government Gazette'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Source Type: <span className="font-mono text-slate-600 dark:text-slate-300">{src.source_type}</span>
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0">
                  Last verified: {src.retrieved_at || 'August 2026'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
