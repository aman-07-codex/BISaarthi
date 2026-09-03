'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, BookOpen, Layers, HelpCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const suggestions = [
    {
      title: 'Electric Heater Manufacturing',
      prompt: 'I want to manufacture an electric heater. Which Indian Standards apply and what are the testing requirements?',
      category: 'Product Guidance',
    },
    {
      title: 'LED Lighting Mandatory Schemes',
      prompt: 'Which Indian Standard applies to self-ballasted LED lamps and is BIS certification mandatory under QCO?',
      category: 'Scheme & QCO',
    },
    {
      title: 'Plugs & Sockets (IS 1293)',
      prompt: 'What are the critical safety tests and pin dimension requirements specified under IS 1293:2019?',
      category: 'Standard Requirements',
    },
    {
      title: 'Lithium Battery Standards',
      prompt: 'What are the differences between IS 16046 Part 1 (Nickel) and Part 2 (Lithium) secondary cells?',
      category: 'Comparison Guidance',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onSelectPrompt(customPrompt.trim());
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-in fade-in duration-200">
      {/* Intro Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-[#1E3A8A] text-white shadow-md shadow-blue-900/20 mb-2">
          <ShieldCheck className="w-6 h-6 text-amber-300" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          BISaarthi AI Chatbot
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Your conversational assistant for Bureau of Indian Standards guidance. Ask questions in simple language to identify standards, understand mandatory certification schemes, and review laboratory testing expectations.
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Referenced from Indian Standards & Quality Control Orders</span>
        </div>
      </div>

      {/* Centered Large Prompt Box */}
      <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask about an Indian Standard, product, requirement, testing or certification..."
            rows={3}
            className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none transition-all leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Guidance referenced from Indian Standards
            </span>
            <Button
              type="submit"
              variant="primary"
              disabled={!customPrompt.trim()}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Ask BISaarthi
            </Button>
          </div>
        </form>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Suggested Inquiries
          </span>
          <span className="text-[11px] text-slate-400">
            Click to start conversation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:bg-blue-50/40 dark:hover:bg-slate-700/40 hover:border-blue-300 dark:hover:border-slate-600 transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">
                  {item.category}
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#1E3A8A] dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Start conversation</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
