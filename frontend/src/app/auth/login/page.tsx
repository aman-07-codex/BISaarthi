'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setInfoToast(msg);
    setTimeout(() => {
      setInfoToast(null);
    }, 3000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Simulate mock authentication loading
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleGoogleLogin = () => {
    showToast('Google authentication will be connected with backend integration.');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('Password recovery will be available with full account integration.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F5EF] dark:bg-[#0E1815] text-[#18211D] dark:text-[#F7F5EF]">
      {/* Toast Notification */}
      {infoToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0D3328] text-white px-4 py-2.5 rounded-2xl shadow-lg border border-[#5B8272]/40 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <Info className="w-4 h-4 text-[#A7B8AE] shrink-0" />
          <span>{infoToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-xl overflow-hidden min-h-[580px]">
          {/* Left Panel: Value Proposition & Trust (Desktop / Tablet) */}
          <div className="lg:col-span-5 bg-[#091E18] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-r border-[#16382E]">
            {/* Background pattern */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-8 translate-y-8">
              <Shield className="w-72 h-72 text-white" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Brand Header */}
              <Logo variant="light" size="md" linkHref="/" />

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  AI-Powered Guidance for Indian Standards
                </h2>
                <p className="text-xs sm:text-sm text-[#BAC5BF] leading-relaxed font-normal">
                  Democratizing regulatory discovery, testing routines, and BIS compliance pathways for Indian manufacturers and MSMEs.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-[#12332A] border border-[#1E4D3E] flex items-start gap-2.5 text-xs text-[#F7F5EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#A7B8AE] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">AI Chatbot</strong>
                    <span className="text-[#BAC5BF]">Ask multi-turn regulatory questions with citations</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#12332A] border border-[#1E4D3E] flex items-start gap-2.5 text-xs text-[#F7F5EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#A7B8AE] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Find Applicable Standards</strong>
                    <span className="text-[#BAC5BF]">Map products & specs to indexed IS codes</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#12332A] border border-[#1E4D3E] flex items-start gap-2.5 text-xs text-[#F7F5EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#A7B8AE] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Compare 2 Standards</strong>
                    <span className="text-[#BAC5BF]">Side-by-side matrices & scope differences</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro footer in panel */}
            <div className="relative z-10 pt-6 border-t border-[#16382E] text-[11px] text-[#8FA89B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5B8272] shrink-0" />
              <span>Referenced from Indian Standards & Quality Control Orders</span>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white dark:bg-[#15221E]">
            <div>
              {/* Back to landing link */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to BISaarthi</span>
                </Link>

                <span className="text-[11px] text-[#8B978F] hidden sm:inline">
                  Prototype Access
                </span>
              </div>

              {/* Form Heading */}
              <div className="space-y-1.5 mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-[#18211D] dark:text-white tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF]">
                  Sign in to continue with BISaarthi.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-2xl bg-[#FDF2EE] dark:bg-[#3E1A14] border border-[#FBE0D6] dark:border-[#52251D] flex items-start gap-2.5 text-xs text-[#9E3A20] dark:text-[#FECACA] animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#18211D] dark:text-[#F7F5EF] flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-[#8B978F] font-normal normal-case">Required</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/30 focus:border-[#0D3328] transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18211D] dark:text-[#F7F5EF]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-[#0D3328] dark:text-[#A7B8AE] hover:underline cursor-pointer font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8B978F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] focus:outline-none focus:ring-2 focus:ring-[#5B8272]/30 focus:border-[#0D3328] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B978F] hover:text-[#18211D] dark:hover:text-white p-0.5 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-full bg-[#0D3328] hover:bg-[#164B3A] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D9DDD8] dark:border-[#253831]" />
                </div>
                <span className="relative bg-white dark:bg-[#15221E] px-3 text-[11px] font-bold text-[#8B978F] uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Google Auth Button (UI Mock) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded-full border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#1B2B26] hover:bg-[#FAF9F5] dark:hover:bg-[#20312B] text-[#18211D] dark:text-[#F7F5EF] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Sign up link */}
              <div className="pt-6 text-center text-xs text-[#606E66] dark:text-[#BAC5BF]">
                <span>Don&apos;t have an account? </span>
                <Link
                  href="/auth/signup"
                  className="text-[#0D3328] dark:text-[#A7B8AE] font-black hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </div>

            {/* Quick Demo Hint */}
            <div className="mt-8 pt-4 border-t border-[#EFECE6] dark:border-[#1C2E28] text-[11px] text-[#8B978F] text-center">
              <span>Demo Mode: Enter any email and password to access the platform.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Footer Trust Note */}
      <footer className="py-4 px-6 text-center text-[11px] text-[#606E66] dark:text-[#8B978F] border-t border-[#D9DDD8] dark:border-[#253831]">
        <p className="max-w-4xl mx-auto leading-normal">
          BISaarthi is an AI guidance tool based on authoritative BIS and government sources. It does not replace official BIS certification, testing laboratories, or statutory legal determinations.
        </p>
      </footer>
    </div>
  );
}
