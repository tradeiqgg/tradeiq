'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';

interface StrategySidebarProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function StrategySidebar({ strategy, onAutoSave }: StrategySidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    explorer: true,
    files: false,
    ai: false,
    backtests: false,
    history: false,
    logs: false,
    plugins: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1f22]">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F]">
          STRATEGY EXPLORER
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Strategy Explorer */}
        <div>
          <button
            onClick={() => toggleSection('explorer')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>📁 Strategy Files</span>
            <span className="text-[#7CFF4F]">{expandedSections.explorer ? '▼' : '▶'}</span>
          </button>
          {expandedSections.explorer && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                📄 english.txt
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                🧩 blocks.json
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                ⚙️ logic.json
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                📝 pseudocode.txt
              </div>
            </div>
          )}
        </div>

        {/* Files / Blocks / JSON View */}
        <div>
          <button
            onClick={() => toggleSection('files')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>📋 View Mode</span>
            <span className="text-[#7CFF4F]">{expandedSections.files ? '▼' : '▶'}</span>
          </button>
          {expandedSections.files && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#7CFF4F] py-1 px-2 bg-[#7CFF4F]/10 cursor-pointer">
                English Mode
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                Block Mode
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                JSON Mode
              </div>
            </div>
          )}
        </div>

        {/* AI Tools */}
        <div>
          <button
            onClick={() => toggleSection('ai')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>🤖 AI Tools</span>
            <span className="text-[#7CFF4F]">{expandedSections.ai ? '▼' : '▶'}</span>
          </button>
          {expandedSections.ai && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                💬 Chat Assistant
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                ✨ Convert to Logic
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                🔍 Analyze Strategy
              </div>
            </div>
          )}
        </div>

        {/* Backtests */}
        <div>
          <button
            onClick={() => toggleSection('backtests')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>📊 Backtests</span>
            <span className="text-[#7CFF4F]">{expandedSections.backtests ? '▼' : '▶'}</span>
          </button>
          {expandedSections.backtests && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                ▶ Run New Backtest
              </div>
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                📈 View History
              </div>
            </div>
          )}
        </div>

        {/* Run History */}
        <div>
          <button
            onClick={() => toggleSection('history')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>🕐 Run History</span>
            <span className="text-[#7CFF4F]">{expandedSections.history ? '▼' : '▶'}</span>
          </button>
          {expandedSections.history && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2">
                No runs yet
              </div>
            </div>
          )}
        </div>

        {/* Logs */}
        <div>
          <button
            onClick={() => toggleSection('logs')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>📜 Logs</span>
            <span className="text-[#7CFF4F]">{expandedSections.logs ? '▼' : '▶'}</span>
          </button>
          {expandedSections.logs && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2">
                View terminal below
              </div>
            </div>
          )}
        </div>

        {/* Marketplace Plugins */}
        <div>
          <button
            onClick={() => toggleSection('plugins')}
            className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-[#151618] transition-colors flex items-center justify-between"
          >
            <span>🔌 Plugins</span>
            <span className="text-[#7CFF4F]">{expandedSections.plugins ? '▼' : '▶'}</span>
          </button>
          {expandedSections.plugins && (
            <div className="pl-6 pb-2 space-y-1">
              <div className="text-xs font-mono text-[#A9A9B3] py-1 px-2 hover:bg-[#151618] cursor-pointer">
                Browse Marketplace
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e1f22] text-xs font-mono text-[#6f7177]">
        <div>Blocks: {strategy.block_schema?.blocks?.length || 0}</div>
        <div>Nodes: {Object.keys(strategy.json_logic || {}).length}</div>
      </div>
    </div>
  );
}

