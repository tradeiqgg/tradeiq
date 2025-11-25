// =====================================================================
// CHAPTER 9: Competition Tabs
// =====================================================================

'use client';

import React from 'react';

type TabId = 'overview' | 'leaderboard' | 'submit' | 'replay' | 'rules';

interface CompetitionTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function CompetitionTabs({ activeTab, onTabChange }: CompetitionTabsProps) {
  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'submit', label: 'Submit', icon: '📥' },
    { id: 'replay', label: 'Replay', icon: '🔁' },
    { id: 'rules', label: 'Rules', icon: '📜' },
  ];

  return (
    <div className="competition-tabs border-b border-gray-700 flex overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === tab.id
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

