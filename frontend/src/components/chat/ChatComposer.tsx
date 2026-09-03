'use client';

import React, { useState, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

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
    <div className="w-full bg-[#FAF9F5] dark:bg-[#15221E] border-t border-[#D9DDD8] dark:border-[#253831] p-3 sm:p-4 shadow-lg">
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="relative flex items-end bg-white dark:bg-[#1B2B26] rounded-2xl border border-[#D9DDD8] dark:border-[#253831] focus-within:border-[#0D3328] focus-within:ring-2 focus-within:ring-[#5B8272]/20 transition-all p-2 shadow-2xs">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            className="flex-1 max-h-40 min-h-[44px] bg-transparent border-0 resize-none py-2.5 px-3 text-xs sm:text-sm text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] focus:outline-none leading-relaxed disabled:opacity-50"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="mb-1 p-2 rounded-full bg-[#0D3328] hover:bg-[#164B3A] disabled:bg-[#D9DDD8] dark:disabled:bg-[#253831] text-white disabled:text-[#8B978F] disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs cursor-pointer"
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8B978F] px-1">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE6] dark:bg-[#20312B] border border-[#D9DDD8] dark:border-[#253831] text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE6] dark:bg-[#20312B] border border-[#D9DDD8] dark:border-[#253831] text-[10px]">Shift+Enter</kbd> for new line</span>
          <span className="hidden sm:inline">Sources: Indian Standards & QCOs</span>
        </div>
      </div>
    </div>
  );
};
