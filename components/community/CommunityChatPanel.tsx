'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

export function CommunityChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('community_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_chat_messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      // FIXED: Use authenticated client for RLS policies
      const { getAuthenticatedClient } = await import('@/lib/supabase/fetch');
      const authClient = await getAuthenticatedClient();
      
      const { data, error } = await authClient
        .from('community_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    try {
      // FIXED: Use server-side API route to bypass RLS issues
      const response = await fetch('/api/community/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username || 'Anonymous',
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Reload messages to show the new one
      await loadMessages();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center text-[#A9A9B3] font-sans">
        Please connect your wallet to join the chat
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="border-b border-[#1e1f22] p-4">
        <h2 className="text-lg font-display font-semibold text-white">
          Community Chat
        </h2>
        <p className="text-sm text-[#A9A9B3] font-sans">
          Chat with the TradeIQ community
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-[#A9A9B3] font-sans">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#A9A9B3] font-sans">
            No messages yet. Be the first to say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} currentUserId={user.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={!user} />
    </div>
  );
}

