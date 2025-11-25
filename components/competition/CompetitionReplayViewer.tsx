// =====================================================================
// CHAPTER 9: Competition Replay Viewer
// =====================================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { BacktestResult } from '@/lib/backtester/types';
import { BacktestChart } from '../ide/backtest/BacktestChart';
import { BacktestEquityChart } from '../ide/backtest/BacktestEquityChart';
import { BacktestDrawdownChart } from '../ide/backtest/BacktestDrawdownChart';
import { BacktestTradeList } from '../ide/backtest/BacktestTradeList';
import { BacktestLogs } from '../ide/backtest/BacktestLogs';

interface CompetitionReplayViewerProps {
  competitionId: string;
  submissionId?: string;
}

export function CompetitionReplayViewer({
  competitionId,
  submissionId,
}: CompetitionReplayViewerProps) {
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chart' | 'equity' | 'drawdown' | 'trades' | 'logs'>('chart');

  useEffect(() => {
    loadReplay();
  }, [competitionId, submissionId]);

  const loadReplay = async () => {
    setLoading(true);
    try {
      // Load replay data from API
      // const response = await fetch(`/api/competition/replay/${competitionId}/${submissionId}`);
      // const data = await response.json();
      // setResult(data.result);
      setResult(null); // Mock for now
    } catch (error) {
      console.error('Error loading replay:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="competition-replay-viewer p-6">
        <div className="text-gray-400">Loading replay...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="competition-replay-viewer p-6">
        <div className="text-gray-400">No replay data available</div>
      </div>
    );
  }

  return (
    <div className="competition-replay-viewer h-full flex flex-col">
      <div className="replay-header p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-2">Replay Viewer</h2>
        <p className="text-sm text-gray-400">
          Read-only view of competition submission backtest
        </p>
      </div>

      {/* Tabs */}
      <div className="replay-tabs border-b border-gray-700 flex">
        {[
          { id: 'chart', label: 'Chart' },
          { id: 'equity', label: 'Equity' },
          { id: 'drawdown', label: 'Drawdown' },
          { id: 'trades', label: 'Trades' },
          { id: 'logs', label: 'Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* Content */}
      <div className="replay-content flex-1 overflow-auto">
        {activeTab === 'chart' && <BacktestChart result={result} />}
        {activeTab === 'equity' && <BacktestEquityChart result={result} />}
        {activeTab === 'drawdown' && <BacktestDrawdownChart result={result} />}
        {activeTab === 'trades' && <BacktestTradeList result={result} />}
        {activeTab === 'logs' && <BacktestLogs result={result} />}
      </div>
    </div>
  );
}

