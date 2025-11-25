// =====================================================================
// Default Strategy Generator
// Creates a valid minimal TQ-JSS strategy structure
// =====================================================================

import type { TQJSSchema } from './schema';

/**
 * Creates a default valid TQ-JSS strategy structure
 */
export function createDefaultStrategy(name: string = 'MyStrategy'): TQJSSchema {
  return {
    meta: {
      name,
      description: '',
      author: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    settings: {
      symbol: 'BTCUSDT',
      timeframe: '1h',
      initial_balance: 1000,
      position_mode: 'long_only',
      max_open_positions: 1,
      allow_reentry: true,
      execution_mode: 'candle_close',
    },
    indicators: [],
    rules: {
      entry: [
        {
          conditions: [
            {
              type: 'condition',
              operator: 'gt',
              left: { source_type: 'price', field: 'close' },
              right: { source_type: 'value', value: 0 },
            },
          ],
          action: {
            type: 'enter_position',
            direction: 'long',
            size_mode: 'percent',
            size: 2,
          },
        },
      ],
      exit: [
        {
          conditions: [
            {
              type: 'condition',
              operator: 'lt',
              left: { source_type: 'price', field: 'close' },
              right: { source_type: 'value', value: 0 },
            },
          ],
          action: {
            type: 'exit_position',
            direction: 'long',
          },
        },
      ],
      filters: [],
    },
    risk: {
      position_size_percent: 2,
      max_risk_per_trade_percent: 2,
      stop_loss_percent: 2,
      take_profit_percent: 4,
      trailing_stop_percent: null,
      max_daily_loss_percent: 10,
      max_daily_trades: 10,
    },
    runtime: {
      logs: [],
      last_signals: [],
      state: {},
    },
    version: '1.0.0',
  };
}

/**
 * Ensures a strategy has all required fields, filling in defaults if missing
 */
export function ensureValidStrategyStructure(strategy: Partial<TQJSSchema>): TQJSSchema {
  const defaultStrategy = createDefaultStrategy(strategy.meta?.name || 'Untitled Strategy');
  
  return {
    meta: {
      name: strategy.meta?.name || defaultStrategy.meta.name,
      description: strategy.meta?.description || defaultStrategy.meta.description,
      author: strategy.meta?.author || defaultStrategy.meta.author,
      created_at: strategy.meta?.created_at || defaultStrategy.meta.created_at,
      updated_at: strategy.meta?.updated_at || new Date().toISOString(),
    },
    settings: {
      symbol: strategy.settings?.symbol || defaultStrategy.settings.symbol,
      timeframe: strategy.settings?.timeframe || defaultStrategy.settings.timeframe,
      initial_balance: strategy.settings?.initial_balance || defaultStrategy.settings.initial_balance,
      position_mode: strategy.settings?.position_mode || defaultStrategy.settings.position_mode,
      max_open_positions: strategy.settings?.max_open_positions || defaultStrategy.settings.max_open_positions,
      allow_reentry: strategy.settings?.allow_reentry ?? defaultStrategy.settings.allow_reentry,
      execution_mode: strategy.settings?.execution_mode || defaultStrategy.settings.execution_mode,
    },
    indicators: strategy.indicators || defaultStrategy.indicators,
    rules: {
      entry: strategy.rules?.entry?.length ? strategy.rules.entry : defaultStrategy.rules.entry,
      exit: strategy.rules?.exit?.length ? strategy.rules.exit : defaultStrategy.rules.exit,
      filters: strategy.rules?.filters || defaultStrategy.rules.filters,
    },
    risk: {
      position_size_percent: strategy.risk?.position_size_percent || defaultStrategy.risk.position_size_percent,
      max_risk_per_trade_percent: strategy.risk?.max_risk_per_trade_percent || defaultStrategy.risk.max_risk_per_trade_percent,
      stop_loss_percent: strategy.risk?.stop_loss_percent ?? defaultStrategy.risk.stop_loss_percent,
      take_profit_percent: strategy.risk?.take_profit_percent ?? defaultStrategy.risk.take_profit_percent,
      trailing_stop_percent: strategy.risk?.trailing_stop_percent ?? defaultStrategy.risk.trailing_stop_percent,
      max_daily_loss_percent: strategy.risk?.max_daily_loss_percent || defaultStrategy.risk.max_daily_loss_percent,
      max_daily_trades: strategy.risk?.max_daily_trades || defaultStrategy.risk.max_daily_trades,
    },
    runtime: {
      logs: strategy.runtime?.logs || defaultStrategy.runtime.logs,
      last_signals: strategy.runtime?.last_signals || defaultStrategy.runtime.last_signals,
      state: strategy.runtime?.state || defaultStrategy.runtime.state,
    },
    version: strategy.version || defaultStrategy.version,
  };
}

