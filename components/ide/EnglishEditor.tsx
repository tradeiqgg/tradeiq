'use client';

import { useState, useEffect } from 'react';
import type { Strategy } from '@/types';

interface EnglishEditorProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function EnglishEditor({ strategy, onAutoSave }: EnglishEditorProps) {
  const [title, setTitle] = useState(strategy.title || '');
  const [prompt, setPrompt] = useState(strategy.raw_prompt || '');
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    setTitle(strategy.title || '');
    setPrompt(strategy.raw_prompt || '');
  }, [strategy]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onAutoSave({ title: value });
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onAutoSave({ raw_prompt: value });
  };

  const handleConvert = async () => {
    if (!prompt.trim()) return;

    setIsConverting(true);
    try {
      // TODO: Call AI API to convert prompt
      // For now, create mock conversion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockJsonLogic = {
        condition: 'price > ma',
        action: 'buy',
      };

      const mockBlockSchema = {
        blocks: [
          { id: '1', type: 'condition', label: 'Price > Moving Average' },
          { id: '2', type: 'action', label: 'Buy' },
        ],
      };

      const mockPseudocode = `IF price > moving_average(20) THEN
  BUY 100 shares
END IF`;

      onAutoSave({
        json_logic: mockJsonLogic,
        block_schema: mockBlockSchema,
        pseudocode: mockPseudocode,
      });
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Toolbar */}
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
        <div className="text-xs font-mono text-[#A9A9B3]">
          English → AI Code Converter
        </div>
        <button
          onClick={handleConvert}
          disabled={!prompt.trim() || isConverting}
          className="px-4 py-1.5 text-xs font-mono bg-[#7CFF4F] text-[#0B0B0C] hover:bg-[#70e84b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          {isConverting ? 'CONVERTING...' : 'CONVERT TO LOGIC'}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        {/* Title Input */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
            STRATEGY TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="My Trading Strategy"
            className="w-full px-3 py-2 bg-[#111214] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F]"
          />
        </div>

        {/* Prompt Textarea */}
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
            DESCRIBE YOUR STRATEGY IN PLAIN ENGLISH
          </label>
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Example: Buy when price crosses above the 20-day moving average, sell when RSI is above 70..."
            className="flex-1 w-full px-3 py-2 bg-[#111214] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F] resize-none"
          />
        </div>

        {/* AI Suggestions Panel (Placeholder) */}
        <div className="border-t border-[#1e1f22] pt-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2">
            AI SUGGESTIONS
          </div>
          <div className="text-xs font-mono text-[#6f7177] italic">
            AI suggestions will appear here as you type...
          </div>
        </div>
      </div>
    </div>
  );
}

