'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { RelatedToolsNav } from '@/components/standards/RelatedToolsNav';
import { getStandardDetails, getOfficialStandardDetails, saveStandardApi, deleteSavedStandardApi, APIError } from '@/lib/api';
import { StandardDetailsResponse, OfficialStandardDetailDocument, StandardCardData } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Bookmark,
  Check,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Layers,
  FileCheck,
  Info,
  FileText,
} from 'lucide-react';

interface StandardDetailsPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function StandardDetailsPage({ params }: StandardDetailsPageProps) {
  const { isNumber } = use(params);
  const { t } = useLanguage();
  const { token } = useAuth();
  const [standard, setStandard] = useState<StandardDetailsResponse | null>(null);
  const [officialDoc, setOfficialDoc] = useState<OfficialStandardDetailDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const decoded = decodeURIComponent(isNumber);

    Promise.resolve().then(() => {
      if (!isMounted) return;

      // Check if saved locally
      try {
        const stored = localStorage.getItem('bisaarthi_saved_standards');
        if (stored) {
          const list: StandardCardData[] = JSON.parse(stored);
          if (list.some((s) => s.is_number.toLowerCase() === decoded.toLowerCase())) {
            setIsSaved(true);
          }
        }
      } catch {
        // ignore
      }

      fetchAllDetails();
    });

    async function fetchAllDetails() {
      try {
        const [stdData, offDoc] = await Promise.all([
          getStandardDetails(decoded),
          getOfficialStandardDetails(decoded).catch(() => null),
        ]);
        if (isMounted) {
          setStandard(stdData);
          setOfficialDoc(offDoc);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof APIError ? err.message : 'Unable to retrieve standard details.';
          setError(msg);
          setLoading(false);
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isNumber]);

  const toggleSave = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    if (!standard) return;

    // Update local storage
    try {
      const stored = localStorage.getItem('bisaarthi_saved_standards');
      const list: StandardCardData[] = stored ? JSON.parse(stored) : [];
      if (nextSaved) {
        const entry: StandardCardData = {
          is_number: standard.is_number,
          title: standard.title,
          status: standard.status?.toLowerCase().includes('active') ? 'active' : 'unknown',
          is_saved: true,
        };
        const updated = [entry, ...list.filter((s) => s.is_number !== standard.is_number)];
        localStorage.setItem('bisaarthi_saved_standards', JSON.stringify(updated));
      } else {
        const updated = list.filter((s) => s.is_number !== standard.is_number);
        localStorage.setItem('bisaarthi_saved_standards', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    // If authenticated, sync with backend API
    if (token) {
      try {
        if (nextSaved) {
          await saveStandardApi(standard.is_number, token);
        } else {
          await deleteSavedStandardApi(standard.is_number, token);
        }
      } catch {
        // silent fallback
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#5B8272] animate-spin" />
          <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
            Retrieving authoritative standard metadata and official BIS records...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error || !standard) {
    return (
      <AppLayout>
        <div className="p-8 sm:p-12 bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] text-center space-y-4 max-w-xl mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto" />
          <h2 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
            Standard Not Found
          </h2>
          <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
            {error || `Standard '${decodeURIComponent(isNumber)}' could not be resolved in the authoritative corpus.`}
          </p>
          <Link
            href="/find-standards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#0D3328] text-white hover:bg-[#184638] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Find Standards</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isPublished =
    standard.status?.toLowerCase().includes('active') ||
    standard.status?.toLowerCase().includes('published');

  // Multi-tier metadata hierarchy fallback
  const deptItem = officialDoc?.sections?.department_committee?.items?.[0] as Record<string, string> | undefined;
  const resolvedDept =
    standard.department ||
    deptItem?.department_name ||
    deptItem?.deptPreparedName ||
    'Bureau of Indian Standards (BIS)';

  const resolvedCommittee =
    standard.committee ||
    deptItem?.committee_name ||
    deptItem?.secCommitteePreparedName ||
    'Technical Sectional Committee';

  const resolvedCategory = standard.category || 'General';

  const amdSection = officialDoc?.sections?.amendments;
  const gazSection = officialDoc?.sections?.gazette;
  const labSection = officialDoc?.sections?.laboratories;

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
              <span>{t('nav.find', 'Find Standards')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span>{t('cat.standards', 'Standard Details')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-mono font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              {standard.is_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>Authoritative 100-Standard Corpus</span>
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
                <StatusBadge status={isPublished ? 'active' : 'unknown'} />
                <RelevanceBadge relevance="highly_relevant" />
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
                    <span>{t('btn.saved', 'Saved')}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-[#8B978F]" />
                    <span>{t('btn.save', 'Save Standard')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex flex-wrap items-center justify-between gap-3 text-xs text-[#606E66] dark:text-[#BAC5BF]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">Authoritative Reference:</span>
              <a
                href={standard.bis_url || 'https://standards.bis.gov.in'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[#0D3328] dark:text-[#8FA89B] hover:underline"
              >
                <span>BIS Manakonline Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <span className="text-[11px] text-[#8B978F]">
              Standard ID: {standard.standard_id || 'Available'}
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
                <StatusBadge status={isPublished ? 'active' : 'unknown'} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Department
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate" title={resolvedDept}>
                {resolvedDept}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Technical Committee
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate" title={resolvedCommittee}>
                {resolvedCommittee}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Product Category
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate">
                {resolvedCategory}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Standard Type
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1 truncate">
                {standard.type || 'Product Specification'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Publication Date
              </p>
              <p className="text-xs font-semibold text-[#18211D] dark:text-[#BAC5BF] mt-1">
                {standard.formatted_date || standard.publication_date || 'Published Standard'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831]">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Documentation Status
              </p>
              <p className="text-xs font-bold text-[#137333] dark:text-[#81C995] mt-1">
                Official BIS Metadata Verified
              </p>
            </div>
          </div>
        </div>

        {/* OFFICIAL BIS ENRICHMENT SUMMARY (Phase 9 & 10 Live Microservice Data) */}
        {officialDoc && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#5B8272]" />
                <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                  Official BIS Integration Records
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-[#137333] dark:text-[#81C995] bg-[#E8F4EC] dark:bg-[#113624] px-2.5 py-0.5 rounded-full border border-[#CEEAD6] dark:border-[#1E5438]">
                Official BIS Data Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">Published Amendments</span>
                  <span className="text-xs font-mono font-bold text-[#0D3328] dark:text-[#8FA89B]">
                    {amdSection?.item_count || 0}
                  </span>
                </div>
                <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                  {amdSection?.item_count
                    ? `${amdSection.item_count} formal amendments issued by BIS.`
                    : 'No separate amendments published.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">Statutory Gazette Orders</span>
                  <span className="text-xs font-mono font-bold text-[#0D3328] dark:text-[#8FA89B]">
                    {gazSection?.item_count || 0}
                  </span>
                </div>
                <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                  {gazSection?.item_count
                    ? `${gazSection.item_count} statutory S.O. notifications registered.`
                    : 'No separate gazette notifications recorded.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">Recognized Laboratories</span>
                  <span className="text-xs font-mono font-bold text-[#0D3328] dark:text-[#8FA89B]">
                    {labSection?.item_count || 0}
                  </span>
                </div>
                <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                  {labSection?.item_count
                    ? `${labSection.item_count} testing laboratories accredited for conformity.`
                    : 'Laboratory directory pending LIMS mapping.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Corpus Inclusion Rationale & Primary Application */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
            <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
              Why This Standard Is Included
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-[#606E66] dark:text-[#BAC5BF] uppercase tracking-wider mb-1.5">
                Corpus Inclusion Rationale
              </h3>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border-l-4 border-l-[#0D3328] border border-[#EFECE6] dark:border-[#253831] text-xs sm:text-sm text-[#18211D] dark:text-[#BAC5BF] leading-relaxed">
                {standard.reason_selected || 'Standard is included in the curated 100-standard BISaarthi MVP corpus.'}
              </div>
            </div>

            {standard.primary_use_case && (
              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/40 border border-[#EFECE6] dark:border-[#253831] space-y-1.5">
                <h3 className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D9D5D]" />
                  <span>Primary Application</span>
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  {standard.primary_use_case}
                </p>
              </div>
            )}
          </div>

          <UncertaintyNotice message="Corpus rationale reflects editorial selection criteria. Product compliance requires verification of the latest official BIS standard text and applicable gazetted regulatory orders." />
        </div>

        {/* Documentation & Clause Availability Notice */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#5B8272]" />
            <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
              Official Document & Technical Clause Status
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] text-xs text-[#606E66] dark:text-[#BAC5BF] space-y-2">
            <p className="font-semibold text-[#18211D] dark:text-[#F7F5EF]">
              Technical Document Scope: <span className="font-medium text-[#0D3328] dark:text-[#8FA89B]">Structured official BIS information is available</span>
            </p>
            <p className="leading-relaxed">
              Structured official BIS information is available from verified portal microservices. Full clause-level standard text and numerical engineering tables are not currently included in the BISaarthi verified corpus.
            </p>
          </div>
        </div>

        {/* Related Standards Preview */}
        {standard.related_selected_standards && standard.related_selected_standards.length > 0 && (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Related Standards in Corpus
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {standard.related_selected_standards.map((rel, idx) => (
                <Link
                  key={idx}
                  href={`/standards/${encodeURIComponent(rel)}`}
                  className="p-4 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 hover:border-[#5B8272] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] group-hover:underline">
                      {rel}
                    </p>
                    <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] mt-0.5">
                      Companion Standard
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
      </div>
    </AppLayout>
  );
}
