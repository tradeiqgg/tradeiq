// =====================================================================
// CHAPTER 8: Backtest History
// =====================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBacktestStore } from '@/stores/backtestStore';
import { useAuthStore } from '@/stores/authStore';
import type { Backtest } from '@/types';

interface BacktestHistoryProps {
  strategyId: string;
}

export function BacktestHistory({ strategyId }: BacktestHistoryProps) {
  const [loading, setLoading] = useState(true);
  const { backtests, fetchBacktests } = useBacktestStore();
  const { user } = useAuthStore();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.id) {
        await fetchBacktests(user.id);
      }
    } catch (error) {
      console.error('Failed to load backtest history:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchBacktests]);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [strategyId, user?.id, loadHistory]);

  // Filter backtests for this strategy
  const strategyBacktests = backtests.filter(
    (bt) => bt.strategy_id === strategyId
  );

  if (loading) {
    return (
      <div className="backtest-history p-4">
        <h3 className="text-lg font-semibold mb-4">Backtest History</h3>
        <div className="text-gray-400">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="backtest-history p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Backtest History</h3>
        <button
          onClick={loadHistory}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {strategyBacktests.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <div>No backtest history found</div>
          <div className="text-sm mt-2">Run a backtest to see results here</div>
        </div>
      ) : (
        <div className="history-list space-y-3">
          {strategyBacktests.map((entry) => {
            const trades = Array.isArray(entry.trades) ? entry.trades : [];
            const winningTrades = trades.filter((t: any) => t.profit > 0).length;
            const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
            const pnlPct = entry.pnl ? ((entry.pnl / 1000) * 100) : 0; // Assuming initial balance of 1000
            
            return (
              <div
                key={entry.id}
                className="history-entry bg-[#111214] border border-[#1e1f22] rounded p-4 hover:bg-[#151618] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="entry-info flex-1">
                    <div className="text-xs text-[#6f7177] font-mono mb-1">
                      {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
                    </div>
                    <div className="text-sm font-medium text-white mb-2">
                      {entry.chart_asset || 'Unknown Asset'}
                    </div>
                    <div className="flex gap-4 text-xs text-[#6f7177]">
                      <span>Trades: {trades.length}</span>
                      {entry.pnl !== undefined && (
                        <span>PnL: ${entry.pnl.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="entry-stats flex gap-6 ml-4">
                    <div className="stat text-center">
                      <div className={`text-lg font-bold ${pnlPct >= 0 ? 'text-[#7CFF4F]' : 'text-[#FF617D]'}`}>
                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                      <div className="text-xs text-[#6f7177]">PnL</div>
                    </div>
                    <div className="stat text-center">
                      <div className="text-lg font-bold text-white">{winRate.toFixed(1)}%</div>
                      <div className="text-xs text-[#6f7177]">Win Rate</div>
                    </div>
                    <div className="stat text-center">
                      <div className="text-lg font-bold text-white">{trades.length}</div>
                      <div className="text-xs text-[#6f7177]">Trades</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

