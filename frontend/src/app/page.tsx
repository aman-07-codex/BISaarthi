'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  MessageSquare,
  Scale,
  CheckCircle2,
  Layers,
  FileText,
  Building2,
  FlaskConical,
  Compass,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. PUBLIC MARKETING HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-[#1E3A8A] flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                BISaarthi
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded">
                  MVP
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                AI-powered guidance for Indian Standards
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#features"
              className="hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#trust-sources"
              className="hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors"
            >
              Trust & Sources
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg animate-in fade-in duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                How It Works
              </a>
              <a
                href="#trust-sources"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Trust & Sources
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link href="/auth/login" className="w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full">
                <Button variant="primary" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-linear-to-b from-white via-slate-50/50 to-slate-100/30 dark:from-slate-900/60 dark:via-[#0B0F17] dark:to-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#1E3A8A] dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>AI-Powered Indian Standards Assistant</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Find the right Indian Standards <span className="text-[#1E3A8A] dark:text-blue-400">with confidence.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                BISaarthi helps industries, manufacturers, and MSMEs understand applicable Indian Standards, testing expectations, Quality Control Orders, and BIS certification pathways using source-backed intelligence.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link href="/auth/login">
                  <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                    Ask BISaarthi
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="secondary" size="lg" icon={<Search className="w-4 h-4" />}>
                    Explore Standards
                  </Button>
                </Link>
              </div>

              {/* Micro Trust Points */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Authoritative IS Indexing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>QCO & Scheme-I Roadmaps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Two-Standard Comparison</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Mock Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      Product Intelligence Summary
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    Standard Overview
                  </span>
                </div>

                {/* Standard Identity Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#1E3A8A] dark:text-blue-400">
                      IS 302 (Part 2/Sec 201)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Active Standard
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    Safety of Household and Similar Electrical Appliances — Particular Requirements: Electric Immersion Water Heaters
                  </h3>
                </div>

                {/* Applicable Callout */}
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-slate-900/60 border-l-3 border-l-[#2563EB] border-t border-r border-b border-blue-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-[#1E3A8A] dark:text-blue-400 text-[11px] uppercase tracking-wider">
                    Why Applicable
                  </p>
                  <p className="line-clamp-2 leading-relaxed text-[11px]">
                    Directly applicable to portable immersion heating elements, earthing continuity, IPX7 immersion integrity, and boil-dry safety.
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">Mandate</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">Mandatory (QCO)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">Conformity Scheme</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">Scheme-I (ISI Mark)</span>
                  </div>
                </div>

                {/* Footer preview tags */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Authoritative Citation: DPIIT Gazette & BIS</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Ready to explore →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM → SOLUTION SECTION */}
      <section id="problem-solution" className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              The Challenge & The Solution
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Navigating Indian Standards shouldn&apos;t be a maze.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Manufacturers frequently struggle to determine which IS codes govern their products, whether certification is statutory, and how testing procedures align.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Problem Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Traditional Bottleneck</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Fragmented regulatory documents and complex technical clauses
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>20,000+ Indian Standards:</strong> Difficult to know which exact Part 1 base standard or Part 2 particular specification applies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Scattered QCO Notices:</strong> Mandatory enforcement dates are distributed across ministry gazettes and departmental circulars.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Unclear Testing Pathways:</strong> Confusion over mandatory in-house factory testing apparatus versus independent laboratory type tests.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 font-medium">
                Results in regulatory delays and non-compliance risk.
              </div>
            </div>

            {/* The Solution Workflow Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/40 dark:bg-slate-900/70 border border-blue-200/80 dark:border-blue-900/60 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#1E3A8A] dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The BISaarthi Solution</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  A structured compliance guidance workflow
                </h3>

                {/* Step Flow */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Product / Requirement Input
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Context Understanding & Scheme Mapping
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Ranked Indian Standards & Clause Highlights
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Source-Backed Testing & Laboratory Guidance
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 font-medium">
                Delivers clarity in minutes with verifiable citations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE CAPABILITIES (EXACTLY 3 MVP CORE FEATURES) */}
      <section id="features" className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Three focused compliance workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore dedicated capabilities designed to answer regulatory questions, identify applicable standards, and compare technical specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 01: AI Chatbot */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/80 transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">01</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    AI Chatbot
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Ask questions about Indian Standards, certification procedures, Quality Control Orders, and testing protocols in natural language.
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Multi-turn conversational guidance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Inline standard reference cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Authoritative source citations</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Start a Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 02: Find Standards */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/80 transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">02</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Find Standards
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Describe a product or requirement—or optionally provide a technical datasheet—to discover ranked, applicable Indian Standards.
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Natural language requirement matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Optional specification sheet upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Tests & Laboratory compliance roadmaps</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Discover Standards</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 03: Compare Standards */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/80 transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">03</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Compare Standards
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Compare exactly two Indian Standards side-by-side to understand their scope differences, test matrices, and parent-particular relationship.
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Strict dual-standard comparison matrix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>10 comparative regulatory dimensions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Key difference & relationship breakdowns</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Compare 2 Standards</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW BISAARTHI WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              How BISaarthi Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              From product concept to compliance clarity in 4 steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              A diagrammatic process designed to give manufacturers actionable guidance without technical ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1E3A8A] dark:text-blue-300 font-bold font-mono text-xs flex items-center justify-center">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Describe
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tell BISaarthi what product, technical rating, or standard requirement you are dealing with.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1E3A8A] dark:text-blue-300 font-bold font-mono text-xs flex items-center justify-center">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Discover
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                BISaarthi identifies potentially applicable base standards, particular requirements, and QCO status.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1E3A8A] dark:text-blue-300 font-bold font-mono text-xs flex items-center justify-center">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Understand
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review applicability reasoning, mandatory test batteries, laboratory networks, and official citations.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1E3A8A] dark:text-blue-300 font-bold font-mono text-xs flex items-center justify-center">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Decide
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Use referenced insights to configure factory testing equipment and prepare for official BIS licensing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SOURCE-BACKED INFORMATION */}
      <section id="trust-sources" className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Trust & Source-Backed Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Designed around institutional standards and transparent citations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              BISaarthi is built to provide regulatory guidance with clear source citations and transparent uncertainty notices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Source-Backed Answers
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Recommendations cite specific Indian Standards, Quality Control Orders, and BIS scheme rules.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-[#1E3A8A] dark:text-blue-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Applicability Reasoning
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear rationales explaining why a standard applies to a given product construction or voltage range.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Transparent Uncertainty
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Highlights when clause-level verification or lab consultation is required before production.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Clear AI Role
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Explicitly positioned as an AI guidance tool—not an official certification grantor or legal arbiter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA SECTION */}
      <section className="py-16 sm:py-20 bg-linear-to-r from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-amber-400">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Ready to understand the standards that matter to you?
          </h2>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Start with BISaarthi and turn complex standards information into clearer, actionable guidance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-[#1E3A8A] hover:bg-slate-100 shadow-md font-semibold border-none"
                icon={<ArrowRight className="w-4 h-4 text-[#1E3A8A]" />}
              >
                Ask BISaarthi
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-blue-900/50 text-white border-blue-400/40 hover:bg-blue-900/80"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. PUBLIC FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 space-y-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-linear-to-br from-blue-600 to-[#1E3A8A] flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              BISaarthi
            </span>
            <span className="text-[10px] text-slate-400">
              • AI-Powered Indian Standards Guide
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-6 font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#trust-sources" className="hover:text-blue-600 transition-colors">
              Trust & Sources
            </a>
            <Link href="/auth/login" className="hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/auth/signup" className="hover:text-blue-600 transition-colors">
              Get Started
            </Link>
          </nav>
        </div>

        {/* Canonical Regulatory Disclaimer */}
        <div className="max-w-4xl mx-auto pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <p className="leading-relaxed">
            <strong>Regulatory Disclaimer:</strong> BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
          </p>
          <p className="text-[11px] text-slate-400">
            © 2026 BISaarthi. Developed for SIH 2026. All Indian Standards identifiers remain the property of the Bureau of Indian Standards.
          </p>
        </div>
      </footer>
    </div>
  );
}
