'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeftRight, Search, FileText, Check, Minus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Bureau of Indian Standards (BIS) Stylized Vector Emblem
 */
export const BisSymbol: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Stylized BIS Tri-Chevron Shape */}
    <path
      d="M16 3L3.5 24.5H9.5L16 13L22.5 24.5H28.5L16 3Z"
      fill="currentColor"
    />
    <path
      d="M11 25.5L16 17L21 25.5H11Z"
      fill="#5B8272"
      fillOpacity="0.8"
    />
    {/* Center Red Dot / Core */}
    <circle cx="16" cy="19.5" r="2.2" fill="#E11D48" />
  </svg>
);

/**
 * Illustration 1: Ask BISaarthi AI Mascot with chat speech bubble & response doc
 */
const AskIllustration: React.FC<{ language: string }> = ({ language }) => (
  <div className="w-full h-52 relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-linear-to-b from-[#EBF3EE] via-[#F2F7F4] to-[#E6EFEA] dark:from-[#152721] dark:via-[#192E27] dark:to-[#12221C] border border-[#D9DDD8]/60 dark:border-[#253831] p-3">
    {/* Soft ambient background glow */}
    <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-[#5B8272]/15 dark:bg-[#5B8272]/20 blur-2xl pointer-events-none" />
    <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-[#0D3328]/10 dark:bg-[#8FA89B]/10 blur-2xl pointer-events-none" />

    {/* Sparkle lines top left */}
    <div className="absolute top-4 left-24 flex gap-1 items-end opacity-60">
      <div className="w-0.5 h-3 bg-[#5B8272] rounded-full rotate-[-25deg]" />
      <div className="w-0.5 h-4 bg-[#5B8272] rounded-full" />
      <div className="w-0.5 h-3 bg-[#5B8272] rounded-full rotate-[25deg]" />
    </div>

    {/* Decorative foliage bottom right */}
    <div className="absolute bottom-2 right-3 flex items-end gap-1 opacity-70 pointer-events-none">
      <svg width="42" height="34" viewBox="0 0 42 34" fill="none" className="text-[#8FA89B] dark:text-[#5B8272]">
        <path
          d="M8 32C8 22 14 12 24 8C20 18 16 26 8 32Z"
          fill="currentColor"
          fillOpacity="0.4"
        />
        <path
          d="M18 33C20 20 28 8 38 4C34 16 30 26 18 33Z"
          fill="currentColor"
          fillOpacity="0.7"
        />
        <path
          d="M2 33C4 26 8 18 16 14C14 22 10 28 2 33Z"
          fill="currentColor"
          fillOpacity="0.5"
        />
      </svg>
    </div>

    {/* Main Composition: Robot Mascot on Left + Dialog Stack on Right */}
    <div className="w-full h-full relative flex items-center justify-between px-1">
      {/* Robot Mascot */}
      <div className="relative z-10 flex flex-col items-center ml-1">
        {/* Antenna */}
        <div className="flex flex-col items-center -mb-1">
          <div className="w-3 h-3 rounded-full bg-[#0D3328] dark:bg-[#5B8272] border-2 border-white dark:border-[#15221E] shadow-xs flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#A7F3D0]" />
          </div>
          <div className="w-1 h-2.5 bg-[#5B8272] dark:bg-[#8FA89B] rounded-full" />
        </div>

        {/* Robot Head */}
        <div className="relative">
          {/* Ear pods */}
          <div className="absolute -left-2.5 top-3.5 w-3.5 h-6 rounded-l-full bg-[#0D3328] dark:bg-[#5B8272] border-y border-l border-white/40 shadow-xs" />
          <div className="absolute -right-2.5 top-3.5 w-3.5 h-6 rounded-r-full bg-[#0D3328] dark:bg-[#5B8272] border-y border-r border-white/40 shadow-xs" />

          {/* Head Capsule */}
          <div className="w-[84px] h-[70px] rounded-[22px] bg-white dark:bg-[#1E322A] border-2 border-[#D9DDD8] dark:border-[#2F473D] shadow-md p-2 flex items-center justify-center relative z-10">
            {/* Screen Face */}
            <div className="w-full h-full rounded-[15px] bg-[#071F18] dark:bg-[#0A1612] flex flex-col items-center justify-center p-1.5 shadow-inner">
              {/* Cute glowing eyes */}
              <div className="flex items-center justify-between w-full px-2">
                {/* Left Eye: Curved happy arch */}
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M2 8C3.5 3.5 10.5 3.5 12 8" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {/* Right Eye: Curved happy arch */}
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M2 8C3.5 3.5 10.5 3.5 12 8" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              {/* Cute smiling mouth */}
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" className="mt-1">
                <path d="M2 1.5C4 4.5 8 4.5 10 1.5" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Robot Body / Torso */}
        <div className="w-[74px] h-11 -mt-1 rounded-t-[18px] rounded-b-lg bg-white dark:bg-[#1E322A] border-x-2 border-t-2 border-[#D9DDD8] dark:border-[#2F473D] shadow-sm flex flex-col items-center justify-center relative z-0">
          {/* BIS Emblem Badge */}
          <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#2F473D] flex items-center justify-center shadow-2xs text-[#0D3328] dark:text-[#8FA89B]">
            <BisSymbol className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Right Side: Floating Speech Bubble + Document Response */}
      <div className="flex flex-col gap-2.5 items-end flex-1 max-w-[172px] z-10 mr-0.5">
        {/* User Query Speech Bubble */}
        <div className="relative bg-white dark:bg-[#1B2F28] border border-[#D9DDD8] dark:border-[#2F473D] rounded-2xl rounded-bl-xs p-2.5 shadow-md">
          <p className="text-[10.5px] font-bold text-[#18211D] dark:text-[#F7F5EF] leading-snug">
            {language === 'HI'
              ? 'इलेक्ट्रिक हीटर पर कौन से मानक लागू होते हैं?'
              : 'Which standards apply to electric heaters?'}
          </p>
          {/* Speech bubble tail pointer */}
          <div className="absolute -left-2 bottom-1.5 w-2.5 h-2.5 bg-white dark:bg-[#1B2F28] border-l border-b border-[#D9DDD8] dark:border-[#2F473D] rotate-45" />
        </div>

        {/* System Response Snippet Card */}
        <div className="w-full bg-white/95 dark:bg-[#1E342C]/95 backdrop-blur-xs border border-[#D9DDD8] dark:border-[#2F473D] rounded-xl p-2.5 shadow-sm space-y-1.5 relative">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-[#0D3328] dark:bg-[#5B8272] flex items-center justify-center text-white shrink-0">
              <FileText className="w-2.5 h-2.5" />
            </div>
            <div className="h-2 w-16 bg-[#5B8272]/30 dark:bg-[#8FA89B]/40 rounded-full" />
          </div>

          <div className="space-y-1 pl-0.5 pr-4">
            <div className="h-1.5 w-full bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
            <div className="h-1.5 w-3/4 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>

          {/* Emerald Checkmark Badge */}
          <div className="absolute right-2 bottom-2 w-4 h-4 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shadow-xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Illustration 2: Find Standards with stack of standard documents, magnifier & search pill
 */
const FindIllustration: React.FC<{ language: string }> = ({ language }) => (
  <div className="w-full h-52 relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-linear-to-b from-[#EBF3EE] via-[#F2F7F4] to-[#E6EFEA] dark:from-[#152721] dark:via-[#192E27] dark:to-[#12221C] border border-[#D9DDD8]/60 dark:border-[#253831] p-3">
    {/* Ambient background glow */}
    <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-[#5B8272]/15 dark:bg-[#5B8272]/20 blur-2xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-[#0D3328]/10 dark:bg-[#8FA89B]/10 blur-2xl pointer-events-none" />

    {/* Sparkle radiance top left */}
    <div className="absolute top-4 left-8 flex gap-1 items-end opacity-65">
      <div className="w-0.5 h-3.5 bg-[#2D9D5D] rounded-full rotate-[-25deg]" />
      <div className="w-0.5 h-4.5 bg-[#2D9D5D] rounded-full" />
      <div className="w-0.5 h-3.5 bg-[#2D9D5D] rounded-full rotate-[25deg]" />
    </div>

    {/* Main Stack Composition */}
    <div className="w-full h-full relative flex items-center justify-between px-1">
      {/* Document Stack on Left */}
      <div className="relative z-10 ml-2">
        {/* Back card 2 (tilted further) */}
        <div className="absolute -left-2.5 -top-1.5 w-28 h-36 rounded-xl bg-[#D7E4DC] dark:bg-[#162B23] border border-[#C5D6CC] dark:border-[#233F34] rotate-[-7deg]" />
        {/* Back card 1 */}
        <div className="absolute -left-1 -top-1 w-28 h-36 rounded-xl bg-[#E2ECE5] dark:bg-[#1B3229] border border-[#D2E0D7] dark:border-[#28493D] rotate-[-3deg]" />

        {/* Front Featured Standard Sheet */}
        <div className="relative w-28 h-36 rounded-xl bg-white dark:bg-[#1F362E] border border-[#D9DDD8] dark:border-[#2F473D] shadow-md p-2 flex flex-col justify-between z-10">
          <div className="flex flex-col items-center text-center">
            {/* BIS Emblem */}
            <div className="text-[#0D3328] dark:text-[#8FA89B] mb-1">
              <BisSymbol className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-[#18211D] dark:text-[#F7F5EF] leading-tight">
              IS 302
            </span>
            <span className="text-[8px] font-semibold text-[#606E66] dark:text-[#8FA89B] leading-tight">
              (Part 1): 2024
            </span>
          </div>

          <div className="space-y-1.5 px-0.5 my-auto">
            <div className="h-1.5 w-full bg-[#5B8272]/30 dark:bg-[#8FA89B]/30 rounded-full" />
            <div className="h-1.5 w-4/5 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
            <div className="h-1.5 w-3/4 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>

          <div className="flex justify-between items-center px-0.5">
            <div className="h-1.5 w-7 bg-[#2D9D5D]/50 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center">
              <Check className="w-1.5 h-1.5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Magnifying Glass Over Document */}
        <div className="absolute -right-6 top-10 z-20 pointer-events-none group-hover:scale-105 transition-transform">
          <div className="relative">
            {/* Glass Lens */}
            <div className="w-14 h-14 rounded-full border-[3.5px] border-[#0D3328] dark:border-[#5B8272] bg-[#E8EFEA]/60 dark:bg-[#1E362D]/60 backdrop-blur-[2px] shadow-lg flex items-center justify-center">
              {/* Gloss shine */}
              <div className="w-9 h-9 rounded-full border-t-2 border-l border-white/80 opacity-70" />
            </div>
            {/* Magnifier Handle */}
            <div className="absolute -bottom-3 -right-3 w-3.5 h-7 rounded-full bg-linear-to-b from-[#0D3328] to-[#164B3A] dark:from-[#5B8272] dark:to-[#3F5F52] border border-white/30 rotate-[-45deg] shadow-md" />
          </div>
        </div>
      </div>

      {/* Right Side: Search Capsule & Checklist Lines */}
      <div className="flex flex-col gap-3 items-end flex-1 max-w-[160px] z-10 mr-1">
        {/* Search Query Pill */}
        <div className="bg-white dark:bg-[#1B2F28] border-2 border-[#0D3328]/30 dark:border-[#5B8272] rounded-full px-2.5 py-1 shadow-sm flex items-center gap-1.5">
          <Search className="w-3 h-3 text-[#0D3328] dark:text-[#8FA89B]" />
          <span className="text-[10px] font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
            {language === 'HI' ? 'इलेक्ट्रिक हीटर' : 'Electric Heater'}
          </span>
        </div>

        {/* Checklist Rows with Checkmark Icons */}
        <div className="w-full bg-white/80 dark:bg-[#1E342C]/80 backdrop-blur-xs border border-[#D9DDD8] dark:border-[#2F473D] rounded-xl p-2.5 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-full bg-[#5B8272]/30 dark:bg-[#8FA89B]/40 rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-4/5 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-3/4 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Illustration 3: Compare Standards with two side-by-side docs and bidirectional exchange badge
 */
const CompareIllustration: React.FC = () => (
  <div className="w-full h-52 relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-linear-to-b from-[#EBF3EE] via-[#F2F7F4] to-[#E6EFEA] dark:from-[#152721] dark:via-[#192E27] dark:to-[#12221C] border border-[#D9DDD8]/60 dark:border-[#253831] p-3">
    {/* Ambient background glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#5B8272]/15 dark:bg-[#5B8272]/20 blur-2xl pointer-events-none" />

    {/* Side-by-Side Comparison Docs */}
    <div className="relative w-full flex items-center justify-center gap-3">
      {/* Left Standard Document (IS 302 Part 1) */}
      <div className="w-[124px] h-[162px] rounded-xl bg-white dark:bg-[#1E342C] border-2 border-[#5B8272]/40 dark:border-[#2F473D] shadow-md p-2.5 flex flex-col justify-between">
        <div className="flex flex-col items-center text-center">
          <div className="text-[#0D3328] dark:text-[#8FA89B] mb-0.5">
            <BisSymbol className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-black text-[#18211D] dark:text-[#F7F5EF] leading-tight">
            IS 302
          </span>
          <span className="text-[8px] font-bold text-[#606E66] dark:text-[#8FA89B]">
            (Part 1): 2024
          </span>
        </div>

        {/* Divider bar */}
        <div className="h-0.5 w-full bg-[#E8EAE6] dark:bg-[#253D34] rounded-full my-1" />

        {/* Line Items with Status Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-full bg-[#5B8272]/30 dark:bg-[#8FA89B]/40 rounded-full" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#B88746] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Minus className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-3/4 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-4/5 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>
        </div>
      </div>

      {/* Center Circular Bidirectional Exchange Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 group-hover:rotate-180 transition-transform duration-500">
        <div className="w-10 h-10 rounded-full bg-[#0D3328] dark:bg-[#2D9D5D] text-white dark:text-[#0A1813] shadow-lg border-[3px] border-white dark:border-[#15221E] flex items-center justify-center">
          <ArrowLeftRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </div>
      </div>

      {/* Right Standard Document (IS 302 Part 2) */}
      <div className="w-[124px] h-[162px] rounded-xl bg-white dark:bg-[#1E342C] border-2 border-[#5B8272]/40 dark:border-[#2F473D] shadow-md p-2.5 flex flex-col justify-between">
        <div className="flex flex-col items-center text-center">
          <div className="text-[#0D3328] dark:text-[#8FA89B] mb-0.5">
            <BisSymbol className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-black text-[#18211D] dark:text-[#F7F5EF] leading-tight">
            IS 302
          </span>
          <span className="text-[8px] font-bold text-[#606E66] dark:text-[#8FA89B]">
            (Part 2): 2019
          </span>
        </div>

        {/* Divider bar */}
        <div className="h-0.5 w-full bg-[#E8EAE6] dark:bg-[#253D34] rounded-full my-1" />

        {/* Line Items with Status Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-full bg-[#5B8272]/30 dark:bg-[#8FA89B]/40 rounded-full" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-full bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2D9D5D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <div className="h-1.5 w-4/5 bg-[#D9DDD8] dark:bg-[#253D34] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Dashboard Feature Cards Section matching the user's requested cards and color theme
 */
export const DashboardFeatureCards: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#18211D] dark:text-[#F7F5EF]">
          {language === 'HI'
            ? 'बीआईएस सारथी आपकी क्या सहायता कर सकता है?'
            : 'What can BISaarthi help you with?'}
        </h2>
        <p className="text-xs text-[#606E66] dark:text-[#8B978F]">
          {language === 'HI'
            ? 'भारतीय मानकों और अनुपालन प्रक्रियाओं के लिए प्रमुख साधन'
            : 'Key tools to navigate Indian Standards and compliance workflows'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ask BISaarthi */}
        <Link
          href="/chat"
          className="group bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-6 shadow-2xs hover:shadow-xl hover:border-[#5B8272] dark:hover:border-[#5B8272] transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="space-y-4">
            {/* Top Themed Illustration */}
            <AskIllustration language={language} />

            {/* Title & Description */}
            <div className="space-y-2 pt-1">
              <h3 className="text-lg font-black text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#A7F3D0] transition-colors">
                {t('nav.ask', 'Ask BISaarthi')}
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                {language === 'HI'
                  ? 'भारतीय मानकों, बीआईएस सेवाओं, प्रमाणन और अन्य विषयों पर अपने प्रश्नों के उत्तर प्राकृतिक भाषा में प्राप्त करें।'
                  : 'Get answers to your questions about Indian Standards, BIS services, certification and more — in natural language.'}
              </p>
            </div>
          </div>

          {/* CTA Action Pill Button */}
          <div className="pt-5 mt-2 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8EFEA] dark:bg-[#1E362D] text-[#0D3328] dark:text-[#A7F3D0] group-hover:bg-[#0D3328] group-hover:text-white dark:group-hover:bg-[#2D9D5D] dark:group-hover:text-[#071F18] font-bold text-xs transition-all duration-200">
              <span>{language === 'HI' ? 'पूछना शुरू करें' : 'Start asking'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 2: Find Standards */}
        <Link
          href="/find-standards"
          className="group bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-6 shadow-2xs hover:shadow-xl hover:border-[#5B8272] dark:hover:border-[#5B8272] transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="space-y-4">
            {/* Top Themed Illustration */}
            <FindIllustration language={language} />

            {/* Title & Description */}
            <div className="space-y-2 pt-1">
              <h3 className="text-lg font-black text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#A7F3D0] transition-colors">
                {t('nav.find', 'Find Standards')}
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                {language === 'HI'
                  ? 'अपने उत्पाद, उद्योग या आवश्यकता के आधार पर लागू भारतीय मानकों को खोजें।'
                  : 'Discover applicable Indian Standards based on your product, industry or requirement.'}
              </p>
            </div>
          </div>

          {/* CTA Action Pill Button */}
          <div className="pt-5 mt-2 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8EFEA] dark:bg-[#1E362D] text-[#0D3328] dark:text-[#A7F3D0] group-hover:bg-[#0D3328] group-hover:text-white dark:group-hover:bg-[#2D9D5D] dark:group-hover:text-[#071F18] font-bold text-xs transition-all duration-200">
              <span>{language === 'HI' ? 'मानक खोजें' : 'Explore'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 3: Compare Standards */}
        <Link
          href="/compare"
          className="group bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-5 sm:p-6 shadow-2xs hover:shadow-xl hover:border-[#5B8272] dark:hover:border-[#5B8272] transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="space-y-4">
            {/* Top Themed Illustration */}
            <CompareIllustration />

            {/* Title & Description */}
            <div className="space-y-2 pt-1">
              <h3 className="text-lg font-black text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#A7F3D0] transition-colors">
                {t('nav.compare', 'Compare Standards')}
              </h3>
              <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] leading-relaxed">
                {language === 'HI'
                  ? 'आवश्यकताओं, अंतरों और प्रयोज्यता को समझने के लिए दो या अधिक मानकों की साथ-साथ तुलना करें।'
                  : 'Compare two or more standards side-by-side to understand requirements, differences and applicability.'}
              </p>
            </div>
          </div>

          {/* CTA Action Pill Button */}
          <div className="pt-5 mt-2 border-t border-[#EFECE6] dark:border-[#1C2E28]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8EFEA] dark:bg-[#1E362D] text-[#0D3328] dark:text-[#A7F3D0] group-hover:bg-[#0D3328] group-hover:text-white dark:group-hover:bg-[#2D9D5D] dark:group-hover:text-[#071F18] font-bold text-xs transition-all duration-200">
              <span>{language === 'HI' ? 'तुलना करें' : 'Compare'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};
