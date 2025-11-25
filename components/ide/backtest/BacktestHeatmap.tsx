// =====================================================================
// CHAPTER 8: Rule Trigger Heatmap
// =====================================================================

'use client';

import React from 'react';
import type { BacktestResult } from '@/lib/backtester/types';

interface BacktestHeatmapProps {
  result: BacktestResult;
}

export function BacktestHeatmap({ result }: BacktestHeatmapProps) {
  // Extract rules from strategy
  const entryRules = result.strategy.rules?.entry || [];
  const exitRules = result.strategy.rules?.exit || [];
  const allRules = [...entryRules, ...exitRules];

  // Simplified heatmap - would need actual rule trigger data from backtest
  // For now, show rule structure
  const ruleRows = allRules.map((rule, index) => ({
    id: `rule-${index}`,
    name: index < entryRules.length ? `Entry Rule ${index + 1}` : `Exit Rule ${index - entryRules.length + 1}`,
    type: index < entryRules.length ? 'entry' : 'exit',
  }));

  return (
    <div className="backtest-heatmap p-4">
      <h3 className="text-lg font-semibold mb-4">Rule Trigger Heatmap</h3>
      <div className="heatmap-container overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2">Rule</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ruleRows.map((row) => (
              <tr key={row.id} className="border-b border-gray-800">
                <td className="p-2">{row.name}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      row.type === 'entry'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {row.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-2">
                  <span className="text-gray-400 text-sm">
                    Rule defined (heatmap visualization coming soon)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-sm text-gray-400">
          <p>Heatmap visualization will show rule trigger frequency across candles.</p>
          <p className="mt-2">
            <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>
            Green = Condition true
          </p>
          <p>
            <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span>
            Red = Condition false
          </p>
          <p>
            <span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span>
            Blue = Action triggered
          </p>
        </div>
      </div>
    </div>
  );
}

