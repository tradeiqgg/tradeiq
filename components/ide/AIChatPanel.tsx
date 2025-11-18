'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';

interface AIChatPanelProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function AIChatPanel({ strategy, onAutoSave }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI trading assistant. I can help you improve your strategy "${strategy.title || 'Untitled Strategy'}". What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: `I understand you're asking about "${input}". This is a placeholder response. In the full implementation, this would connect to your AI service to provide real-time assistance with your trading strategy.`,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center">
        <div className="text-xs font-mono text-[#7CFF4F]">
          💬 AI Chat Assistant
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded ${
                msg.role === 'user'
                  ? 'bg-[#7CFF4F] text-[#0B0B0C]'
                  : 'bg-[#111214] text-white border border-[#1e1f22]'
              }`}
            >
              <div className="text-sm font-mono whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#111214] border border-[#1e1f22] px-4 py-2 rounded">
              <div className="text-sm font-mono text-[#A9A9B3]">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#1e1f22] bg-[#111214] p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your strategy..."
            className="flex-1 px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] font-mono text-sm hover:bg-[#70e84b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}

