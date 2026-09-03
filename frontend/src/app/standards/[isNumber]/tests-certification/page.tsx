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
import {
  ArrowLeft,
  ChevronRight,
  FlaskConical,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Layers,
  ArrowRight,
  FileText,
  Info,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface TestsCertificationPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function TestsCertificationPage({ params }: TestsCertificationPageProps) {
  const { isNumber } = use(params);
  const data = getTestsCertificationDataBySlug(isNumber);
  const encodedStandard = encodeURIComponent(data.is_number);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Breadcrumb & Navigation */}
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
            <Link
              href={`/standards/${encodedStandard}`}
              className="text-slate-600 dark:text-slate-300 hover:text-[#1E3A8A] dark:hover:text-blue-400 font-medium truncate max-w-[140px] sm:max-w-none"
            >
              Standard Details
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              Tests & Certification
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Compliance Guidance View</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  Compliance Roadmap
                </span>
                <StatusBadge status={data.status} />
                {data.relevance && <RelevanceBadge relevance={data.relevance} />}
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {data.is_number}
                </p>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-blue-400 tracking-tight leading-tight">
                Tests & Certification
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Understand the typical testing and conformity-assessment pathway associated with this standard.
              </p>
            </div>

            {/* Quick Action to return to Standard Details */}
            <div className="shrink-0">
              <Link href={`/standards/${encodedStandard}`}>
                <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Standard Details
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-700 dark:text-slate-300">Authoritative Citation:</span>
              <SourceReferenceTag sources={data.source_refs} />
            </div>
            <span className="text-[11px] text-slate-400">
              Regulatory scope updated: August 2026
            </span>
          </div>
        </div>

        {/* 1. CERTIFICATION OVERVIEW ("At a glance") */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Certification Overview (At a Glance)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              High-Level Guidance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Conformity Scheme
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#1E3A8A] dark:text-blue-300">
                {data.overview.scheme_name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scheme-I (Product Certification / ISI Mark)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Statutory Mandate (QCO)
              </p>
              <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 uppercase">
                {data.overview.mandate_status} Under QCO
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {data.overview.qco_order_name || 'Applicable Quality Control Order'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Product Category
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {data.overview.product_category}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Household & Commercial Appliances
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2 lg:col-span-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Certification Relevance
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.overview.certification_relevance}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2 lg:col-span-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Testing Relevance
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.overview.testing_relevance}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100">Engineering Note:</strong> {data.overview.guidance_note}
            </p>
          </div>
        </div>

        {/* 2. TESTING REQUIREMENTS */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Testing Requirements by Category
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Typical test batteries prescribed for conformity verification under this standard
              </p>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/80 font-medium self-start sm:self-auto">
              Qualitative overview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.testing_categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {cat.category}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                  {cat.badge_label && (
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 shrink-0">
                      {cat.badge_label}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {cat.points.map((pt, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>{pt.title}</span>
                        </p>
                        {pt.requires_verification && (
                          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/80 shrink-0">
                            Requires clause-level verification
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

          <UncertaintyNotice message="Specific numerical limits, test voltages, durations, tolerances, and clause numbers must be extracted and verified directly from the authoritative text of the standard before laboratory testing or quality control commissioning." />
        </div>

        {/* 3. TESTING WORKFLOW */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Testing Workflow (Guidance Sequence)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              Generalized Flow
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            A generalized sequence from product specification through statutory licensing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.workflow_steps.map((st, idx) => (
              <div
                key={st.step_number}
                className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center font-mono">
                      {st.step_number}
                    </span>
                    {idx < data.workflow_steps.length - 1 && (
                      <span className="hidden lg:inline-flex text-slate-300 dark:text-slate-600 font-bold text-xs">
                        Step {st.step_number} of 6
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Phase {st.step_number}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Note: This workflow is provided as generalized technical guidance. Precise sequences may vary based on whether testing is conducted under Scheme-I, Scheme-II, or specialized laboratory testing frameworks.
          </p>
        </div>

        {/* 4. CONFORMITY ASSESSMENT PATHWAY */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Conformity Assessment Pathway
              </h2>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
              BIS Scheme-I Lifecycle
            </span>
          </div>

          <div className="space-y-4">
            {data.conformity_pathway_steps.map((pathStep) => (
              <div
                key={pathStep.step_number}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-[#1E3A8A] dark:text-blue-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      0{pathStep.step_number}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {pathStep.title}
                      </h3>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        {pathStep.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 pl-10 leading-relaxed">
                  {pathStep.description}
                </p>

                <div className="pl-10 space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Key Execution Actions:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {pathStep.key_actions.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
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
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Related Compliance Navigation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nav Card 1: Standard Details */}
            <Link
              href={`/standards/${encodedStandard}`}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                    Standard Details Overview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    Review {data.is_number} full metadata, clause categories, scope limitations, and statutory context.
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Nav Card 2: Recognized Laboratories */}
            <Link
              href={`/standards/${encodedStandard}/laboratories`}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                    Recognized Laboratories Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    Explore mock directory of BIS central labs, regional test stations, and NABL-accredited facilities.
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Authoritative Sources Section */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Authoritative Sources & Statutory Citations
            </h2>
          </div>

          <div className="space-y-3">
            {data.source_refs.map((src, idx) => (
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
                    Source Reference: <span className="font-mono text-slate-600 dark:text-slate-300">{src.source_type}</span>
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
