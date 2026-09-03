'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChatMessageData } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { ChatEmptyState } from './ChatEmptyState';
import { MOCK_DEFAULT_CONVERSATION, MOCK_STANDARDS_ELECTRIC_HEATER, MOCK_SOURCES, getChatConversationById } from '@/data/mockChatData';
import { Plus, History, Sparkles, Loader2 } from 'lucide-react';

interface ChatViewProps {
  initialConversationId?: string;
  initialPrompt?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialConversationId,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    if (initialConversationId) {
      const conv = getChatConversationById(initialConversationId);
      return conv.messages;
    }
    if (initialPrompt) {
      return MOCK_DEFAULT_CONVERSATION.messages;
    }
    return [];
  });

  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleResetChat = () => {
    setMessages([]);
    setIsThinking(false);
  };

  const handleSendMessage = (content: string) => {
    const userMsg: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      let assistantMsg: ChatMessageData;

      if (
        content.toLowerCase().includes('heater') ||
        content.toLowerCase().includes('immersion') ||
        content.toLowerCase().includes('is 302')
      ) {
        assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `For manufacturing electric immersion water heaters in India, compliance with the **IS 302 series** is mandatory under the Electrical Appliances (Quality Control) Order.

### Recommended Compliance Pathway:
1. **Primary Safety Standard:** Comply with **IS 302 (Part 2/Sec 201)** in conjunction with **IS 302 (Part 1)**.
2. **Certification Scheme:** Standard Mark (ISI) under BIS Scheme-I is compulsory before commercial distribution.
3. **Molded Plugs:** The attached supply cord must independently conform to **IS 1293**.`,
          standard_cards: MOCK_STANDARDS_ELECTRIC_HEATER,
          source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
          uncertainty_notice: 'Ensure heating element sheath material meets corrosion resistance criteria for the specific regional water hardness tier targeted.',
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (content.toLowerCase().includes('led') || content.toLowerCase().includes('lamp') || content.toLowerCase().includes('16102')) {
        assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `Self-ballasted LED lamps for general lighting services are governed by **IS 16102 (Part 1)** for safety and **IS 16102 (Part 2)** for performance requirements.

### Key BIS Requirements for LED Lamps:
- **Compulsory Registration Scheme (CRS):** Covered under MeitY / BIS Compulsory Registration Order (CRO).
- **Mandatory Safety Tests:** Insulation resistance, electrical strength, mechanical strength of lamp caps, and resistance to heat and fire.`,
          standard_cards: [
            {
              is_number: 'IS 16102 (Part 1): 2012',
              title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 1: Safety Requirements',
              relevance: 'highly_relevant',
              status: 'active',
              why_applicable: 'Mandatory standard under MeitY Compulsory Registration Scheme (CRS) for all self-ballasted LED lamps.',
              source_refs: [MOCK_SOURCES.bisScheme1],
              is_saved: false,
            },
            {
              is_number: 'IS 16102 (Part 2): 2012',
              title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 2: Performance Requirements',
              relevance: 'relevant',
              status: 'active',
              why_applicable: 'Prescribes lumen maintenance, power factor (>= 0.9), efficacy, and color temperature tolerances.',
              source_refs: [MOCK_SOURCES.bisScheme1],
              is_saved: false,
            },
          ],
          source_refs: [MOCK_SOURCES.bisScheme1],
          uncertainty_notice: 'Check specific BEE (Bureau of Energy Efficiency) star rating mandates in addition to BIS safety certification.',
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `Based on your inquiry: "${content}", BISaarthi has retrieved relevant Indian Standards and regulatory procedures from the authoritative BIS knowledge repository.

### Summary Guidance:
- Indian Standards (IS) establish the statutory benchmarks for product safety, dimensional specifications, and quality control.
- To obtain the ISI mark or CRS registration, testing must be completed at a BIS-recognized or NABL-accredited laboratory.`,
          standard_cards: [
            {
              is_number: 'IS 302 (Part 1): 2024',
              title: 'Safety of Household and Similar Electrical Appliances — General Requirements',
              relevance: 'relevant',
              status: 'active',
              why_applicable: 'General reference safety standard for electrical equipment and components.',
              source_refs: [MOCK_SOURCES.bisIS302],
              is_saved: false,
            },
          ],
          source_refs: [MOCK_SOURCES.bisIS302],
          uncertainty_notice: 'Some requirements may depend on the exact product specification. Verify applicable requirements against the latest BIS source before certification or testing.',
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 700);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-white dark:bg-[#15221E] rounded-3xl border border-[#D9DDD8] dark:border-[#253831] shadow-xs overflow-hidden">
      {/* Chat Conversation Sub-Header */}
      <div className="h-14 px-4 sm:px-6 bg-[#FAF9F5] dark:bg-[#1B2B26]/80 border-b border-[#D9DDD8] dark:border-[#253831] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D9D5D] animate-pulse" />
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#18211D] dark:text-[#F7F5EF]">
              BISaarthi Guidance Chat
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/history"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#606E66] dark:text-[#BAC5BF] hover:text-[#0D3328] dark:hover:text-[#F7F5EF] hover:bg-[#EFECE6] dark:hover:bg-[#20312B] rounded-full transition-colors"
            title="View chat history"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </Link>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-[#FAF9F5] dark:bg-[#15221E] text-[#0D3328] dark:text-[#8FA89B] border border-[#D9DDD8] dark:border-[#253831] hover:bg-[#EFECE6] dark:hover:bg-[#20312B] rounded-full shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream / Empty State */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isEmpty ? (
          <ChatEmptyState onSelectPrompt={handleSendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* AI Thinking/Loading Indicator */}
            {isThinking && (
              <div className="flex justify-start mb-6 animate-in fade-in duration-150">
                <div className="w-full max-w-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0D3328] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-[#A7B8AE]" />
                  </div>
                  <div className="bg-[#FAF9F5] dark:bg-[#1B2B26] rounded-2xl rounded-tl-xs border border-[#D9DDD8] dark:border-[#253831] p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#606E66] dark:text-[#BAC5BF]">
                      <Sparkles className="w-3.5 h-3.5 text-[#5B8272] animate-pulse" />
                      <span>Searching Indian Standards and regulatory publications...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed/Sticky Bottom Chat Composer */}
      <ChatComposer onSendMessage={handleSendMessage} isLoading={isThinking} />
    </div>
  );
};
