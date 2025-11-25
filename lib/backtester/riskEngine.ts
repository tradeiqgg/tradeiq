// =====================================================================
// CHAPTER 7: Risk Engine
// =====================================================================

import type {
  StrategyRuntimeState,
  Candle,
  RiskAction,
  Position,
} from './types';
import type { TQJSSchema } from '@/lib/tql/schema';

/**
 * Apply risk management rules to current state
 */
export function applyRisk(
  state: StrategyRuntimeState,
  candle: Candle,
  strategy: TQJSSchema
): RiskAction[] {
  const actions: RiskAction[] = [];
  const risk = strategy.risk;

  if (!state.position) {
    return actions;
  }

  const position = state.position;
  const currentPrice = candle.close;

  // Check stop loss
  if (position.stopLoss) {
    if (
      (position.direction === 'long' && currentPrice <= position.stopLoss) ||
      (position.direction === 'short' && currentPrice >= position.stopLoss)
    ) {
      actions.push({
        type: 'stop_loss',
        message: `Stop loss triggered at ${currentPrice}`,
        closePosition: true,
      });
    }
  }

  // Check take profit
  if (position.takeProfit) {
    if (
      (position.direction === 'long' && currentPrice >= position.takeProfit) ||
      (position.direction === 'short' && currentPrice <= position.takeProfit)
    ) {
      actions.push({
        type: 'take_profit',
        message: `Take profit triggered at ${currentPrice}`,
        closePosition: true,
      });
    }
  }

  // Check trailing stop
  if (position.trailingStop) {
    const trailingStopPrice = calculateTrailingStop(
      position,
      currentPrice,
      position.trailingStop
    );

    if (
      (position.direction === 'long' && currentPrice <= trailingStopPrice) ||
      (position.direction === 'short' && currentPrice >= trailingStopPrice)
    ) {
      actions.push({
        type: 'trailing_stop',
        message: `Trailing stop triggered at ${currentPrice}`,
        closePosition: true,
      });
    }
  }

  // Check max drawdown
  if (risk.max_daily_loss_percent) {
    const drawdownPct = ((state.peakEquity - state.equity) / state.peakEquity) * 100;
    if (drawdownPct >= risk.max_daily_loss_percent) {
      actions.push({
        type: 'max_drawdown',
        message: `Max drawdown exceeded: ${drawdownPct.toFixed(2)}%`,
        closePosition: true,
      });
    }
  }

  // Check max daily trades
  if (risk.max_daily_trades && state.dailyTrades >= risk.max_daily_trades) {
    actions.push({
      type: 'max_trades',
      message: `Max daily trades reached: ${state.dailyTrades}`,
      closePosition: false,
    });
  }

  return actions;
}

/**
 * Calculate trailing stop price
 */
function calculateTrailingStop(
  position: Position,
  currentPrice: number,
  trailingStopPercent: number
): number {
  if (position.direction === 'long') {
    const trailingStopPrice = currentPrice * (1 - trailingStopPercent / 100);
    return Math.max(trailingStopPrice, position.stopLoss || trailingStopPrice);
  } else {
    const trailingStopPrice = currentPrice * (1 + trailingStopPercent / 100);
    return Math.min(trailingStopPrice, position.stopLoss || trailingStopPrice);
  }
}

/**
 * Validate order against risk rules
 */
export function validateOrder(
  order: any,
  state: StrategyRuntimeState,
  strategy: TQJSSchema
): { valid: boolean; reason?: string } {
  const risk = strategy.risk;

  // Check position size
  if (order.sizeMode === 'percent') {
    if (order.size > risk.position_size_percent) {
      return {
        valid: false,
        reason: `Position size ${order.size}% exceeds max ${risk.position_size_percent}%`,
      };
    }
  }

  // Check if already in position
  if (state.position && !strategy.settings.allow_reentry) {
    return {
      valid: false,
      reason: 'Already in position and reentry not allowed',
    };
  }

  // Check max open positions
  if (
    state.position &&
    strategy.settings.max_open_positions <= state.openTrades.length
  ) {
    return {
      valid: false,
      reason: `Max open positions (${strategy.settings.max_open_positions}) reached`,
    };
  }

  return { valid: true };
}

/**
 * Calculate position size based on risk
 */
export function calculatePositionSize(
  balance: number,
  entryPrice: number,
  sizePercent: number,
  sizeMode: 'percent' | 'fixed'
): number {
  if (sizeMode === 'percent') {
    return (balance * sizePercent) / 100;
  } else {
    return sizePercent; // Fixed size
  }
}

