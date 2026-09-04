'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { Button } from '@/components/common/Button';
import { getTestsCertificationDataBySlug } from '@/data/mockComplianceData';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeft,
  ChevronRight,
  FlaskConical,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  FileText,
  Info,
  ClipboardList,
} from 'lucide-react';

interface TestsCertificationPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function TestsCertificationPage({ params }: TestsCertificationPageProps) {
  const { isNumber } = use(params);
  const { t } = useLanguage();
  const data = getTestsCertificationDataBySlug(isNumber);
  const encodedStandard = encodeURIComponent(data.is_number);

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
            <span className="text-[11px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-1 rounded-full border border-[#D9DDD8] dark:border-[#253831] flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-[#5B8272]" />
              <span>Compliance Guidance View</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-3 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831]">
                  Compliance Roadmap
                </span>
                <StatusBadge status={data.status} />
                {data.relevance && <RelevanceBadge relevance={data.relevance} />}
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-bold text-[#8B978F]">
                  {data.is_number}
                </p>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0D3328] dark:text-[#8FA89B] tracking-tight leading-tight">
                Tests & Certification
              </h1>

              <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed font-normal">
                Understand the typical testing and conformity-assessment pathway associated with this standard.
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
              <span className="font-bold text-[#18211D] dark:text-[#F7F5EF]">Authoritative Citation:</span>
              <SourceReferenceTag sources={data.source_refs} />
            </div>
            <span className="text-[11px] text-[#8B978F]">
              Regulatory scope updated: August 2026
            </span>
          </div>
        </div>

        {/* 1. CERTIFICATION OVERVIEW ("At a glance") */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5B8272]" />
              <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                Certification Overview (At a Glance)
              </h2>
            </div>
            <span className="text-[10px] text-[#8B978F] bg-[#FAF9F5] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full font-mono border border-[#D9DDD8] dark:border-[#253831]">
              High-Level Guidance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Conformity Scheme
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#0D3328] dark:text-[#8FA89B]">
                {data.overview.scheme_name}
              </p>
              <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                Scheme-I (Product Certification / ISI Mark)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Statutory Mandate (QCO)
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#9E3A20] dark:text-[#FECACA] uppercase">
                {data.overview.mandate_status} Under QCO
              </p>
              <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] truncate">
                {data.overview.qco_order_name || 'Applicable Quality Control Order'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Product Category
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                {data.overview.product_category}
              </p>
              <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                Household & Commercial Appliances
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1 sm:col-span-2 lg:col-span-2">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Certification Relevance
              </p>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                {data.overview.certification_relevance}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26]/60 border border-[#EFECE6] dark:border-[#253831] space-y-1 sm:col-span-2 lg:col-span-1">
              <p className="text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                Testing Relevance
              </p>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                {data.overview.testing_relevance}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#1B2B26]/60 border border-[#D9DDD8] dark:border-[#253831] flex items-start gap-2.5 text-xs text-[#18211D] dark:text-[#BAC5BF]">
            <Info className="w-4 h-4 text-[#0D3328] dark:text-[#8FA89B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#18211D] dark:text-[#F7F5EF]">Engineering Note:</strong> {data.overview.guidance_note}
            </p>
          </div>
        </div>

        {/* 2. TESTING REQUIREMENTS */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#5B8272]" />
                <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Testing Requirements by Category
                </h2>
              </div>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] mt-1">
                Typical test batteries prescribed for conformity verification under this standard
              </p>
            </div>
            <span className="text-[11px] text-[#8C6126] dark:text-[#FDE68A] bg-[#FAF4EB] dark:bg-[#38240D] px-3 py-1 rounded-full border border-[#F2E4CD] dark:border-[#523A1B] font-bold self-start sm:self-auto">
              Qualitative overview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.testing_categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5]/60 dark:bg-[#1B2B26]/40 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#EFECE6] dark:border-[#253831] pb-2.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                      {cat.category}
                    </h3>
                    <p className="text-[11px] text-[#606E66] dark:text-[#BAC5BF] mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                  {cat.badge_label && (
                    <span className="text-[10px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] shrink-0">
                      {cat.badge_label}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {cat.points.map((pt, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B8272] shrink-0" />
                          <span>{pt.title}</span>
                        </p>
                        {pt.requires_verification && (
                          <span className="text-[10px] font-semibold text-[#8C6126] dark:text-[#FDE68A] bg-[#FAF4EB] dark:bg-[#38240D] px-2 py-0.5 rounded-full border border-[#F2E4CD] dark:border-[#523A1B] shrink-0">
                            Requires clause-level verification
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

          <UncertaintyNotice message="Specific numerical limits, test voltages, durations, tolerances, and clause numbers must be extracted and verified directly from the authoritative text of the standard before laboratory testing or quality control commissioning." />
        </div>

        {/* 3. TESTING WORKFLOW */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#5B8272]" />
              <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Testing Workflow (Guidance Sequence)
              </h2>
            </div>
            <span className="text-[10px] text-[#8B978F] bg-[#FAF9F5] dark:bg-[#1B2B26] px-2.5 py-0.5 rounded-full font-mono border border-[#D9DDD8] dark:border-[#253831]">
              Generalized Flow
            </span>
          </div>

          <p className="text-xs text-[#606E66] dark:text-[#BAC5BF]">
            A generalized sequence from product specification through statutory licensing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.workflow_steps.map((st, idx) => (
              <div
                key={st.step_number}
                className="relative p-5 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5]/60 dark:bg-[#1B2B26]/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#0D3328] text-white text-xs font-bold flex items-center justify-center font-mono">
                      {st.step_number}
                    </span>
                    {idx < data.workflow_steps.length - 1 && (
                      <span className="hidden lg:inline-flex text-[#8B978F] font-bold text-xs">
                        Step {st.step_number} of 6
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] mt-1 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EFECE6] dark:border-[#253831] flex items-center justify-between text-[11px] text-[#8B978F]">
                  <span>Phase {st.step_number}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B978F]" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#8B978F] italic">
            Note: This workflow is provided as generalized technical guidance. Precise sequences may vary based on whether testing is conducted under Scheme-I, Scheme-II, or specialized laboratory testing frameworks.
          </p>
        </div>

        {/* 4. CONFORMITY ASSESSMENT PATHWAY */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D9D5D]" />
              <h2 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                Conformity Assessment Pathway
              </h2>
            </div>
            <span className="text-[11px] text-[#1B5E39] dark:text-[#A7F3D0] bg-[#E8F4EC] dark:bg-[#113624] px-2.5 py-0.5 rounded-full border border-[#C2E4CD] font-bold">
              BIS Scheme-I Lifecycle
            </span>
          </div>

          <div className="space-y-4">
            {data.conformity_pathway_steps.map((pathStep) => (
              <div
                key={pathStep.step_number}
                className="p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5]/60 dark:bg-[#1B2B26]/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] text-[#0D3328] dark:text-[#A7B8AE] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      0{pathStep.step_number}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
                        {pathStep.title}
                      </h3>
                      <p className="text-[11px] text-[#5B8272] dark:text-[#8FA89B] font-bold">
                        {pathStep.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] pl-11 leading-relaxed">
                  {pathStep.description}
                </p>

                <div className="pl-11 space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
                    Key Execution Actions:
                  </p>
                  <ul className="space-y-1 text-xs text-[#606E66] dark:text-[#BAC5BF]">
                    {pathStep.key_actions.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D9D5D] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF4EB] dark:bg-[#38240D]/40 border border-[#F2E4CD] dark:border-[#523A1B] text-xs text-[#8C6126] dark:text-[#FDE68A] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#8C6126] shrink-0" />
              <span>Important Certification Disclaimer</span>
            </p>
            <p className="leading-relaxed">
              BISaarthi is an AI compliance guidance tool. BISaarthi does not grant, process, or verify official BIS licenses, nor does it conduct physical laboratory testing. All applications for certification must be lodged through official Bureau of Indian Standards channels (Manakonline portal).
            </p>
          </div>
        </div>

        {/* 5. IMPORTANT NOTICE */}
        <UncertaintyNotice message="Testing requirements and conformity-assessment procedures may vary by product scope, applicable Quality Control Orders, and the current BIS scheme. Verify the latest official requirements before proceeding." />

        {/* 6. RELATED NAVIGATION & TOOLS */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Related Compliance Navigation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nav Card 1: Standard Details */}
            <Link
              href={`/standards/${encodedStandard}`}
              className="group p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] hover:border-[#5B8272] hover:shadow-xs transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] transition-colors">
                    Standard Details Overview
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] line-clamp-2 mt-0.5 leading-relaxed">
                    Review {data.is_number} full metadata, clause categories, scope limitations, and statutory context.
                  </p>
                </div>
              </div>

              <div className="p-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#8B978F] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Nav Card 2: Recognized Laboratories */}
            <Link
              href={`/standards/${encodedStandard}/laboratories`}
              className="group p-5 rounded-3xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] hover:border-[#5B8272] hover:shadow-xs transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] transition-colors">
                    Recognized Laboratories Directory
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] line-clamp-2 mt-0.5 leading-relaxed">
                    Explore mock directory of BIS central labs, regional test stations, and NABL-accredited facilities.
                  </p>
                </div>
              </div>

              <div className="p-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#8B978F] group-hover:text-[#0D3328] dark:group-hover:text-[#8FA89B] group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Authoritative Sources Section */}
        <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5B8272]" />
            <h2 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
              Authoritative Sources & Statutory Citations
            </h2>
          </div>

          <div className="space-y-3">
            {data.source_refs.map((src, idx) => (
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
                    Source Reference: <span className="font-mono text-[#18211D] dark:text-[#F7F5EF]">{src.source_type}</span>
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
