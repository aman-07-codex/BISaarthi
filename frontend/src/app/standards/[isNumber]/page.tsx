'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { RelatedToolsNav } from '@/components/standards/RelatedToolsNav';
import { getStandardDetailsBySlug } from '@/data/mockStandardDetails';
import {
  Bookmark,
  Check,
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  Layers,
  ArrowLeft,
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
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#606E66] dark:text-[#BAC5BF]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href="/find-standards"
              className="inline-flex items-center gap-1 text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Find Standards</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span>Standard Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-mono font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              {standard.is_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>Indexed BIS Standard</span>
            </span>
          </div>
        </div>

        {/* Standard Identity Header */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                  Applicable Standard
                </span>
                <StatusBadge status={standard.status} />
                {standard.relevance && <RelevanceBadge relevance={standard.relevance} />}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                {standard.is_number}
              </h1>

              <p className="text-sm sm:text-base font-bold text-[#18211D] dark:text-[#F7F5EF] leading-snug">
                {standard.title}
              </p>
            </div>

            {/* Save Standard Bookmark Toggle Button */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSave}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isSaved
                    ? 'bg-[#E8F4EC] dark:bg-[#113624] border-[#C2E4CD] text-[#1B5E39] dark:text-[#A7F3D0]'
                    : 'bg-white dark:bg-[#15221E] border-[#D9DDD8] dark:border-[#253831] text-[#18211D] dark:text-[#F7F5EF] hover:bg-[#FAF9F5]'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-[#1B5E39] dark:text-[#A7F3D0]" />
                    <span>Saved to List</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-[#8B978F]" />
                    <span>Save Standard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex flex-wrap items-center justify-between gap-3 text-xs text-[#606E66] dark:text-[#BAC5BF]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">Authoritative Citation:</span>
              <SourceReferenceTag sources={standard.source_refs} />
            </div>
            <span className="text-[11px] text-[#8B978F]">
              Last synchronized: {standard.last_verified_date}
            </span>
          </div>
        </div>

        {/* At a Glance: Key Metadata Grid */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5B8272]" />
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              At a Glance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Standard Number
              </p>
              <p className="text-xs font-black font-mono text-[#0D3328] dark:text-[#8FA89B] mt-1">
                {standard.is_number}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Current Status
              </p>
              <div className="mt-1">
                <StatusBadge status={standard.status} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Edition / Revision
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate">
                {standard.edition_info}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Publication Year
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1">
                {standard.publication_date}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Product Category
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate">
                {standard.product_category}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Standard Type
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate">
                {standard.standard_type}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Conformity Scheme
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate">
                {standard.scheme_info}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Legal Mandate
              </p>
              <p className="text-xs font-bold text-[#9E3A20] dark:text-[#FECACA] mt-1 uppercase">
                {standard.qco_status} (QCO)
              </p>
            </div>
          </div>
        </div>

        {/* Why this standard may apply */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
            <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
              Why This Standard Applies
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border-l-4 border-l-[#0D3328] border border-[#EFECE6] dark:border-[#253831] text-xs sm:text-sm text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
            {standard.why_applicable}
          </div>

          {/* Scope Limitations & Exclusions */}
          {standard.limitations && standard.limitations.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/40 border border-[#EFECE6] dark:border-[#253831] space-y-2">
              <h3 className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#B88746]" />
                <span>Scope Boundaries & Limitations</span>
              </h3>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-[#606E66] dark:text-[#BAC5BF]">
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
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
              <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Scope of the Standard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed bg-[#FAF9F5] dark:bg-[#1B2B26]/50 p-4 rounded-2xl border border-[#EFECE6] dark:border-[#253831]">
              {standard.scope_description}
            </p>
          </div>

          {/* Categorized Key Requirements Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                Key Requirements by Category
              </h3>
              <span className="text-[11px] text-[#8B978F]">
                High-level engineering benchmarks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standard.key_requirements.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5]/50 dark:bg-[#1B2B26]/40 space-y-3"
                >
                  <div className="border-b border-[#EFECE6] dark:border-[#253831] pb-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                      {cat.category}
                    </h4>
                    <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] mt-0.5">
                      {cat.description}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {cat.points.map((pt, pIdx) => (
                      <div key={pIdx} className="space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                            • {pt.title}
                          </p>
                          {pt.requires_verification && (
                            <span className="text-[10px] font-semibold text-[#8C6126] dark:text-[#FDE68A] bg-[#FAF4EB] dark:bg-[#38240D] px-2 py-0.5 rounded-full border border-[#F2E4CD] dark:border-[#523A1B] shrink-0">
                              Requires clause verification
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] pl-3 leading-relaxed">
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
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D9D5D]" />
            <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
              Regulatory & Certification Context
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FDF2EE] dark:bg-[#3E1A14]/40 border border-[#FBE0D6] dark:border-[#52251D] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#9E3A20] dark:text-[#FECACA] uppercase tracking-wider">
                  Mandatory QCO Coverage
                </span>
              </div>
              <p className="text-xs text-[#9E3A20]/90 dark:text-[#FECACA]/90 leading-relaxed">
                This standard is notified under the <strong>{standard.qco_order_name || 'Quality Control Order'}</strong>. Commercial production, import, and distribution requires a valid BIS License and ISI marking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#113624]/40 border border-[#D9DDD8] dark:border-[#1E5438] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0D3328] dark:text-[#A7F3D0] uppercase tracking-wider">
                  Conformity Assessment Pathway
                </span>
              </div>
              <p className="text-xs text-[#0D3328]/90 dark:text-[#A7F3D0]/90 leading-relaxed">
                Requires factory audit, in-house quality testing machinery, routine testing logs, and third-party sample testing at a recognized BIS laboratory.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#8B978F] italic">
            Note: BISaarthi provides guidance and does not determine statutory compliance. Always consult official DPIIT and BIS gazette releases for legal enforcement timelines.
          </p>
        </div>

        {/* Related Standards Preview */}
        {standard.related_standards_preview && standard.related_standards_preview.length > 0 && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Related Indian Standards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {standard.related_standards_preview.map((rel, idx) => (
                <Link
                  key={idx}
                  href={`/standards/${encodeURIComponent(rel.is_number)}`}
                  className="p-4 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 hover:border-[#5B8272] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] group-hover:underline">
                      {rel.is_number}
                    </p>
                    <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] truncate mt-0.5">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] mt-0.5">
                      {rel.relation_note}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8B978F] group-hover:text-[#0D3328] shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Compliance Tools Section */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs">
          <RelatedToolsNav isNumber={standard.is_number} />
        </div>

        {/* Authoritative Sources Section */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5B8272]" />
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Authoritative Sources & Citations
            </h2>
          </div>

          <div className="space-y-3">
            {standard.source_refs.map((src, idx) => (
              <div
                key={src.source_id || idx}
                className="p-4 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
                      {src.title}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        src.reliability_tier === 'primary'
                          ? 'bg-[#E8F4EC] dark:bg-[#113624] text-[#1B5E39] dark:text-[#A7F3D0] border border-[#C2E4CD]'
                          : 'bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#A7B8AE] border border-[#D9DDD8]'
                      }`}
                    >
                      {src.reliability_tier === 'primary' ? 'Primary BIS' : 'Government Gazette'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                    Source Type: <span className="font-mono text-[#18211D] dark:text-[#F7F5EF]">{src.source_type}</span>
                  </p>
                </div>

                <div className="text-[11px] text-[#8B978F] shrink-0">
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
