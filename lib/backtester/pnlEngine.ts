// =====================================================================
// CHAPTER 7: PnL Engine
// =====================================================================

import type { StrategyRuntimeState, Candle, TradeRecord, Position } from './types';

/**
 * Update PnL for current position
 */
export function updatePNL(
  state: StrategyRuntimeState,
  candle: Candle
): void {
  if (!state.position) {
    state.equity = state.balance;
    return;
  }

  const position = state.position;
  const currentPrice = candle.close;

  // Calculate unrealized PnL
  let unrealizedPnL = 0;
  if (position.direction === 'long') {
    unrealizedPnL = (currentPrice - position.entryPrice) * position.size;
  } else {
    unrealizedPnL = (position.entryPrice - currentPrice) * position.size;
  }

  // Update equity
  state.equity = state.balance + unrealizedPnL;

  // Update peak equity and drawdown
  if (state.equity > state.peakEquity) {
    state.peakEquity = state.equity;
  }

  const drawdown = state.peakEquity - state.equity;
  if (drawdown > state.maxDrawdown) {
    state.maxDrawdown = drawdown;
  }
}

/**
 * Close position and record trade
 */
export function closePosition(
  state: StrategyRuntimeState,
  exitPrice: number,
  reason: string
): TradeRecord | null {
  if (!state.position) {
    return null;
  }

  const position = state.position;
  const entryTime = position.entryTime;
  const exitTime = Date.now();

  // Calculate profit
  let profit = 0;
  if (position.direction === 'long') {
    profit = (exitPrice - position.entryPrice) * position.size;
  } else {
    profit = (position.entryPrice - exitPrice) * position.size;
  }

  const returnPct = (profit / (position.entryPrice * position.size)) * 100;

  // Create trade record
  const trade: TradeRecord = {
    id: `trade-${Date.now()}-${Math.random()}`,
    entryTime,
    exitTime,
    entryPrice: position.entryPrice,
    exitPrice,
    size: position.size,
    direction: position.direction,
    profit,
    returnPct,
    reason,
    stopLoss: position.stopLoss,
    takeProfit: position.takeProfit,
  };

  // Update balance
  state.balance += profit;

  // Update equity
  state.equity = state.balance;

  // Update trade counts
  if (profit > 0) {
    // Winning trade
  } else {
    state.consecutiveLosses++;
  }

  // Add to closed trades
  state.closedTrades.push(trade);

  // Clear position
  state.position = null;

  return trade;
}

/**
 * Calculate backtest summary statistics
 */
export function calculateSummary(
  trades: TradeRecord[],
  initialBalance: number,
  finalBalance: number,
  maxDrawdown: number
): any {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      totalPnLPct: 0,
      maxDrawdown,
      maxDrawdownPct: (maxDrawdown / initialBalance) * 100,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      averageHoldTime: 0,
    };
  }

  const winningTrades = trades.filter((t) => t.profit > 0);
  const losingTrades = trades.filter((t) => t.profit <= 0);

  const totalPnL = finalBalance - initialBalance;
  const totalPnLPct = (totalPnL / initialBalance) * 100;

  const averageWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length
      : 0;

  const averageLoss =
    losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length
      : 0;

  const largestWin =
    winningTrades.length > 0
      ? Math.max(...winningTrades.map((t) => t.profit))
      : 0;

  const largestLoss =
    losingTrades.length > 0
      ? Math.min(...losingTrades.map((t) => t.profit))
      : 0;

  const averageHoldTime =
    trades.reduce((sum, t) => sum + (t.exitTime - t.entryTime), 0) / trades.length;

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    totalPnL,
    totalPnLPct,
    maxDrawdown,
    maxDrawdownPct: (maxDrawdown / initialBalance) * 100,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    averageHoldTime,
  };
}

