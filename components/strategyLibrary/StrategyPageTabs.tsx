'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';

interface StrategyPageTabsProps {
  strategy: Strategy;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function StrategyPageTabs({
  strategy,
  activeTab,
  onTabChange,
}: StrategyPageTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tql', label: 'TQL' },
    { id: 'blocks', label: 'Blocks' },
    { id: 'json', label: 'JSON' },
    { id: 'backtests', label: 'Backtests' },
  ];

  return (
    <div className="border-b border-[#1e1f22] mb-6">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-3 font-sans text-sm font-medium transition-colors whitespace-nowrap
              border-b-2
              ${activeTab === tab.id
                ? 'border-[#7CFF4F] text-[#7CFF4F]'
                : 'border-transparent text-[#A9A9B3] hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

