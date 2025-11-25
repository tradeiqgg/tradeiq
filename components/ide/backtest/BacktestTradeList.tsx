// =====================================================================
// CHAPTER 8: Trade List Table
// =====================================================================

'use client';

import React, { useState } from 'react';
import type { BacktestResult, TradeRecord } from '@/lib/backtester/types';

interface BacktestTradeListProps {
  result: BacktestResult;
}

export function BacktestTradeList({ result }: BacktestTradeListProps) {
  const [sortBy, setSortBy] = useState<keyof TradeRecord>('entryTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const sortedTrades = [...result.trades].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: keyof TradeRecord) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="backtest-trade-list p-4">
      <h3 className="text-lg font-semibold mb-4">
        Trades ({result.trades.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th
                className="text-left p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSort('entryTime')}
              >
                Entry Time
                {sortBy === 'entryTime' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th
                className="text-left p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSort('exitTime')}
              >
                Exit Time
                {sortBy === 'exitTime' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="text-left p-2">Direction</th>
              <th
                className="text-right p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSort('entryPrice')}
              >
                Entry Price
                {sortBy === 'entryPrice' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th
                className="text-right p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSort('exitPrice')}
              >
                Exit Price
                {sortBy === 'exitPrice' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="text-right p-2">Size</th>
              <th
                className="text-right p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSort('profit')}
              >
                Profit ($)
                {sortBy === 'profit' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th
                className="text-right p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSort('returnPct')}
              >
                Profit (%)
                {sortBy === 'returnPct' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="text-left p-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <tr
                key={trade.id}
                className={`border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${
                  selectedTrade === trade.id ? 'bg-gray-800' : ''
                }`}
                onClick={() => setSelectedTrade(selectedTrade === trade.id ? null : trade.id)}
              >
                <td className="p-2 text-sm">{formatDate(trade.entryTime)}</td>
                <td className="p-2 text-sm">{formatDate(trade.exitTime)}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      trade.direction === 'long'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {trade.direction.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 text-right text-sm">{formatCurrency(trade.entryPrice)}</td>
                <td className="p-2 text-right text-sm">{formatCurrency(trade.exitPrice)}</td>
                <td className="p-2 text-right text-sm">{trade.size.toFixed(4)}</td>
                <td
                  className={`p-2 text-right text-sm font-medium ${
                    trade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(trade.profit)}
                </td>
                <td
                  className={`p-2 text-right text-sm font-medium ${
                    trade.returnPct >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatPercent(trade.returnPct)}
                </td>
                <td className="p-2 text-sm text-gray-400">{trade.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

