'use client';

import React, { useState, use, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RelevanceBadge } from '@/components/common/RelevanceBadge';
import { SourceReferenceTag } from '@/components/common/SourceReferenceTag';
import { UncertaintyNotice } from '@/components/common/UncertaintyNotice';
import { Button } from '@/components/common/Button';
import { getLaboratoriesDataBySlug } from '@/data/mockComplianceData';
import { LaboratoryItem } from '@/types';
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  FlaskConical,
  ShieldCheck,
  Search,
  MapPin,
  Filter,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  FileText,
  Clock,
  Check,
  Layers,
  Sparkles,
  AlertTriangle,
  BadgeAlert,
} from 'lucide-react';

interface LaboratoriesPageProps {
  params: Promise<{
    isNumber: string;
  }>;
}

export default function RecognizedLaboratoriesPage({ params }: LaboratoriesPageProps) {
  const { isNumber } = use(params);
  const data = getLaboratoriesDataBySlug(isNumber);
  const encodedStandard = encodeURIComponent(data.is_number);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedLabForModal, setSelectedLabForModal] = useState<LaboratoryItem | null>(null);

  // Unique cities from data
  const cities = useMemo(() => {
    const unique = Array.from(new Set(data.laboratories.map((l) => l.city)));
    return ['all', ...unique];
  }, [data.laboratories]);

  // Filtered laboratories
  const filteredLaboratories = useMemo(() => {
    return data.laboratories.filter((lab) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.testing_capability.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'bis_central' && lab.lab_type === 'bis_central') ||
        (selectedType === 'nabl_accredited' && lab.lab_type === 'nabl_accredited') ||
        (selectedType === 'commercial' && lab.lab_type === 'commercial');

      const matchesCity = selectedCity === 'all' || lab.city === selectedCity;

      return matchesSearch && matchesType && matchesCity;
    });
  }, [data.laboratories, searchQuery, selectedType, selectedCity]);

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
              Recognized Laboratories
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Laboratory Discovery Directory</span>
            </span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  Testing Facilities
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
                Recognized Laboratories
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Explore laboratories that may be relevant for testing under the selected standard.
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
              Directory updated: August 2026
            </span>
          </div>
        </div>

        {/* Demo Data Clarification Banner */}
        <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
          <BadgeAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-100">Mock Laboratory Listings:</strong> The testing facilities listed below represent simulated directory entries for demonstration and navigation workflows. Current accreditation and exact clause-level testing capabilities must be confirmed via the authoritative BIS Laboratory Information Management System (LIMS).
          </p>
        </div>

        {/* 1. SEARCH / FILTER AREA */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Filter & Discover Laboratories
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredLaboratories.length} of {data.laboratories.length} facilities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lab name, capability, or location..."
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="all">All Laboratory Types</option>
                <option value="bis_central">Central BIS Laboratories</option>
                <option value="nabl_accredited">NABL Accredited Labs</option>
                <option value="commercial">Commercial / Private Labs</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="all">All Locations (India)</option>
                {cities
                  .filter((c) => c !== 'all')
                  .map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Quick filter:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCity('all');
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedType === 'all' && selectedCity === 'all' && searchQuery === ''
                  ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              All Facilities
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('bis_central')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedType === 'bis_central'
                  ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              BIS Central Labs
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('nabl_accredited')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedType === 'nabl_accredited'
                  ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              NABL Accredited
            </button>
          </div>
        </div>

        {/* 2. LABORATORY CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recognized Laboratory Directory (Mock Data)
            </h2>
            <span className="text-xs text-slate-400">
              {filteredLaboratories.length} match{filteredLaboratories.length === 1 ? '' : 'es'}
            </span>
          </div>

          {filteredLaboratories.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No laboratories match your filter criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search query or switching filters to view all mock laboratory listings.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCity('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLaboratories.map((lab) => (
                <div
                  key={lab.id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Lab Header & Tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              lab.lab_type === 'bis_central'
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {lab.type_label}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                            Example listing
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                          {lab.name}
                        </h3>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-[#1E3A8A] dark:text-blue-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Location Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">
                        {lab.city}, {lab.state}
                      </span>
                    </div>

                    {/* Testing Capability */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Testing Scope & Capability
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {lab.testing_capability}
                      </p>
                    </div>

                    {/* Relevant Standards */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Covered Standards
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {lab.applicable_standards.map((st, sIdx) => (
                          <span
                            key={sIdx}
                            className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Testing Equipment */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Facility Highlights (Mock Profile):
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {lab.facilities_overview.map((fac, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{fac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Accreditation & Lead Time */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {lab.accreditation_indicator}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lab.lead_time_guidance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLabForModal(lab)}
                      className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Sample Guidelines</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] text-slate-400">
                      Demo Profile
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mock Sample Modal / Drawer if user clicks */}
        {selectedLabForModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded">
                    Sample Submission Guidance
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedLabForModal.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLabForModal.city}, {selectedLabForModal.state}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLabForModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Standard Sample Checklist for {data.is_number}:
                </p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>3 sealed production samples with complete electrical markings</li>
                  <li>Original Bill of Materials (BOM) & sub-component datasheets</li>
                  <li>In-house routine test logs (High voltage, earthing, insulation)</li>
                  <li>BIS Scheme-I application acknowledgment number</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Laboratory selection and test sample dispatch for statutory ISI certification must follow official allocation through the BIS Manakonline portal.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedLabForModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. VERIFICATION NOTICE */}
        <UncertaintyNotice message="Laboratory recognition, scope, accreditation status, and testing capability can change. Verify current recognition and scope with the authoritative BIS source before submitting samples." />

        {/* 4. AUTHORITATIVE SOURCE */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Authoritative Laboratory Directory Citation
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
                    Source Citation: <span className="font-mono text-slate-600 dark:text-slate-300">{src.source_type}</span>
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0">
                  Last verified: {src.retrieved_at || 'August 2026'}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Note: For official sample routing under Scheme-I or CRS, refer exclusively to the National Laboratory Information Management System (LIMS) on the BIS portal.
          </p>
        </div>

        {/* 5. RELATED NAVIGATION & TOOLS */}
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
                    Review {data.is_number} full metadata, clause breakdown, and statutory applicability.
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Nav Card 2: Tests & Certification */}
            <Link
              href={`/standards/${encodedStandard}/tests-certification`}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                    Tests & Certification Roadmap
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    Examine required testing batteries, Scheme-I compliance workflows, and licensing milestones.
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
