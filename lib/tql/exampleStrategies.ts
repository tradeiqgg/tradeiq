// =====================================================================
// Example Strategies Library
// =====================================================================

import type { TQJSSchema } from './schema';

export interface ExampleStrategy {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  strategy: TQJSSchema;
  tql: string;
}

export const exampleStrategies: ExampleStrategy[] = [
  {
    id: 'rsi-oversold',
    name: 'RSI Oversold Strategy',
    description: 'Buy when RSI drops below 30 (oversold), sell when it rises above 70 (overbought). Classic momentum reversal strategy.',
    category: 'beginner',
    tql: `meta {
  name: "RSI Oversold Strategy"
  description: "Buy oversold, sell overbought"
}

settings {
  symbol: BTCUSDT
  timeframe: 1h
  initial_balance: 1000
  position_mode: long_only
}

indicators {
  rsi = rsi(period: 14)
}

rules {
  entry {
    when rsi < 30 then enter long size:10%
  }
  
  exit {
    when rsi > 70 then exit any
  }
}

risk {
  stop_loss: 3%
  take_profit: 5%
  position_size: 10%
}`,
    strategy: {
      meta: {
        name: 'RSI Oversold Strategy',
        description: 'Buy oversold, sell overbought',
        author: 'TradeIQ',
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
      indicators: [
        {
          id: 'rsi',
          indicator: 'rsi',
          params: { period: 14 },
          output: 'value',
        },
      ],
      rules: {
        entry: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'indicator', id: 'rsi' },
                operator: 'lt',
                right: { source_type: 'value', value: 30 },
              },
            ],
            action: {
              type: 'enter_position',
              direction: 'long',
              size_mode: 'percent',
              size: 10,
            },
          },
        ],
        exit: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'indicator', id: 'rsi' },
                operator: 'gt',
                right: { source_type: 'value', value: 70 },
              },
            ],
            action: {
              type: 'exit_position',
              direction: 'any',
            },
          },
        ],
        filters: [],
      },
      risk: {
        position_size_percent: 10,
        max_risk_per_trade_percent: 2,
        stop_loss_percent: 3,
        take_profit_percent: 5,
        trailing_stop_percent: null,
        max_daily_loss_percent: 10,
        max_daily_trades: 15,
      },
      runtime: {
        logs: [],
        last_signals: [],
        state: {},
      },
      version: '1.0',
    },
  },
  {
    id: 'sma-crossover',
    name: 'SMA Crossover Strategy',
    description: 'Buy when fast SMA crosses above slow SMA, sell when it crosses below. Classic trend-following strategy.',
    category: 'beginner',
    tql: `meta {
  name: "SMA Crossover Strategy"
  description: "Fast and slow moving average crossover"
}

settings {
  symbol: BTCUSDT
  timeframe: 1h
  initial_balance: 1000
  position_mode: long_only
}

indicators {
  sma_fast = sma(period: 20)
  sma_slow = sma(period: 50)
}

rules {
  entry {
    when sma_fast crosses_above sma_slow then enter long size:15%
  }
  
  exit {
    when sma_fast crosses_below sma_slow then exit any
  }
}

risk {
  stop_loss: 5%
  take_profit: 10%
  position_size: 15%
}`,
    strategy: {
      meta: {
        name: 'SMA Crossover Strategy',
        description: 'Fast and slow moving average crossover',
        author: 'TradeIQ',
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
      indicators: [
        {
          id: 'sma_fast',
          indicator: 'sma',
          params: { period: 20 },
          output: 'value',
        },
        {
          id: 'sma_slow',
          indicator: 'sma',
          params: { period: 50 },
          output: 'value',
        },
      ],
      rules: {
        entry: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'indicator', id: 'sma_fast' },
                operator: 'crosses_above',
                right: { source_type: 'indicator', id: 'sma_slow' },
              },
            ],
            action: {
              type: 'enter_position',
              direction: 'long',
              size_mode: 'percent',
              size: 15,
            },
          },
        ],
        exit: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'indicator', id: 'sma_fast' },
                operator: 'crosses_below',
                right: { source_type: 'indicator', id: 'sma_slow' },
              },
            ],
            action: {
              type: 'exit_position',
              direction: 'any',
            },
          },
        ],
        filters: [],
      },
      risk: {
        position_size_percent: 15,
        max_risk_per_trade_percent: 2,
        stop_loss_percent: 5,
        take_profit_percent: 10,
        trailing_stop_percent: null,
        max_daily_loss_percent: 10,
        max_daily_trades: 15,
      },
      runtime: {
        logs: [],
        last_signals: [],
        state: {},
      },
      version: '1.0',
    },
  },
  {
    id: 'macd-momentum',
    name: 'MACD Momentum Strategy',
    description: 'Buy when MACD line crosses above signal line, sell when it crosses below. Momentum-based strategy.',
    category: 'intermediate',
    tql: `meta {
  name: "MACD Momentum Strategy"
  description: "MACD line and signal crossover"
}

settings {
  symbol: BTCUSDT
  timeframe: 4h
  initial_balance: 1000
  position_mode: long_only
}

indicators {
  macd_line = macd(fast: 12, slow: 26, signal: 9)
  macd_signal = macd(fast: 12, slow: 26, signal: 9)
}

rules {
  entry {
    when macd_line crosses_above macd_signal then enter long size:12%
  }
  
  exit {
    when macd_line crosses_below macd_signal then exit any
  }
}

risk {
  stop_loss: 4%
  take_profit: 8%
  trailing_stop: 2%
  position_size: 12%
}`,
    strategy: {
      meta: {
        name: 'MACD Momentum Strategy',
        description: 'MACD line and signal crossover',
        author: 'TradeIQ',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      settings: {
        symbol: 'BTCUSDT',
        timeframe: '4h',
        initial_balance: 1000,
        position_mode: 'long_only',
        max_open_positions: 1,
        allow_reentry: true,
        execution_mode: 'candle_close',
      },
      indicators: [
        {
          id: 'macd',
          indicator: 'macd',
          params: { fast: 12, slow: 26, signal: 9 },
          output: 'macd',
        },
      ],
      rules: {
        entry: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'indicator', id: 'macd', field: 'macd' },
                operator: 'crosses_above',
                right: { source_type: 'indicator', id: 'macd', field: 'signal' },
              },
            ],
            action: {
              type: 'enter_position',
              direction: 'long',
              size_mode: 'percent',
              size: 12,
            },
          },
        ],
        exit: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'indicator', id: 'macd', field: 'macd' },
                operator: 'crosses_below',
                right: { source_type: 'indicator', id: 'macd', field: 'signal' },
              },
            ],
            action: {
              type: 'exit_position',
              direction: 'any',
            },
          },
        ],
        filters: [],
      },
      risk: {
        position_size_percent: 12,
        max_risk_per_trade_percent: 2,
        stop_loss_percent: 4,
        take_profit_percent: 8,
        trailing_stop_percent: 2,
        max_daily_loss_percent: 10,
        max_daily_trades: 15,
      },
      runtime: {
        logs: [],
        last_signals: [],
        state: {},
      },
      version: '1.0',
    },
  },
  {
    id: 'bollinger-bounce',
    name: 'Bollinger Bounce Strategy',
    description: 'Buy when price touches lower Bollinger Band, sell at upper band. Mean-reversion strategy.',
    category: 'intermediate',
    tql: `meta {
  name: "Bollinger Bounce Strategy"
  description: "Buy at lower band, sell at upper band"
}

settings {
  symbol: BTCUSDT
  timeframe: 1h
  initial_balance: 1000
  position_mode: long_only
}

indicators {
  bb_lower = bb(period: 20, stddev: 2)
  bb_upper = bb(period: 20, stddev: 2)
}

rules {
  entry {
    when close < bb_lower then enter long size:10%
  }
  
  exit {
    when close > bb_upper then exit any
  }
}

risk {
  stop_loss: 3%
  take_profit: 6%
  position_size: 10%
}`,
    strategy: {
      meta: {
        name: 'Bollinger Bounce Strategy',
        description: 'Buy at lower band, sell at upper band',
        author: 'TradeIQ',
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
      indicators: [
        {
          id: 'bb',
          indicator: 'bb',
          params: { period: 20, stddev: 2 },
          output: 'bands',
        },
      ],
      rules: {
        entry: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'price', field: 'close' },
                operator: 'lt',
                right: { source_type: 'indicator', id: 'bb', field: 'lower' },
              },
            ],
            action: {
              type: 'enter_position',
              direction: 'long',
              size_mode: 'percent',
              size: 10,
            },
          },
        ],
        exit: [
          {
            conditions: [
              {
                type: 'condition',
                left: { source_type: 'price', field: 'close' },
                operator: 'gt',
                right: { source_type: 'indicator', id: 'bb', field: 'upper' },
              },
            ],
            action: {
              type: 'exit_position',
              direction: 'any',
            },
          },
        ],
        filters: [],
      },
      risk: {
        position_size_percent: 10,
        max_risk_per_trade_percent: 2,
        stop_loss_percent: 3,
        take_profit_percent: 6,
        trailing_stop_percent: null,
        max_daily_loss_percent: 10,
        max_daily_trades: 15,
      },
      runtime: {
        logs: [],
        last_signals: [],
        state: {},
      },
      version: '1.0',
    },
  },
];

export function getExampleStrategy(id: string): ExampleStrategy | undefined {
  return exampleStrategies.find(s => s.id === id);
}

export function getExampleStrategiesByCategory(category: 'beginner' | 'intermediate' | 'advanced'): ExampleStrategy[] {
  return exampleStrategies.filter(s => s.category === category);
}

