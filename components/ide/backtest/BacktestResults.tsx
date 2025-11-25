// =====================================================================
// CHAPTER 8: Backtest Results - Tabbed View
// =====================================================================

'use client';

import React, { useState } from 'react';
import type { BacktestResult } from '@/lib/backtester/types';
import { BacktestChart } from './BacktestChart';
import { BacktestEquityChart } from './BacktestEquityChart';
import { BacktestDrawdownChart } from './BacktestDrawdownChart';
import { BacktestTradeList } from './BacktestTradeList';
import { BacktestHeatmap } from './BacktestHeatmap';
import { BacktestLogs } from './BacktestLogs';
import { BacktestHistory } from './BacktestHistory';

type TabId = 'charts' | 'equity' | 'drawdown' | 'trades' | 'rules' | 'logs' | 'history';

interface BacktestResultsProps {
  result: BacktestResult;
}

export function BacktestResults({ result }: BacktestResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('charts');

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'charts', label: 'Charts' },
    { id: 'equity', label: 'Equity' },
    { id: 'drawdown', label: 'Drawdown' },
    { id: 'trades', label: 'Trades' },
    { id: 'rules', label: 'Rules' },
    { id: 'logs', label: 'Logs' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="backtest-results h-full flex flex-col">
      {/* Summary Bar */}
      <div className="backtest-summary bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="summary-stats flex gap-6">
            <div className="stat">
              <span className="text-gray-400 text-sm">PnL</span>
              <span className={`text-lg font-bold ml-2 ${result.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.pnlPct >= 0 ? '+' : ''}{result.pnlPct.toFixed(2)}%
              </span>
            </div>
            <div className="stat">
              <span className="text-gray-400 text-sm">Win Rate</span>
              <span className="text-lg font-bold ml-2 text-white">
                {result.winRate.toFixed(2)}%
              </span>
            </div>
            <div className="stat">
              <span className="text-gray-400 text-sm">Trades</span>
              <span className="text-lg font-bold ml-2 text-white">
                {result.trades.length}
              </span>
            </div>
            <div className="stat">
              <span className="text-gray-400 text-sm">Max DD</span>
              <span className="text-lg font-bold ml-2 text-red-400">
                {result.maxDrawdownPct.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="execution-time text-sm text-gray-400">
            Executed in {(result.executionTime / 1000).toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="backtest-tabs border-b border-gray-700 flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="backtest-tab-content flex-1 overflow-auto">
        {activeTab === 'charts' && <BacktestChart result={result} />}
        {activeTab === 'equity' && <BacktestEquityChart result={result} />}
        {activeTab === 'drawdown' && <BacktestDrawdownChart result={result} />}
        {activeTab === 'trades' && <BacktestTradeList result={result} />}
        {activeTab === 'rules' && <BacktestHeatmap result={result} />}
        {activeTab === 'logs' && <BacktestLogs result={result} />}
        {activeTab === 'history' && <BacktestHistory strategyId={result.strategy.id || ''} />}
      </div>
    </div>
  );
}

