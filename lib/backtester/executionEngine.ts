// =====================================================================
// CHAPTER 7: Execution Engine
// =====================================================================

import type {
  StrategyRuntimeState,
  Candle,
  ExecutionResult,
  Order,
  FilledOrder,
  IndicatorSeries,
} from './types';
import type { TQJSSchema, Condition, Rule } from '@/lib/tql/schema';
import { validateOrder, calculatePositionSize } from './riskEngine';
import { closePosition } from './pnlEngine';
import { backtestLogStream } from './logStream';

/**
 * Evaluate strategy on a single candle
 */
export function evaluateStrategyOnCandle(
  state: StrategyRuntimeState,
  candle: Candle,
  indicators: IndicatorSeries,
  strategy: TQJSSchema
): ExecutionResult {
  const executedOrders: FilledOrder[] = [];
  const logs: string[] = [];
  const newState = { ...state };
  newState.lastCandle = candle;
  newState.currentCandleIndex++;

  // Update PnL first
  // updatePNL(newState, candle); // Called separately

  // Evaluate entry rules
  for (const rule of strategy.rules.entry || []) {
    const conditionResult = evaluateConditionWithReasoning(rule.conditions[0], indicators, candle);
    
    if (conditionResult.result) {
      const action = rule.action as any;
      if (action.type === 'enter_position') {
        const order: Order = {
          id: `order-${Date.now()}-${Math.random()}`,
          direction: action.direction,
          type: 'market',
          size: action.size || 10,
          sizeMode: action.size_mode || 'percent',
          timestamp: candle.time,
        };

        // Log reasoning
        const reasoning = `Entry condition met: ${conditionResult.reasoning}`;
        logs.push(reasoning);
        backtestLogStream.log('reasoning', reasoning, {
          candle: { time: candle.time, close: candle.close },
          condition: conditionResult.reasoning,
          action: `Enter ${action.direction} ${action.size}${action.size_mode === 'percent' ? '%' : ''}`,
        });

        // Validate order
        const validation = validateOrder(order, newState, strategy);
        if (validation.valid) {
          // Execute order
          const filledOrder = executeOrder(order, candle, newState);
          if (filledOrder) {
            executedOrders.push(filledOrder);
            const tradeLog = `✅ Entry: ${action.direction} ${action.size}${action.size_mode === 'percent' ? '%' : ''} at ${filledOrder.filledPrice.toFixed(2)}`;
            logs.push(tradeLog);
            backtestLogStream.log('trade', tradeLog, {
              type: 'entry',
              direction: action.direction,
              price: filledOrder.filledPrice,
              size: action.size,
              sizeMode: action.size_mode,
              timestamp: candle.time,
            });
          }
        } else {
          const rejectLog = `❌ Order rejected: ${validation.reason}`;
          logs.push(rejectLog);
          backtestLogStream.log('warn', rejectLog, { validation });
        }
      }
    } else {
      // Log why condition didn't trigger (only occasionally to avoid spam)
      if (Math.random() < 0.01) { // 1% of the time
        backtestLogStream.log('info', `Entry condition not met: ${conditionResult.reasoning}`, {
          candle: { time: candle.time, close: candle.close },
        });
      }
    }
  }

  // Evaluate exit rules
  if (newState.position) {
    for (const rule of strategy.rules.exit || []) {
      const conditionResult = evaluateConditionWithReasoning(rule.conditions[0], indicators, candle);
      
      if (conditionResult.result) {
        const action = rule.action as any;
        if (action.type === 'exit_position') {
          const exitPrice = candle.close;
          const entryPrice = newState.position!.entryPrice;
          const pnl = newState.position!.direction === 'long' 
            ? (exitPrice - entryPrice) * newState.position!.size
            : (entryPrice - exitPrice) * newState.position!.size;
          const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100 * (newState.position!.direction === 'long' ? 1 : -1);
          
          const trade = closePosition(newState, exitPrice, `Exit rule triggered: ${conditionResult.reasoning}`);
          if (trade) {
            const exitLog = `✅ Exit: ${trade.direction} at ${exitPrice.toFixed(2)}, PnL: ${trade.profit.toFixed(2)} (${pnlPct.toFixed(2)}%)`;
            logs.push(exitLog);
            backtestLogStream.log('trade', exitLog, {
              type: 'exit',
              direction: trade.direction,
              entryPrice,
              exitPrice,
              profit: trade.profit,
              profitPct: pnlPct,
              reason: conditionResult.reasoning,
              timestamp: candle.time,
            });
            
            // Log reasoning
            backtestLogStream.log('reasoning', `Exit condition met: ${conditionResult.reasoning}`, {
              candle: { time: candle.time, close: candle.close },
              condition: conditionResult.reasoning,
              tradeResult: {
                profit: trade.profit,
                profitPct: pnlPct,
                holdTime: trade.exitTime - trade.entryTime,
              },
            });
          }
        }
      }
    }
  }

  return {
    newState,
    executedOrders,
    logs,
    riskActions: [], // Risk actions handled separately
  };
}

/**
 * Evaluate a condition
 */
function evaluateCondition(
  condition: Condition | any,
  indicators: IndicatorSeries,
  candle: Candle
): boolean {
  const result = evaluateConditionWithReasoning(condition, indicators, candle);
  return result.result;
}

/**
 * Evaluate a condition with reasoning
 */
function evaluateConditionWithReasoning(
  condition: Condition | any,
  indicators: IndicatorSeries,
  candle: Candle
): { result: boolean; reasoning: string } {
  if (!condition || condition.type !== 'condition') {
    return { result: false, reasoning: 'Invalid condition' };
  }

  const left = getConditionValue(condition.left, indicators, candle);
  const right = getConditionValue(condition.right, indicators, candle);
  const operator = condition.operator;

  if (left === null || right === null) {
    return { result: false, reasoning: `Missing value: left=${left}, right=${right}` };
  }

  const leftLabel = getConditionLabel(condition.left, indicators, candle);
  const rightLabel = getConditionLabel(condition.right, indicators, candle);
  const operatorSymbol = getOperatorSymbol(operator);

  let result = false;
  switch (operator) {
    case 'gt':
      result = Number(left) > Number(right);
      break;
    case 'gte':
      result = Number(left) >= Number(right);
      break;
    case 'lt':
      result = Number(left) < Number(right);
      break;
    case 'lte':
      result = Number(left) <= Number(right);
      break;
    case 'eq':
      result = left === right;
      break;
    case 'neq':
      result = left !== right;
      break;
    case 'crosses_above':
      // Simplified - would need previous candle for true crossover detection
      result = Number(left) > Number(right);
      break;
    case 'crosses_below':
      result = Number(left) < Number(right);
      break;
    default:
      return { result: false, reasoning: `Unknown operator: ${operator}` };
  }

  const reasoning = `${leftLabel} (${left}) ${operatorSymbol} ${rightLabel} (${right}) = ${result}`;
  return { result, reasoning };
}

/**
 * Get operator symbol for display
 */
function getOperatorSymbol(operator: string): string {
  const map: Record<string, string> = {
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    eq: '==',
    neq: '!=',
    crosses_above: 'crosses above',
    crosses_below: 'crosses below',
  };
  return map[operator] || operator;
}

/**
 * Get human-readable label for condition value
 */
function getConditionLabel(
  ref: any,
  indicators: IndicatorSeries,
  candle: Candle
): string {
  if (ref.source_type === 'indicator' && ref.id) {
    return ref.id.toUpperCase();
  } else if (ref.source_type === 'price' && ref.field) {
    return ref.field.toUpperCase();
  } else if (ref.source_type === 'value') {
    return String(ref.value);
  }
  return 'Unknown';
}

/**
 * Get value from condition reference
 */
function getConditionValue(
  ref: any,
  indicators: IndicatorSeries,
  candle: Candle
): number | boolean | null {
  if (ref.source_type === 'indicator' && ref.id) {
    const indicatorValue = indicators[ref.id];
    if (Array.isArray(indicatorValue)) {
      // Return last value
      return indicatorValue[indicatorValue.length - 1] as number;
    }
    return indicatorValue as number | boolean;
  } else if (ref.source_type === 'price' && ref.field) {
    return candle[ref.field as keyof Candle] as number;
  } else if (ref.source_type === 'value') {
    return ref.value;
  }
  return null;
}

/**
 * Execute an order
 */
function executeOrder(
  order: Order,
  candle: Candle,
  state: StrategyRuntimeState
): FilledOrder | null {
  let filledPrice = candle.close; // Market order fills at close

  if (order.type === 'limit' && order.price) {
    // Check if limit price is within candle range
    if (order.price >= candle.low && order.price <= candle.high) {
      filledPrice = order.price;
    } else {
      return null; // Limit order not filled
    }
  }

  // Calculate position size
  const positionSize = calculatePositionSize(
    state.balance,
    filledPrice,
    order.size,
    order.sizeMode
  );

  // Calculate slippage (simplified)
  const slippage = filledPrice * 0.0002; // 2 bps
  const finalPrice = order.direction === 'long' ? filledPrice + slippage : filledPrice - slippage;

  // Create position
  state.position = {
    id: `pos-${Date.now()}`,
    direction: order.direction,
    entryPrice: finalPrice,
    entryTime: candle.time,
    size: positionSize,
    sizePercent: order.sizeMode === 'percent' ? order.size : (positionSize / state.balance) * 100,
  };

  // Apply stop loss and take profit from strategy
  const risk = (state as any).strategy?.risk;
  if (risk) {
    if (risk.stop_loss_percent) {
      const stopLossPct = risk.stop_loss_percent / 100;
      state.position.stopLoss =
        order.direction === 'long'
          ? finalPrice * (1 - stopLossPct)
          : finalPrice * (1 + stopLossPct);
    }
    if (risk.take_profit_percent) {
      const takeProfitPct = risk.take_profit_percent / 100;
      state.position.takeProfit =
        order.direction === 'long'
          ? finalPrice * (1 + takeProfitPct)
          : finalPrice * (1 - takeProfitPct);
    }
    if (risk.trailing_stop_percent) {
      state.position.trailingStop = risk.trailing_stop_percent;
    }
  }

  return {
    ...order,
    filledPrice: finalPrice,
    filledTime: candle.time,
    slippage,
  };
}

