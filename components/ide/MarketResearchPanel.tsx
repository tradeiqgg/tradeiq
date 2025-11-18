'use client';

import { useState } from 'react';

interface MarketResearchPanelProps {
  strategyId: string;
}

export function MarketResearchPanel({ strategyId }: MarketResearchPanelProps) {
  const [query, setQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center">
        <div className="text-xs font-mono text-[#7CFF4F]">🔍 MARKET RESEARCH</div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search market data, patterns, indicators..."
            className="w-full px-3 py-2 bg-[#111214] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F]"
          />
        </div>

        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-sm font-mono text-[#A9A9B3]">
            Market research tools coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

