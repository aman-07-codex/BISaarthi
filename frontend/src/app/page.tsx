'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  Building2,
  Compass,
  Menu,
  X,
  Plus,
  Minus,
  Layers,
  BookOpen,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: 'What is an Indian Standard?',
      a: 'An Indian Standard (IS) is an official technical specification established by the Bureau of Indian Standards (BIS) that prescribes minimum quality, performance, safety, and testing benchmarks for products, processes, and services in India.',
    },
    {
      q: 'How does BISaarthi identify applicable standards?',
      a: 'BISaarthi parses your natural language product descriptions, intended operating conditions, and technical parameters against indexed Indian Standards, Quality Control Orders (QCOs), and BIS product manuals to surface ranked applicable standards with explainable rationale.',
    },
    {
      q: 'Does BISaarthi replace official BIS information?',
      a: 'No. BISaarthi is an AI compliance guidance tool. It does not replace official BIS certification, laboratory testing reports, or statutory determinations. All formal applications must be submitted via official BIS portals (such as Manakonline).',
    },
    {
      q: 'Can I verify the source/version of a standard?',
      a: 'Yes. Every recommendation includes clickable source citations showing the exact standard title, gazette references, QCO mandatory dates, and version identifiers for complete transparency.',
    },
    {
      q: 'What happens if multiple standards may apply?',
      a: 'When multiple standards apply (such as general safety IS 302-1 combined with particular appliance requirements IS 302-2-201 and plug specifications IS 1293), BISaarthi organizes them hierarchically and explains how the standards interrelate.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#0E1815] text-[#18211D] dark:text-[#F7F5EF] selection:bg-[#E8EFEA] selection:text-[#0D3328] transition-colors duration-200">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#F7F5EF]/95 dark:bg-[#0E1815]/95 backdrop-blur-md border-b border-[#D9DDD8] dark:border-[#253831] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Logo size="md" linkHref="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-[#606E66] dark:text-[#BAC5BF]">
            <a
              href="#about"
              className="hover:text-[#0D3328] dark:hover:text-[#F7F5EF] transition-colors"
            >
              About
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#0D3328] dark:hover:text-[#F7F5EF] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#what-it-does"
              className="hover:text-[#0D3328] dark:hover:text-[#F7F5EF] transition-colors"
            >
              What It Can Do
            </a>
            <a
              href="#faq"
              className="hover:text-[#0D3328] dark:hover:text-[#F7F5EF] transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="hover:text-[#0D3328] dark:hover:text-[#F7F5EF] transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Right Action: Theme Toggle & Ask BISAARTHI CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Global Theme Toggle Button */}
            <ThemeToggle />

            <Link href="/auth/login">
              <Button
                variant="pill"
                size="md"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                className="font-bold tracking-tight text-xs"
              >
                Ask BISAARTHI
              </Button>
            </Link>
          </div>

          {/* Mobile Actions (Theme Toggle + Menu Toggle) */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#606E66] dark:text-[#BAC5BF] hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26] cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#15221E] px-4 py-4 space-y-3 shadow-lg animate-in fade-in duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-[#18211D] dark:text-[#F7F5EF]">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26]"
              >
                About
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26]"
              >
                How It Works
              </a>
              <a
                href="#what-it-does"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26]"
              >
                What It Can Do
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26]"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26]"
              >
                Contact
              </a>
            </nav>
            <div className="pt-2 border-t border-[#D9DDD8] dark:border-[#253831] flex flex-col gap-2">
              <Link href="/auth/login" className="w-full">
                <Button variant="pill" size="md" className="w-full justify-center">
                  Ask BISAARTHI
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="about" className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-[#D9DDD8] dark:border-[#253831]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight leading-[1.12]">
                Navigate Indian Standards with{' '}
                <span className="text-[#3D6B58] dark:text-[#8FA89B] underline decoration-[#8FA89B]/50 decoration-wavy underline-offset-6">
                  confidence.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#606E66] dark:text-[#BAC5BF] leading-relaxed max-w-xl font-normal">
                BISaarthi is your AI-powered assistant that helps you discover, understand and explore the right Indian Standards for your products.
              </p>

              {/* Main Hero CTA Button */}
              <div className="pt-2">
                <Link href="/auth/login">
                  <Button
                    variant="pill"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="font-bold text-sm tracking-wide shadow-md shadow-[#0D3328]/15 px-7 py-3.5"
                  >
                    Ask BISAARTHI
                  </Button>
                </Link>
              </div>

              {/* 3 Micro Feature Badges */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-[#D9DDD8]/80 dark:border-[#253831] max-w-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    <Sparkles className="w-3.5 h-3.5 text-[#5B8272]" />
                    <span>AI-Assisted</span>
                  </div>
                  <p className="text-[11px] text-[#606E66] dark:text-[#8FA89B]">
                    Direct & Relevant
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5B8272]" />
                    <span>Source-backed</span>
                  </div>
                  <p className="text-[11px] text-[#606E66] dark:text-[#8FA89B]">
                    Technical & Government
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    <Compass className="w-3.5 h-3.5 text-[#5B8272]" />
                    <span>Explainable</span>
                  </div>
                  <p className="text-[11px] text-[#606E66] dark:text-[#8FA89B]">
                    Clear & Transparent
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Column: UI Mockup Window */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-6 shadow-xl space-y-4">
                {/* Mock Window Title Bar */}
                <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#253831] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5E2DC] dark:bg-[#253831]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5E2DC] dark:bg-[#253831]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5E2DC] dark:bg-[#253831]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#606E66] dark:text-[#BAC5BF] tracking-wider uppercase">
                    BISAARTHI
                  </span>
                  <div className="w-5" />
                </div>

                {/* Simulated Chat Message Bubble from User */}
                <div className="flex justify-end">
                  <div className="bg-[#0D3328] dark:bg-[#164B3A] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs font-medium max-w-[85%] shadow-2xs">
                    Which standards apply to my product?
                  </div>
                </div>

                {/* Surfaced Standard Cards in Mockup */}
                <div className="space-y-2 pt-1">
                  {/* Item 1 */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#E5E2DC] dark:border-[#253831] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#E8EFEA] dark:bg-[#15221E] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 font-bold text-[10px]">
                        IS
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] block">
                          IS 302 (Part 2/Sec 201)
                        </span>
                        <span className="text-[10px] text-[#606E66] dark:text-[#8FA89B] truncate block">
                          Immersion Water Heaters Safety
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1B5E39] dark:text-[#A7F3D0] bg-[#E8F4EC] dark:bg-[#113624] px-2 py-0.5 rounded-full border border-[#C2E4CD] dark:border-[#1E5438] shrink-0">
                      Mandatory
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#E5E2DC] dark:border-[#253831] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#E8EFEA] dark:bg-[#15221E] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 font-bold text-[10px]">
                        IS
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] block">
                          IS 1293:2019
                        </span>
                        <span className="text-[10px] text-[#606E66] dark:text-[#8FA89B] truncate block">
                          Plugs and Socket-Outlets (250V)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1B5E39] dark:text-[#A7F3D0] bg-[#E8F4EC] dark:bg-[#113624] px-2 py-0.5 rounded-full border border-[#C2E4CD] dark:border-[#1E5438] shrink-0">
                      Mandatory
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#E5E2DC] dark:border-[#253831] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#E8EFEA] dark:bg-[#15221E] flex items-center justify-center text-[#0D3328] dark:text-[#8FA89B] shrink-0 font-bold text-[10px]">
                        IS
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#18211D] dark:text-[#F7F5EF] block">
                          IS 16102 (Part 1)
                        </span>
                        <span className="text-[10px] text-[#606E66] dark:text-[#8FA89B] truncate block">
                          Self-Ballasted LED Lamps Safety
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#0D3328] dark:text-[#A7B8AE] bg-[#E8EFEA] dark:bg-[#1B2B26] px-2 py-0.5 rounded-full border border-[#D9DDD8] dark:border-[#253831] shrink-0">
                      CRS Scheme
                    </span>
                  </div>
                </div>

                {/* Floating pill indicators on mockup edges */}
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#A7B8AE] font-semibold text-xs border border-[#D9DDD8] dark:border-[#253831]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5B8272]" />
                    <span>Indian Standards</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EB] dark:bg-[#38240D] text-[#8C6126] dark:text-[#FDE68A] font-semibold text-xs border border-[#F2E4CD] dark:border-[#523A1B]">
                    <Building2 className="w-3.5 h-3.5 text-[#B88746]" />
                    <span>BIS Services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM SECTION */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#12201A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#5B8272] dark:text-[#8FA89B]">
                THE PROBLEM
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight leading-[1.2] break-words">
                Indian Standards shouldn&apos;t be this difficult to navigate.
              </h2>
              <p className="text-sm sm:text-base text-[#606E66] dark:text-[#BAC5BF] leading-relaxed break-words">
                Thousands of standards, complex language, multiple procedures and scattered information make compliance confusing and time-consuming.
              </p>
            </div>

            {/* 4 Problem Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1 */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs hover:shadow-xs hover:border-[#5B8272]/50 transition-all space-y-3 flex flex-col justify-start">
                <div className="w-11 h-11 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF] tracking-tight break-words">
                  Thousands of Standards
                </h3>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                  Too many documents to search through manually without clarity.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs hover:shadow-xs hover:border-[#5B8272]/50 transition-all space-y-3 flex flex-col justify-start">
                <div className="w-11 h-11 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF] tracking-tight break-words">
                  Complex Language
                </h3>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                  Technical jargon is hard to interpret for engineers and MSMEs.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs hover:shadow-xs hover:border-[#C86D51]/50 transition-all space-y-3 flex flex-col justify-start">
                <div className="w-11 h-11 rounded-full bg-[#FDF2EE] dark:bg-[#3E1A14] text-[#C86D51] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF] tracking-tight break-words">
                  Multiple Procedures
                </h3>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                  Different conformity paths for domestic vs imported goods.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs hover:shadow-xs hover:border-[#B88746]/50 transition-all space-y-3 flex flex-col justify-start">
                <div className="w-11 h-11 rounded-full bg-[#FAF4EB] dark:bg-[#38240D] text-[#B88746] flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#18211D] dark:text-[#F7F5EF] tracking-tight break-words">
                  Difficult to Locate
                </h3>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                  Finding the right gazettes and laboratory rules is challenging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT BISAARTHI DOES SECTION */}
      <section id="what-it-does" className="py-16 sm:py-20 lg:py-24 border-b border-[#D9DDD8] dark:border-[#253831] bg-[#F7F5EF] dark:bg-[#0E1815] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-left space-y-3 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#5B8272] dark:text-[#8FA89B]">
              WHAT BISAARTHI DOES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight leading-tight">
              One assistant. Multiple compliance journeys.
            </h2>
            <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
              From discovering applicable standards to understanding their requirements and related BIS services — BISaarthi is with you at every step.
            </p>
          </div>

          {/* 3 Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Find Applicable Standards */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-xs hover:border-[#5B8272] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-full bg-[#0D3328] dark:bg-[#164B3A] text-white flex items-center justify-center shadow-xs">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Find Applicable Standards
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  Describe your product and discover relevant Indian Standards with rationale.
                </p>
              </div>

              <div className="pt-4 border-t border-[#EFECE6] dark:border-[#253831]">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A] dark:hover:text-[#A7B8AE] transition-colors"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Understand Why It Applies */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-xs hover:border-[#5B8272] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-full bg-[#FDF2EE] dark:bg-[#3E1A14] text-[#C86D51] flex items-center justify-center shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Understand Why It Applies
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  Get clear explanations on why a standard may apply to your product.
                </p>
              </div>

              <div className="pt-4 border-t border-[#EFECE6] dark:border-[#253831]">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A] dark:hover:text-[#A7B8AE] transition-colors"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Explore BIS Requirements */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-xs hover:border-[#5B8272] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5EF]">
                  Explore BIS Requirements
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                  Understand certification procedures and other relevant BIS services.
                </p>
              </div>

              <div className="pt-4 border-t border-[#EFECE6] dark:border-[#253831]">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3328] dark:text-[#8FA89B] hover:text-[#164B3A] dark:hover:text-[#A7B8AE] transition-colors"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW BISAARTHI WORKS SECTION */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 border-b border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#12201A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#5B8272] dark:text-[#8FA89B]">
              HOW BISAARTHI WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight leading-tight">
              From your product idea to the standards that matter.
            </h2>
          </div>

          {/* 5 Steps Horizontal Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-4 xl:gap-5">
            {/* Step 01 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] text-center space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-start">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#8B978F]">01</span>
                <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4 text-[#5B8272]" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] break-words">
                Understand
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                Understand the user&apos;s product, requirement, or question.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] text-center space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-start">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#8B978F]">02</span>
                <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center font-bold text-xs">
                  <Search className="w-4 h-4 text-[#5B8272]" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] break-words">
                Retrieve BIS Data
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                Retrieve relevant information from BIS data sources.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] text-center space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-start">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#8B978F]">03</span>
                <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center font-bold text-xs">
                  <Layers className="w-4 h-4 text-[#5B8272]" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] break-words">
                Identify Standards
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                Identify the Indian Standards relevant to the user&apos;s requirement.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] text-center space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-start">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#8B978F]">04</span>
                <div className="w-8 h-8 rounded-full bg-[#FDF2EE] dark:bg-[#3E1A14] text-[#C86D51] flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4 text-[#C86D51]" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] break-words">
                Explain + Evidence
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                Explain why the standards apply and provide supporting evidence.
              </p>
            </div>

            {/* Step 05 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] text-center space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-start">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#8B978F]">05</span>
                <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#5B8272]" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] break-words">
                Verify Official BIS Source
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#8B978F] leading-relaxed break-words">
                Connect the result back to the official BIS source for verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY TRUST BISAARTHI SECTION */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#D9DDD8] dark:border-[#253831] bg-[#F7F5EF] dark:bg-[#0E1815] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="space-y-3 text-left">
            <span className="text-xs font-black uppercase tracking-widest text-[#5B8272] dark:text-[#8FA89B]">
              WHY TRUST BISAARTHI
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight leading-tight">
              AI-assisted. Source-backed. Explainable.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: 3 Trust Points */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] flex items-start gap-4 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Built on Indian Standards
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-1 leading-relaxed">
                    Information referenced directly from authoritative BIS specifications and statutory Quality Control Orders.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] flex items-start gap-4 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Explainable Results
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-1 leading-relaxed">
                    Every recommendation comes with transparent contextual reasoning and applicable clause highlights.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] flex items-start gap-4 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#FAF4EB] dark:bg-[#38240D] text-[#B88746] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18211D] dark:text-[#F7F5EF]">
                    Transparent & Reliable
                  </h3>
                  <p className="text-xs text-[#606E66] dark:text-[#8B978F] mt-1 leading-relaxed">
                    We help you understand your compliance landscape while keeping you in complete decision control.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Realistic Leather Book Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-96 rounded-2xl bg-[#091E18] text-[#F7F5EF] p-8 shadow-2xl border border-[#16382E] flex flex-col justify-between items-center text-center transform hover:scale-102 transition-transform duration-300">
                <div className="space-y-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#8FA89B]">
                    BIT MANAK ONLINE
                  </span>
                  <h4 className="text-lg font-black tracking-wider text-white">
                    INDIAN STANDARDS
                  </h4>
                </div>

                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#5B8272]/40 shadow-inner">
                  <Image
                    src="/bisaarthi-logo.png"
                    alt="BISaarthi Emblem"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#A7B8AE] font-medium">
                    Statutory & Technical Specifications
                  </p>
                  <p className="text-[9px] text-[#5B8272] tracking-wider uppercase font-bold">
                    Official Reference Repository
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS + DARK CTA CARD */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24 border-b border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#12201A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-left space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#5B8272] dark:text-[#8FA89B]">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left FAQ Accordion (5 items) */}
            <div className="lg:col-span-7 space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#18211D] dark:text-[#F7F5EF] cursor-pointer hover:bg-[#F7F5EF]/60 dark:hover:bg-[#1B2B26]/60"
                    >
                      <span>{item.q}</span>
                      <span className="p-1 rounded-full bg-[#F7F5EF] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#BAC5BF] shrink-0">
                        {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4.5 pb-4 pt-1 text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed border-t border-[#EFECE6] dark:border-[#253831]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Dark Forest Green Card */}
            <div className="lg:col-span-5">
              <div className="p-8 sm:p-10 rounded-3xl bg-[#0A1F18] dark:bg-[#091E18] text-white border border-[#16382E] shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    Find where your product stands.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A7B8AE] leading-relaxed">
                    Ask BISAARTHI and get clarity on the standards that matter.
                  </p>
                </div>

                <div className="pt-2 relative z-10">
                  <Link href="/auth/login">
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<ArrowRight className="w-4 h-4 text-[#0D3328]" />}
                      className="bg-white text-[#0D3328] hover:bg-[#FAF9F5] font-bold text-xs tracking-wide px-6 py-3 border-none shadow-md"
                    >
                      Ask BISAARTHI
                    </Button>
                  </Link>
                </div>

                {/* Decorative Compass/Astrolabe graphic in corner */}
                <div className="absolute right-4 bottom-4 w-32 h-32 rounded-full border border-[#5B8272]/20 flex items-center justify-center opacity-40 pointer-events-none">
                  <Compass className="w-16 h-16 text-[#A7B8AE]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DEEP FOREST GREEN FOOTER */}
      <footer id="contact" className="bg-[#0A1C16] text-[#FAF9F5] border-t border-[#16382E] pt-14 pb-10 px-4 sm:px-6 lg:px-8 text-xs space-y-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Logo & Mission (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <Logo variant="light" size="md" linkHref="/" />
            <p className="text-xs text-[#8FA89B] leading-relaxed max-w-sm">
              Empowering India through accessible and understandable standards.
            </p>
          </div>

          {/* 4 Footer Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {/* Quick Links */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-widest text-[#8FA89B] uppercase block">
                QUICK LINKS
              </span>
              <ul className="space-y-2 text-xs text-[#BAC5BF]">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#what-it-does" className="hover:text-white transition-colors">What It Can Do</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-widest text-[#8FA89B] uppercase block">
                RESOURCES
              </span>
              <ul className="space-y-2 text-xs text-[#BAC5BF]">
                <li><Link href="/find-standards" className="hover:text-white transition-colors">Indian Standards</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">BIS Services</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Help Centre</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-widest text-[#8FA89B] uppercase block">
                LEGAL
              </span>
              <ul className="space-y-2 text-xs text-[#BAC5BF]">
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Use</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Disclaimer</span></li>
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-widest text-[#8FA89B] uppercase block">
                CONNECT
              </span>
              <div className="flex items-center gap-2 pt-1 text-[#BAC5BF]">
                <span className="w-7 h-7 rounded-full bg-[#12332A] flex items-center justify-center hover:bg-[#164B3A] hover:text-white transition-colors cursor-pointer text-[10px] font-bold">
                  IN
                </span>
                <span className="w-7 h-7 rounded-full bg-[#12332A] flex items-center justify-center hover:bg-[#164B3A] hover:text-white transition-colors cursor-pointer text-[10px] font-bold">
                  X
                </span>
                <span className="w-7 h-7 rounded-full bg-[#12332A] flex items-center justify-center hover:bg-[#164B3A] hover:text-white transition-colors cursor-pointer text-[10px] font-bold">
                  YT
                </span>
                <span className="w-7 h-7 rounded-full bg-[#12332A] flex items-center justify-center hover:bg-[#164B3A] hover:text-white transition-colors cursor-pointer text-[10px] font-bold">
                  @
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Canonical Regulatory Disclaimer */}
        <div className="max-w-4xl mx-auto pt-6 border-t border-[#16382E] text-center space-y-2 text-[#8FA89B]">
          <p className="leading-relaxed text-[11px]">
            <strong className="text-white">Regulatory Disclaimer:</strong> BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
          </p>
          <p className="text-[10px] text-[#5B8272]">
            © 2026 BISaarthi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
