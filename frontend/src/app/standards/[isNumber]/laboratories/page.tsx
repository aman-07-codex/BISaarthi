'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { getStandardDetails, getOfficialStandardDetails, APIError } from '@/lib/api';
import { StandardDetailsResponse, OfficialStandardDetailDocument } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Info,
  MapPin,
} from 'lucide-react';

interface LaboratoriesPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function RecognizedLaboratoriesPage({ params }: LaboratoriesPageProps) {
  const { isNumber } = use(params);
  const { t } = useLanguage();
  const [standard, setStandard] = useState<StandardDetailsResponse | null>(null);
  const [officialDoc, setOfficialDoc] = useState<OfficialStandardDetailDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const decoded = decodeURIComponent(isNumber);

    async function fetchData() {
      setLoading(true);
      setError(null);
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

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isNumber]);

  const encodedStandard = encodeURIComponent(decodeURIComponent(isNumber));

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#5B8272] animate-spin" />
          <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
            Retrieving recognized laboratory directory...
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

  const labSection = officialDoc?.sections?.laboratories;
  const labItems = (labSection?.items || []) as Record<string, string>[];
  const hasLabs = labSection?.data_status === 'verified' && labItems.length > 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Breadcrumb & Navigation */}
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
            <Link
              href={`/standards/${encodedStandard}`}
              className="text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white font-medium truncate max-w-[140px] sm:max-w-none"
            >
              {t('cat.standards', 'Standard Details')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B978F]" />
            <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
              {t('std.labsTab', 'Recognized Laboratories')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasLabs ? (
              <span className="text-[11px] font-bold text-[#137333] dark:text-[#81C995] bg-[#E8F4EC] dark:bg-[#113624] px-3 py-1 rounded-full border border-[#CEEAD6] dark:border-[#1E5438] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Official BIS Data Available</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[#8C6126] dark:text-[#FDE68A] bg-[#FAF4EB] dark:bg-[#38240D] px-3 py-1 rounded-full border border-[#F2E4CD] dark:border-[#523A1B] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>LIMS Portal Directory</span>
              </span>
            )}
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                  Conformity Assessment Network
                </span>
                <StatusBadge status={isPublished ? 'active' : 'unknown'} />
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-bold text-[#8B978F]">
                  {standard.is_number}
                </p>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                Recognized Testing Laboratories
              </h1>

              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
                Accredited testing network, OSL/BIS codes, and third-party laboratory directory for {standard.is_number}.
              </p>
            </div>

            {/* Quick Action to return to Standard Details */}
            <div className="shrink-0">
              <Link href={`/standards/${encodedStandard}`}>
                <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="font-bold text-xs">
                  Back to Standard Details
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFECE6] dark:border-[#1C2E28] flex flex-wrap items-center justify-between gap-3 text-xs text-[#606E66] dark:text-[#BAC5BF]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">Standard Reference:</span>
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

        {/* 1. RECOGNIZED LABORATORIES DIRECTORY */}
        {hasLabs ? (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#5B8272]" />
                <h2 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Accredited Testing Facilities ({labItems.length} Identified)
                </h2>
              </div>
              <span className="text-xs font-mono text-[#5B8272]">
                Official BIS Review Service
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labItems.map((lab, idx) => {
                const labName = lab.lab_name || lab.labName || `Testing Laboratory ${idx + 1}`;
                const location = [lab.district, lab.state, lab.pincode].filter(Boolean).join(', ') || lab.address || 'India';
                const bisCode = lab.bis_code || lab.bisCode;
                const oslCode = lab.osl_code || lab.oslCode;

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] leading-snug">
                          {labName}
                        </h3>
                        {lab.lab_type && (
                          <span className="text-[10px] bg-white dark:bg-[#15221E] text-[#0D3328] dark:text-[#8FA89B] font-semibold px-2 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] shrink-0">
                            {lab.lab_type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] flex items-center gap-1.5 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5B8272] shrink-0" />
                        <span>{location}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#EFECE6] dark:border-[#253831] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8B978F]">
                      <div className="flex items-center gap-2">
                        {bisCode && (
                          <span className="font-mono bg-white dark:bg-[#15221E] px-1.5 py-0.5 rounded border border-[#D9DDD8] dark:border-[#253831]">
                            BIS: {bisCode}
                          </span>
                        )}
                        {oslCode && (
                          <span className="font-mono bg-white dark:bg-[#15221E] px-1.5 py-0.5 rounded border border-[#D9DDD8] dark:border-[#253831]">
                            OSL: {oslCode}
                          </span>
                        )}
                      </div>
                      {lab.contact_person && (
                        <span className="truncate max-w-[140px]">{lab.contact_person}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] dark:bg-[#38240D] border border-[#F2E4CD] dark:border-[#523A1B] flex items-center justify-center text-[#8C6126] dark:text-[#FDE68A] shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Laboratory Directory Scope
                </h2>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  No separate testing laboratory records were returned by the available official BIS service for this standard. Please consult the BIS Manakonline LIMS portal for regional laboratory allocations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. OFFICIAL AUTHORITATIVE LIMS PORTAL LINK */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#5B8272]" />
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Authoritative BIS Laboratory Portals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <a
              href="https://www.manakonline.in"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#D9DDD8] dark:border-[#253831] hover:border-[#5B8272] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] group-hover:underline flex items-center gap-1.5">
                  <span>BIS Manakonline LIMS Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </h3>
                <span className="text-[10px] font-mono text-[#8B978F]">Official</span>
              </div>
              <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                Search real-time recognized laboratory directory by Indian Standard number, test scope, and geographical region.
              </p>
            </a>

            <a
              href="https://standards.bis.gov.in"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#D9DDD8] dark:border-[#253831] hover:border-[#5B8272] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] group-hover:underline flex items-center gap-1.5">
                  <span>BIS Standards Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </h3>
                <span className="text-[10px] font-mono text-[#8B978F]">Official</span>
              </div>
              <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                Access official published standard details, technical committee contacts, and regulatory gazette orders.
              </p>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
