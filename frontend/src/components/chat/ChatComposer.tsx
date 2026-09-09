'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatComposerProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder,
}) => {
  const { language, t } = useLanguage();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder = placeholder || t('chat.inputPlaceholder');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

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
  };

  return (
    <div className="w-full bg-[#FAF9F5]/90 dark:bg-[#15221E]/90 backdrop-blur-xs border-t border-[#D9DDD8] dark:border-[#253831] p-3 sm:p-4 shrink-0">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Floating Input Container */}
        <div className="relative flex items-end bg-white dark:bg-[#1B2B26] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] focus-within:border-[#0D3328] dark:focus-within:border-[#5B8272] focus-within:ring-2 focus-within:ring-[#5B8272]/20 transition-all p-1.5 sm:p-2 shadow-xs">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={defaultPlaceholder}
            rows={1}
            className="flex-1 max-h-36 min-h-[42px] bg-transparent border-0 resize-none py-2 px-3 text-xs sm:text-sm text-[#18211D] dark:text-[#F7F5EF] placeholder-[#8B978F] focus:outline-none leading-relaxed disabled:opacity-50"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="mb-0.5 p-2 rounded-full bg-[#0D3328] hover:bg-[#164B3A] disabled:bg-[#EFECE6] dark:disabled:bg-[#20312B] text-white disabled:text-[#8B978F] disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs cursor-pointer"
            title={language === 'HI' ? 'संदेश भेजें (Enter)' : 'Send Message (Enter)'}
            aria-label={language === 'HI' ? 'संदेश भेजें' : 'Send Message'}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Subtext */}
        <div className="flex flex-wrap items-center justify-between text-[10.5px] text-[#8B978F] px-2 gap-1">
          <span>{t('chat.composerSubtext')}</span>
          <span className="hidden sm:inline">{t('chat.composerTrust')}</span>
        </div>
      </div>
    </div>
  );
};

