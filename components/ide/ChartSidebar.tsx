'use client';

import { useState } from 'react';

interface ChartSidebarProps {
  strategyId: string;
}

export function ChartSidebar({ strategyId }: ChartSidebarProps) {
  const [symbol, setSymbol] = useState('BTC/USD');

  return (
    <div className="h-full flex flex-col bg-[#111214] overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1f22]">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F]">
          MARKET DATA
        </h2>
      </div>

      {/* Symbol Search */}
      <div className="p-3 border-b border-[#1e1f22]">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Search symbol..."
          className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
        />
      </div>

      {/* Chart Placeholder */}
      <div className="flex-1 p-4 flex items-center justify-center border-b border-[#1e1f22]">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-xs font-mono text-[#6f7177]">
            Chart viewer
          </div>
          <div className="text-xs font-mono text-[#A9A9B3] mt-2">
            {symbol}
          </div>
        </div>
      </div>

      {/* Indicator Preview */}
      <div className="p-3 border-b border-[#1e1f22]">
        <div className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2">
          INDICATORS
        </div>
        <div className="space-y-1 text-xs font-mono text-[#A9A9B3]">
          <div>• Moving Average (20)</div>
          <div>• RSI (14)</div>
          <div>• Volume</div>
        </div>
      </div>

      {/* Research Tools */}
      <div className="p-3">
        <div className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2">
          RESEARCH TOOLS
        </div>
        <div className="space-y-2">
          <button className="w-full text-left px-2 py-1 text-xs font-mono text-[#A9A9B3] hover:bg-[#151618] rounded">
            🔍 Explain this chart
          </button>
          <button className="w-full text-left px-2 py-1 text-xs font-mono text-[#A9A9B3] hover:bg-[#151618] rounded">
            📊 Find patterns
          </button>
          <button className="w-full text-left px-2 py-1 text-xs font-mono text-[#A9A9B3] hover:bg-[#151618] rounded">
            💡 Suggest indicators
          </button>
        </div>
      </div>
    </div>
  );
}

