'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Ask about an Indian Standard, product, requirement, testing or certification...",
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-lg">
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="relative flex items-end bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            className="flex-1 max-h-40 min-h-[44px] bg-transparent border-0 resize-none py-2.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none leading-relaxed disabled:opacity-50"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="mb-1 p-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs cursor-pointer"
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 px-1">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">Shift+Enter</kbd> for new line</span>
          <span className="hidden sm:inline">Sources: Indian Standards & QCOs</span>
        </div>
      </div>
    </div>
  );
};
