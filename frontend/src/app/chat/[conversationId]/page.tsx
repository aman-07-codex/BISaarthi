import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatView } from '@/components/chat/ChatView';

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
  const { conversationId } = await params;

  return (
    <AppLayout>
      <ChatView initialConversationId={conversationId} />
    </AppLayout>
  );
}
