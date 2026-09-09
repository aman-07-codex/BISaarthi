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
  FlaskConical,
  AlertCircle,
  Info,
  Loader2,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Award,
} from 'lucide-react';

interface TestsCertificationPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function TestsCertificationPage({ params }: TestsCertificationPageProps) {
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
            Retrieving authoritative testing & certification records...
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
  const licSection = officialDoc?.sections?.licenses;
  const amdSection = officialDoc?.sections?.amendments;
  const gazSection = officialDoc?.sections?.gazette;
  const pmSection = officialDoc?.sections?.product_manual;

  const hasOfficialData =
    (labSection && labSection.data_status === 'verified' && labSection.item_count > 0) ||
    (licSection && licSection.data_status === 'verified' && licSection.item_count > 0) ||
    (amdSection && amdSection.data_status === 'verified' && amdSection.item_count > 0);

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
              {t('std.testsTab', 'Tests & Certification')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasOfficialData ? (
              <span className="text-[11px] font-bold text-[#137333] dark:text-[#81C995] bg-[#E8F4EC] dark:bg-[#113624] px-3 py-1 rounded-full border border-[#CEEAD6] dark:border-[#1E5438] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Official BIS Data Available</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[#8C6126] dark:text-[#FDE68A] bg-[#FAF4EB] dark:bg-[#38240D] px-3 py-1 rounded-full border border-[#F2E4CD] dark:border-[#523A1B] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Structured BIS Overview</span>
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
                  Compliance & Conformance
                </span>
                <StatusBadge status={isPublished ? 'active' : 'unknown'} />
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-bold text-[#8B978F]">
                  {standard.is_number}
                </p>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                Testing & Certification Information
              </h1>

              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
                Recognized testing laboratories, manufacturer licensing under Scheme-I (ISI Mark), product manuals, and official amendments for {standard.is_number}.
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

        {/* 1. RECOGNIZED TESTING LABORATORIES (Verified Official Data) */}
        {labSection && labSection.data_status === 'verified' && labSection.item_count > 0 ? (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#5B8272]" />
                <h2 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Recognized Testing Laboratories ({labSection.item_count})
                </h2>
              </div>
              <Link
                href={`/standards/${encodedStandard}/laboratories`}
                className="text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:underline inline-flex items-center gap-1"
              >
                <span>View All Laboratories</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
              Official testing laboratories registered with BIS for conformity assessment of {standard.is_number}:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(labSection.items as Record<string, string>[]).slice(0, 4).map((lab, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-1.5"
                >
                  <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] leading-snug">
                    {lab.lab_name || lab.labName || 'Recognized Testing Laboratory'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                    <span>{lab.district ? `${lab.district}, ${lab.state}` : lab.state || 'India'}</span>
                    {lab.bis_code && <span className="font-mono text-[10px] bg-white dark:bg-[#15221E] px-1.5 py-0.5 rounded border border-[#D9DDD8] dark:border-[#253831]">BIS: {lab.bis_code}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#5B8272]" />
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                Recognized Testing Laboratories
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] text-xs text-[#606E66] dark:text-[#BAC5BF] space-y-1">
              <p className="font-semibold text-[#18211D] dark:text-[#F7F5EF]">
                Status: <span className="text-[#8C6126] dark:text-[#FDE68A]">No separate records returned by the available official BIS service</span>
              </p>
              <p>
                Laboratory accreditation directory for this standard is accessible via the official BIS Manakonline LIMS portal.
              </p>
            </div>
          </div>
        )}

        {/* 2. ACTIVE MANUFACTURER LICENSEES (Scheme-I ISI Mark) */}
        {licSection && licSection.data_status === 'verified' && licSection.item_count > 0 ? (
          <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#5B8272]" />
              <h2 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Active Manufacturer Licensees Sample ({licSection.item_count} total)
              </h2>
            </div>

            <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
              Manufacturers holding operative BIS licenses for {standard.is_number} under Scheme-I Product Certification (ISI Mark):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(licSection.items as Record<string, string>[]).slice(0, 4).map((lic, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-1"
                >
                  <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] leading-snug">
                    {lic.firm_name || lic.firmName || 'Licensed Manufacturer'}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#606E66] dark:text-[#BAC5BF] pt-1">
                    <span className="font-mono text-[10px] text-[#0D3328] dark:text-[#8FA89B]">Lic: {lic.license_no || lic.licenseNo || 'N/A'}</span>
                    <span>{lic.district ? `${lic.district}, ${lic.state}` : lic.state || 'India'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* 3. BIS PRODUCT MANUAL & STATUTORY GAZETTE NOTIFICATIONS */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#5B8272]" />
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Product Manual & Gazette Orders
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-2">
              <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                BIS Product Manual
              </p>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
                {pmSection && pmSection.data_status === 'verified' && pmSection.item_count > 0
                  ? 'Official BIS Product Manual is available detailing Scheme of Inspection & Testing (SIT) and sampling guidelines.'
                  : 'Product Manual reference is maintained on the BIS Manakonline portal.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] space-y-2">
              <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Published Amendments & Gazette Orders
              </p>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
                {amdSection?.item_count || 0} formal amendment(s) and {gazSection?.item_count || 0} statutory Gazette order(s) registered in the official repository.
              </p>
            </div>
          </div>
        </div>

        {/* 4. TECHNICAL CLAUSE LIMITATION NOTICE */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B]" />
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Technical Test Matrix Scope
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/50 border border-[#EFECE6] dark:border-[#253831] text-xs text-[#606E66] dark:text-[#BAC5BF] space-y-1.5">
            <p className="font-semibold text-[#18211D] dark:text-[#F7F5EF]">
              Document Text Status: <span className="text-[#0D3328] dark:text-[#8FA89B]">Structured official BIS information is available</span>
            </p>
            <p className="leading-relaxed">
              Structured official BIS information is available from verified portal microservices. Full clause-level standard text, specific numerical test limits, and routine factory inspection tables are not currently included in the BISaarthi verified corpus.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
