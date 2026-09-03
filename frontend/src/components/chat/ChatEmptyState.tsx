'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
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
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0D3328] text-white shadow-md shadow-[#0D3328]/20 mb-2 border border-[#5B8272]/40">
          <ShieldCheck className="w-6 h-6 text-[#A7B8AE]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#18211D] dark:text-[#F7F5EF] tracking-tight">
          BISaarthi AI Chatbot
        </h2>
        <p className="text-xs sm:text-sm text-[#606E66] dark:text-[#BAC5BF] max-w-xl mx-auto leading-relaxed">
          Your conversational assistant for Bureau of Indian Standards guidance. Ask questions in simple language to identify standards, understand mandatory certification schemes, and review laboratory testing expectations.
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F4EC] dark:bg-[#113624] border border-[#C2E4CD] dark:border-[#1E5438] text-[11px] font-semibold text-[#1B5E39] dark:text-[#A7F3D0]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D9D5D]" />
          <span>Referenced from Indian Standards & Quality Control Orders</span>
        </div>
      </div>

      {/* Centered Large Prompt Box */}
      <div className="bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] p-4 sm:p-5 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask about an Indian Standard, product, requirement, testing or certification..."
            rows={3}
            className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-[#FAF9F5] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] focus:outline-none focus:border-[#0D3328] focus:ring-2 focus:ring-[#5B8272]/20 text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] resize-none transition-all leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#8B978F]">
              Guidance referenced from Indian Standards
            </span>
            <Button
              type="submit"
              variant="pill"
              disabled={!customPrompt.trim()}
              icon={<ArrowRight className="w-4 h-4" />}
              className="font-bold text-xs"
            >
              Ask BISaarthi
            </Button>
          </div>
        </form>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] uppercase tracking-wider">
            Suggested Inquiries
          </span>
          <span className="text-[11px] text-[#8B978F]">
            Click to start conversation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="text-left p-4 rounded-2xl border border-[#D9DDD8] dark:border-[#253831] bg-white dark:bg-[#15221E] hover:bg-[#FAF9F5] dark:hover:bg-[#1B2B26] hover:border-[#5B8272] transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8272] dark:text-[#8FA89B] mb-1 block">
                  {item.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] group-hover:text-[#0D3328] dark:group-hover:text-[#A7B8AE] transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#606E66] dark:text-[#BAC5BF] line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#0D3328] dark:text-[#8FA89B] group-hover:translate-x-1 transition-transform">
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
