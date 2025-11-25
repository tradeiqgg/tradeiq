// =====================================================================
// CHAPTER 8: Backtest Panel - Main Container
// =====================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useIDEEngine } from '../core/IDEEngine';
import { BacktestControls } from './BacktestControls';
import { BacktestResults } from './BacktestResults';
import type { BacktestResult } from '@/lib/backtester/types';
import { runBacktest } from '@/lib/backtester';
import type { Strategy } from '@/types';
import { validateStrategy } from '@/lib/tql/validator';
import { useAuthStore } from '@/stores/authStore';

interface BacktestPanelProps {
  strategy?: Strategy;
}

export function BacktestPanel({ strategy }: BacktestPanelProps) {
  const engine = useIDEEngine();
  const { user } = useAuthStore();
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backtestOptions, setBacktestOptions] = useState({
    symbol: 'BTCUSDT',
    timeframe: '1h',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    initialBalance: 1000,
  });

  // Get strategy JSON from either IDE engine or strategy prop
  const getStrategyJSON = () => {
    if (engine.compiledJSON) {
      return engine.compiledJSON;
    }
    if (strategy?.strategy_json) {
      return strategy.strategy_json as any;
    }
    if (strategy?.json_logic) {
      return strategy.json_logic as any;
    }
    return null;
  };

  // Validate strategy
  useEffect(() => {
    if (strategy) {
      const strategyJSON = getStrategyJSON();
      if (strategyJSON) {
        const validation = validateStrategy({ json: strategyJSON });
        if (!validation.valid) {
          setError(`Strategy validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        } else {
          setError(null);
        }
      }
    }
  }, [strategy, engine.compiledJSON]);

  const handleRunBacktest = async () => {
    let strategyJSON = getStrategyJSON();
    
    if (!strategyJSON) {
      setError('No strategy found. Please create or load a strategy first.');
      return;
    }

    // Inject symbol and timeframe from backtest options into strategy settings
    strategyJSON = {
      ...strategyJSON,
      settings: {
        ...strategyJSON.settings,
        symbol: backtestOptions.symbol,
        timeframe: backtestOptions.timeframe,
      },
    };

    // Validate strategy
    const validation = validateStrategy({ json: strategyJSON });
    if (!validation.valid) {
      setError(`Strategy is invalid: ${validation.errors.map(e => e.message).join(', ')}`);
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const result = await runBacktest(strategyJSON, backtestOptions);
      setBacktestResult(result);
      
      // Save backtest result to database
      if (user?.id && strategy?.id) {
        try {
          const { createBacktest } = await import('@/stores/backtestStore');
          const backtestStore = await import('@/stores/backtestStore');
          await backtestStore.useBacktestStore.getState().createBacktest({
            user_id: user.id,
            strategy_id: strategy.id,
            chart_asset: `${backtestOptions.symbol}-${backtestOptions.timeframe}`,
            pnl: result.pnl,
            trades: result.trades as any,
          });
        } catch (saveError) {
          console.warn('Failed to save backtest result:', saveError);
          // Don't fail the whole backtest if save fails
        }
      }
      
      // Update strategy with new settings if strategy prop exists
      if (strategy && engine.updateStrategy) {
        engine.updateStrategy({
          ...strategy,
          strategy_json: strategyJSON,
          json_logic: strategyJSON,
        });
      }
      
      // Create snapshot if engine is available
      if (engine.createSnapshot) {
        engine.createSnapshot();
      }
    } catch (err: any) {
      setError(err.message || 'Backtest failed');
      console.error('Backtest error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="backtest-panel h-full flex flex-col">
      {/* Controls */}
      <div className="backtest-controls-section border-b border-gray-700 p-4">
        <BacktestControls
          options={backtestOptions}
          onOptionsChange={setBacktestOptions}
          onRun={handleRunBacktest}
          isRunning={isRunning}
          isValid={engine.compileResult?.valid ?? (getStrategyJSON() !== null)}
          validationErrors={engine.diagnostics?.filter((d) => d.type === 'error').length ?? 0}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="backtest-error bg-red-900/20 border border-red-500 text-red-400 p-4 m-4 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="backtest-loading flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-4">Running backtest...</span>
        </div>
      )}

      {/* Results */}
      {backtestResult && !isRunning && (
        <div className="backtest-results-section flex-1 overflow-auto">
          <BacktestResults result={backtestResult} />
        </div>
      )}

      {/* Empty State */}
      {!backtestResult && !isRunning && (
        <div className="backtest-empty flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-xl mb-2">No backtest results yet</p>
            <p className="text-sm">Configure your backtest settings and click "Run Backtest" to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}

