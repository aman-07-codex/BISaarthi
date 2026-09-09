'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChatMessageData, SourceRef } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { ChatEmptyState } from './ChatEmptyState';
import { sendChatMessage, APIError } from '@/lib/api';
import { Plus, History, ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatViewProps {
  initialConversationId?: string;
  initialPrompt?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialPrompt,
}) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialPromptSentRef = useRef<boolean>(false);

  const handleResetChat = () => {
    setMessages([]);
    setIsThinking(false);
  };

  const handleSendMessage = React.useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const langCode = language.toLowerCase() === 'hi' ? 'hi' : 'en';
      const response = await sendChatMessage({
        message: content,
        language: langCode,
        top_k: 5,
      });

      const sources: SourceRef[] = (response.citations || []).map((c) => ({
        source_id: c.chunk_id,
        title: c.formatted_citation,
        reference_url: 'https://standards.bis.gov.in',
        reliability_tier: 'primary',
        source_type: 'bis_standard',
      }));

      const rawMode = response.execution_metadata?.response_mode;
      const responseMode: 'rag' | 'metadata_fallback' | 'insufficient_context' =
        rawMode === 'metadata_fallback' || rawMode === 'rag' || rawMode === 'insufficient_context'
          ? rawMode
          : response.grounding_status === 'insufficient_context'
          ? 'insufficient_context'
          : response.grounding_status === 'partially_grounded'
          ? 'metadata_fallback'
          : 'rag';

      const uncertaintyNotice =
        response.grounding_status === 'insufficient_context'
          ? (langCode === 'hi'
              ? 'सूचना: बीआईएस सारथी के वर्तमान संदर्भ डेटाबेस में 0 पूर्ण-पाठ खंड उपलब्ध हैं। यह उत्तर आधिकारिक बीआईएस मानकों के आधार पर सीमित है।'
              : 'Notice: Current production retrieval index contains 0 production chunks. BISaarthi provides grounded responses solely when verified standard text is retrieved.')
          : (response.warnings && response.warnings.length > 0 ? response.warnings.join(' • ') : undefined);

      const assistantMsg: ChatMessageData = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        response_mode: responseMode,
        grounding_status: response.grounding_status,
        grounded: response.grounded,
        citations: response.citations,
        source_refs: sources.length > 0 ? sources : undefined,
        uncertainty_notice: uncertaintyNotice,
        execution_metadata: response.execution_metadata,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);

      // Persist real conversation summary to local storage for Dashboard and History pages
      try {
        const storedHistoryStr = localStorage.getItem('bisaarthi_chat_history');
        const existingHistory = storedHistoryStr ? JSON.parse(storedHistoryStr) : [];
        const newEntry = {
          id: `conv-${Date.now()}`,
          title: content.slice(0, 60) + (content.length > 60 ? '...' : ''),
          preview: response.answer.slice(0, 100) + (response.answer.length > 100 ? '...' : ''),
          updated_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          time_bucket: 'today',
        };
        const updated = [newEntry, ...existingHistory.filter((item: { title: string }) => item.title !== newEntry.title)].slice(0, 20);
        localStorage.setItem('bisaarthi_chat_history', JSON.stringify(updated));
      } catch {
        // Local storage write fails silently in restricted private modes
      }
    } catch (err) {
      setIsThinking(false);
      const msg = err instanceof APIError ? err.message : 'Unable to reach BISaarthi API.';
      const isHindi = language.toLowerCase() === 'hi';
      const errorMsg: ChatMessageData = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: isHindi
          ? `⚠️ **कनेक्शन त्रुटि:** ${msg}\n\nकृपया सुनिश्चित करें कि बीआईएस सारथी FastAPI बैकएंड सेवा \`http://localhost:8000/api\` पर सक्रिय है।`
          : `⚠️ **Connection Error:** ${msg}\n\nPlease ensure the BISaarthi FastAPI backend is running at \`http://localhost:8000/api\`.`,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }, [language]);

  useEffect(() => {
    if (initialPrompt && !initialPromptSentRef.current) {
      initialPromptSentRef.current = true;
      const timer = setTimeout(() => {
        void handleSendMessage(initialPrompt);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, handleSendMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9DDD8] dark:border-[#253831] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D9D5D] animate-pulse" />
          <h1 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF] flex items-center gap-1.5">
            <span>{language === 'HI' ? 'बीआईएस अनुपालन सहायक' : 'BIS Compliance Assistant'}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8EFEA] dark:bg-[#1B2B26] text-[#0D3328] dark:text-[#8FA89B] border border-[#D9DDD8] dark:border-[#253831]">
              RAG Engine
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] hover:bg-[#FAF9F5] transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('btn.newChat')}</span>
            </button>
          )}
          <Link
            href="/history"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-white bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] hover:bg-[#FAF9F5] transition-all cursor-pointer shadow-2xs"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.history')}</span>
          </Link>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <ChatEmptyState onSelectPrompt={handleSendMessage} />
        ) : (
          <div className="space-y-4 pt-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isThinking && (
              <div className="flex justify-start mb-6 animate-in fade-in duration-150">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0D3328] dark:bg-[#1E3B30] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-[#5B8272]/40">
                    <ShieldCheck className="w-4 h-4 text-[#A7B8AE]" />
                  </div>
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-white dark:bg-[#15221E] border border-[#D9DDD8] dark:border-[#253831] shadow-2xs">
                    <Loader2 className="w-4 h-4 text-[#5B8272] animate-spin" />
                    <span className="text-xs text-[#606E66] dark:text-[#BAC5BF] font-medium">
                      {t('chat.loadingText')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Persistent Bottom Composer Area */}
      <div className="pt-3 border-t border-[#D9DDD8] dark:border-[#253831] shrink-0">
        <ChatComposer onSendMessage={handleSendMessage} isLoading={isThinking} />
        <div className="flex items-center justify-between text-[11px] text-[#8B978F] pt-2 px-1">
          <span className="flex items-center gap-1 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D9D5D] shrink-0" />
            <span>
              {language === 'HI'
                ? 'संदर्भ-आधारित आरएजी इंजन: असत्यापित दावों से सुरक्षित'
                : 'Context-Grounded Engine: Strict anti-hallucination guardrails active'}
            </span>
          </span>
          <span className="hidden sm:inline font-mono">
            {language === 'HI' ? 'भाषा: हिंदी' : 'Language: English'}
          </span>
        </div>
      </div>
    </div>
  );
};

