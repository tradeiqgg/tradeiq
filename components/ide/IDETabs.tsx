'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';
import { TQLEditor } from './TQLEditor';
import { BlockEditor } from './BlockEditor';
import { JSONEditor } from './JSONEditor';
import { BacktestPanel } from './backtest/BacktestPanel';
import { AIChatPanel } from './AIChatPanel';
import { LogsPanel } from './LogsPanel';
import { MarketResearchPanel } from './MarketResearchPanel';
import { SettingsPanel } from './SettingsPanel';
import { LiveMonitorPanel } from './live/LiveMonitorPanel';
import { AlertsPanel } from './alerts/AlertsPanel';
import { ExampleStrategiesPanel } from './ExampleStrategiesPanel';

import type { BlockInstance } from './BlockPropertiesPanel';
import { exampleStrategies, type ExampleStrategy } from '@/lib/tql/exampleStrategies';

interface IDETabsProps {
  activeTab: 'english' | 'blocks' | 'json' | 'backtests' | 'chat' | 'logs' | 'research' | 'settings' | 'live' | 'alerts' | 'examples';
  onTabChange: (tab: 'english' | 'blocks' | 'json' | 'backtests' | 'chat' | 'logs' | 'research' | 'settings' | 'live' | 'alerts' | 'examples') => void;
  strategy?: Strategy;
  onAutoSave?: (updates: Partial<Strategy>) => void;
  selectedBlock?: BlockInstance | null;
  onSelectBlock?: (block: BlockInstance | null) => void;
}

export function IDETabs({ activeTab, onTabChange, strategy, onAutoSave, selectedBlock, onSelectBlock }: IDETabsProps) {
  const tabs = [
    { id: 'english' as const, label: 'TQL Code', icon: '💻' },
    { id: 'blocks' as const, label: 'Block Mode', icon: '🧩' },
    { id: 'json' as const, label: 'JSON / Advanced', icon: '⚙️' },
    { id: 'backtests' as const, label: 'Backtests', icon: '📊' },
    { id: 'examples' as const, label: 'Examples', icon: '📚' },
    { id: 'live' as const, label: 'Live Monitor', icon: '🔴' },
    { id: 'alerts' as const, label: 'Alerts', icon: '🔔' },
    { id: 'chat' as const, label: 'AI Chat', icon: '💬' },
    { id: 'logs' as const, label: 'Logs & Output', icon: '📜' },
    { id: 'research' as const, label: 'Market Research', icon: '🔍' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
  ];

  const handleLoadExample = (example: ExampleStrategy) => {
    if (!onAutoSave) return;
    
    // Load example strategy
    onAutoSave({
      title: example.name,
      strategy_tql: example.tql,
      strategy_json: example.strategy,
      json_logic: example.strategy,
      raw_prompt: example.description,
    });
    
    // Switch to TQL code view
    onTabChange('english');
  };

  if (!strategy || !onAutoSave) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 h-full text-xs font-mono transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-[#7CFF4F] border-b-2 border-[#7CFF4F] bg-[#151618]'
                : 'text-[#A9A9B3] hover:text-white hover:bg-[#151618]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'english' && (
          <TQLEditor strategy={strategy} onAutoSave={onAutoSave} />
        )}
        {activeTab === 'blocks' && (
          <BlockEditor 
            strategy={strategy} 
            onAutoSave={onAutoSave}
            selectedBlock={selectedBlock}
            onSelectBlock={onSelectBlock}
          />
        )}
        {activeTab === 'json' && (
          <JSONEditor strategy={strategy} onAutoSave={onAutoSave} />
        )}
        {activeTab === 'backtests' && (
          <BacktestPanel strategy={strategy} />
        )}
        {activeTab === 'examples' && (
          <ExampleStrategiesPanel onLoadStrategy={handleLoadExample} />
        )}
        {activeTab === 'live' && (
          <LiveMonitorPanel strategy={strategy} />
        )}
        {activeTab === 'alerts' && (
          <AlertsPanel strategy={strategy} />
        )}
        {activeTab === 'chat' && (
          <AIChatPanel strategy={strategy} onAutoSave={onAutoSave} />
        )}
        {activeTab === 'logs' && (
          <LogsPanel strategyId={strategy.id} />
        )}
        {activeTab === 'research' && (
          <MarketResearchPanel strategyId={strategy.id} />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel strategy={strategy} onAutoSave={onAutoSave} />
        )}
      </div>
    </div>
  );
}

