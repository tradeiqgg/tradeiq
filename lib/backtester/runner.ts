// =====================================================================
// CHAPTER 7: Backtest Runner
// =====================================================================

import type { TQJSSchema } from '@/lib/tql/schema';
import type {
  BacktestOptions,
  BacktestResult,
  StrategyRuntimeState,
  Candle,
} from './types';
import { loadCandles } from './candleLoader';
import { precomputeIndicators } from './indicatorEngine';
import { evaluateStrategyOnCandle } from './executionEngine';
import { applyRisk } from './riskEngine';
import { updatePNL, calculateSummary, closePosition } from './pnlEngine';
import { validateStrategy } from '@/lib/tql/validator';
import { backtestLogStream } from './logStream';

/**
 * Run a full backtest
 */
export async function runBacktest(
  strategy: TQJSSchema,
  options: BacktestOptions
): Promise<BacktestResult> {
  const startTime = Date.now();
  
  // Clear previous logs
  backtestLogStream.clear();
  backtestLogStream.log('info', `🚀 Starting backtest: ${options.symbol} ${options.timeframe}`);
  backtestLogStream.log('info', `📅 Date range: ${options.startDate.toISOString().split('T')[0]} to ${options.endDate.toISOString().split('T')[0]}`);
  backtestLogStream.log('info', `💰 Initial balance: $${options.initialBalance.toFixed(2)}`);

  // Step 1: Validate strategy
  const validation = validateStrategy({ json: strategy });
  if (!validation.valid) {
    const errorMsg = `Strategy validation failed: ${validation.errors.map((e) => e.message).join(', ')}`;
    backtestLogStream.log('error', errorMsg);
    throw new Error(errorMsg);
  }
  backtestLogStream.log('info', '✅ Strategy validated successfully');

  // Step 2: Load candles
  backtestLogStream.log('info', '📊 Loading historical data...');
  const candles = await loadCandles({
    symbol: options.symbol,
    timeframe: options.timeframe,
    start: options.startDate,
    end: options.endDate,
  });

  if (candles.length === 0) {
    const errorMsg = 'No candles loaded for the specified date range';
    backtestLogStream.log('error', errorMsg);
    throw new Error(errorMsg);
  }
  backtestLogStream.log('info', `📈 Loaded ${candles.length} candles`);

  // Step 3: Pre-compute indicators
  backtestLogStream.log('info', '🔢 Computing indicators...');
  const indicatorCache = precomputeIndicators(candles, strategy);
  backtestLogStream.log('info', `✨ Computed ${Object.keys(indicatorCache).length} indicators`);

  // Step 4: Initialize runtime state
  const state: StrategyRuntimeState = {
    position: null,
    balance: options.initialBalance,
    equity: options.initialBalance,
    openTrades: [],
    closedTrades: [],
    indicatorCache,
    lastCandle: null,
    currentCandleIndex: 0,
    maxDrawdown: 0,
    peakEquity: options.initialBalance,
    consecutiveLosses: 0,
    dailyTrades: 0,
    dailyPnL: 0,
    logs: [],
  };

  // Step 5: Process each candle
  backtestLogStream.log('info', '🔄 Processing candles...');
  const equityCurve: Array<{ time: number; equity: number }> = [];
  const drawdownCurve: Array<{ time: number; drawdown: number }> = [];
  const logInterval = Math.max(1, Math.floor(candles.length / 100)); // Log every 1% progress

  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];
    const indicators: any = {};

    // Extract indicator values for current candle
    for (const [indicatorId, series] of Object.entries(indicatorCache)) {
      if (Array.isArray(series)) {
        indicators[indicatorId] = series[i];
      } else if (typeof series === 'object') {
        indicators[indicatorId] = series;
      }
    }

    // Log progress periodically
    if (i % logInterval === 0 || i === candles.length - 1) {
      const progress = ((i + 1) / candles.length * 100).toFixed(1);
      const date = new Date(candle.time).toISOString().split('T')[0];
      backtestLogStream.log('info', `📊 Progress: ${progress}% | Candle ${i + 1}/${candles.length} | Date: ${date} | Price: $${candle.close.toFixed(2)} | Equity: $${state.equity.toFixed(2)}`);
    }

    // Update PnL
    updatePNL(state, candle);

    // Apply risk management
    const riskActions = applyRisk(state, candle, strategy);
    for (const action of riskActions) {
      if (action.closePosition && state.position) {
        const trade = closePosition(state, candle.close, action.message);
        if (trade) {
          const riskLog = `⚠️ Risk: ${action.message} | Exit at ${candle.close.toFixed(2)} | PnL: ${trade.profit.toFixed(2)}`;
          state.logs.push(riskLog);
          backtestLogStream.log('warn', riskLog, { trade, reason: action.message });
        }
      }
    }

    // Evaluate strategy rules
    const executionResult = evaluateStrategyOnCandle(state, candle, indicators, strategy);
    Object.assign(state, executionResult.newState);
    state.logs.push(...executionResult.logs);

    // Record equity curve
    equityCurve.push({
      time: candle.time,
      equity: state.equity,
    });

    drawdownCurve.push({
      time: candle.time,
      drawdown: state.maxDrawdown,
    });
  }

  // Step 6: Calculate final summary
  backtestLogStream.log('info', '📊 Calculating summary...');
  const summary = calculateSummary(
    state.closedTrades,
    options.initialBalance,
    state.balance,
    state.maxDrawdown
  );

  const executionTime = Date.now() - startTime;
  
  // Log final results
  backtestLogStream.log('info', `✅ Backtest completed in ${(executionTime / 1000).toFixed(2)}s`);
  backtestLogStream.log('info', `📈 Total trades: ${summary.totalTrades}`);
  backtestLogStream.log('info', `🎯 Win rate: ${(summary.winRate * 100).toFixed(2)}%`);
  backtestLogStream.log('info', `💰 Final balance: $${state.balance.toFixed(2)}`);
  backtestLogStream.log('info', `📊 Total PnL: $${summary.totalPnL.toFixed(2)} (${summary.totalPnLPct.toFixed(2)}%)`);
  backtestLogStream.log('info', `📉 Max drawdown: ${summary.maxDrawdownPct.toFixed(2)}%`);

  return {
    strategy,
    options,
    trades: state.closedTrades,
    pnl: state.balance - options.initialBalance,
    pnlPct: ((state.balance - options.initialBalance) / options.initialBalance) * 100,
    winRate: summary.winRate,
    maxDrawdown: state.maxDrawdown,
    maxDrawdownPct: summary.maxDrawdownPct,
    equityCurve,
    drawdownCurve,
    logs: state.logs,
    summary,
    executionTime,
    candlesProcessed: candles.length,
    indicatorsComputed: Object.keys(indicatorCache).length,
  };
}

