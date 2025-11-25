// =====================================================================
// CHAPTER 8: Backtest Controls
// =====================================================================

'use client';

import React from 'react';
import type { BacktestOptions } from '@/lib/backtester/types';

interface BacktestControlsProps {
  options: BacktestOptions;
  onOptionsChange: (options: BacktestOptions) => void;
  onRun: () => void;
  isRunning: boolean;
  isValid: boolean;
  validationErrors: number;
}

export function BacktestControls({
  options,
  onOptionsChange,
  onRun,
  isRunning,
  isValid,
  validationErrors,
}: BacktestControlsProps) {
  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({ ...options, symbol: e.target.value.toUpperCase() });
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({ ...options, timeframe: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({ ...options, startDate: new Date(e.target.value) });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({ ...options, endDate: new Date(e.target.value) });
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({ ...options, initialBalance: parseFloat(e.target.value) || 1000 });
  };

  return (
    <div className="backtest-controls space-y-4">
      {/* Validation Status */}
      <div className="validation-status flex items-center gap-2 mb-4">
        {isValid ? (
          <span className="text-green-400 flex items-center gap-2">
            <span>✓</span>
            <span>Strategy Valid</span>
          </span>
        ) : (
          <span className="text-red-400 flex items-center gap-2">
            <span>✗</span>
            <span>Strategy Invalid ({validationErrors} errors - see Diagnostics)</span>
          </span>
        )}
      </div>

      {/* Controls Grid */}
      <div className="controls-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Symbol */}
        <div className="control-group">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Symbol
          </label>
          <input
            type="text"
            value={options.symbol}
            onChange={handleSymbolChange}
            placeholder="BTCUSDT"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            disabled={isRunning}
          />
        </div>

        {/* Timeframe */}
        <div className="control-group">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Timeframe
          </label>
          <select
            value={options.timeframe}
            onChange={handleTimeframeChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            disabled={isRunning}
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="control-group">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={options.startDate.toISOString().split('T')[0]}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            disabled={isRunning}
          />
        </div>

        {/* End Date */}
        <div className="control-group">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={options.endDate.toISOString().split('T')[0]}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Balance and Run Button */}
      <div className="flex items-end gap-4">
        <div className="control-group flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Initial Balance ($)
          </label>
          <input
            type="number"
            value={options.initialBalance}
            onChange={handleBalanceChange}
            min="1"
            step="100"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            disabled={isRunning}
          />
        </div>

        <button
          data-tutorial="backtest-button"
          onClick={onRun}
          disabled={isRunning || !isValid || validationErrors > 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
        >
          {isRunning ? 'Running...' : 'Run Backtest'}
        </button>
      </div>
    </div>
  );
}

