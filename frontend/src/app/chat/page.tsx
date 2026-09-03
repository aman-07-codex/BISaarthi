'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatView } from '@/components/chat/ChatView';

function ChatContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt') || undefined;
  const conversationId = searchParams.get('id') || undefined;

  return <ChatView initialPrompt={prompt} initialConversationId={conversationId} />;
}

export default function ChatPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading chat session...</div>}>
        <ChatContent />
      </Suspense>
    </AppLayout>
  );
}
