/**
 * ============================================
 * 📘 CHAPTER 1 OF 12: TQ-JSS
 * TRADEIQ JSON STRATEGY SCHEMA — v1.0
 * ============================================
 * 
 * This is the source of truth for the entire platform.
 * Everything — the block editor, TQL text editor, the backtester, 
 * AI tools, debugger, validator, competitions — all use THIS schema under the hood.
 * 
 * It must be:
 * - strict
 * - complete
 * - unambiguous
 * - future-proof
 * - readable
 * - writable
 * - fully validated
 */

// ================================
// 📌 RESERVED KEYWORDS
// ================================

export const RESERVED_KEYWORDS = [
  'open',
  'high',
  'low',
  'close',
  'volume',
  'time',
  'candle',
  'position',
  'long',
  'short',
  'true',
  'false',
  'null',
  'enter',
  'exit',
  'buy',
  'sell',
  'strategy',
  'rules',
  'indicators',
  'risk',
  'settings',
  'runtime',
] as const;

export type ReservedKeyword = typeof RESERVED_KEYWORDS[number];

// ================================
// 📌 TYPE DEFINITIONS
// ================================

/**
 * Valid operator types for conditions
 */
export type ConditionOperator =
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'eq'
  | 'neq'
  | 'crosses_above'
  | 'crosses_below';

/**
 * Valid source types for condition operands
 */
export type SourceType =
  | 'indicator'
  | 'price'
  | 'value'
  | 'math'
  | 'series'
  | 'indicator_output';

/**
 * Position direction
 */
export type PositionDirection = 'long' | 'short' | 'any';

/**
 * Position mode
 */
export type PositionMode = 'long_only' | 'short_only' | 'long_short';

/**
 * Execution mode
 */
export type ExecutionMode = 'candle_close' | 'intrabar' | 'tick';

/**
 * Size mode for position sizing
 */
export type SizeMode = 'percent' | 'fixed';

/**
 * Indicator output type
 */
export type IndicatorOutputType = 'numeric' | 'boolean' | 'band' | 'series';

/**
 * Price field reference
 */
export type PriceField = 'open' | 'high' | 'low' | 'close' | 'volume';

// ================================
// 📌 2. META SECTION
// ================================

export interface Meta {
  /** User-facing strategy name */
  name: string;
  /** Long description */
  description: string;
  /** Wallet address */
  author: string;
  /** ISO8601 timestamp */
  created_at: string;
  /** ISO8601 timestamp */
  updated_at: string;
}

// ================================
// 📌 3. SETTINGS SECTION
// ================================

export interface Settings {
  /** Trading symbol (e.g., "BTCUSDT") */
  symbol: string;
  /** Timeframe (e.g., "1h", "15m", "1d") */
  timeframe: string;
  /** Initial balance for backtesting */
  initial_balance: number;
  /** Position mode */
  position_mode: PositionMode;
  /** Maximum number of open positions */
  max_open_positions: number;
  /** Allow re-entry into positions */
  allow_reentry: boolean;
  /** Execution mode */
  execution_mode: ExecutionMode;
}

// ================================
// 📌 4. INDICATORS SECTION
// ================================

export interface Indicator {
  /** Unique identifier for this indicator */
  id: string;
  /** Indicator type name (e.g., "rsi", "sma", "ema") */
  indicator: string;
  /** Indicator parameters */
  params: Record<string, any>;
  /** Output type */
  output: IndicatorOutputType;
}

// ================================
// 📌 5. RULES SECTION - Condition Structure
// ================================

/**
 * Source reference for condition operands
 */
export interface SourceReference {
  source_type: SourceType;
  /** Required when source_type is "indicator" */
  id?: string;
  /** Required when source_type is "price" */
  field?: PriceField;
  /** Required when source_type is "value" */
  value?: number | string | boolean;
  /** Required when source_type is "math" */
  expression?: string;
  /** Required when source_type is "indicator_output" */
  indicator_id?: string;
  /** Required when source_type is "indicator_output" */
  output_key?: string;
}

/**
 * Condition block
 */
export interface Condition {
  type: 'condition';
  left: SourceReference;
  operator: ConditionOperator;
  right: SourceReference;
}

/**
 * Logical operator for combining conditions
 */
export type LogicalOperator = 'and' | 'or';

/**
 * Condition group (AND/OR logic)
 */
export interface ConditionGroup {
  type: 'group';
  operator: LogicalOperator;
  conditions: (Condition | ConditionGroup)[];
}

// ================================
// 📌 6. ACTIONS (ENTRY & EXIT)
// ================================

/**
 * Entry action
 */
export interface EnterPositionAction {
  type: 'enter_position';
  direction: 'long' | 'short';
  size_mode: SizeMode;
  size: number;
}

/**
 * Exit action
 */
export interface ExitPositionAction {
  type: 'exit_position';
  direction: PositionDirection;
}

export type Action = EnterPositionAction | ExitPositionAction;

/**
 * Rule structure (condition + action)
 */
export interface Rule {
  /** Conditions that must be met (AND logic by default) */
  conditions: (Condition | ConditionGroup)[];
  /** Action to execute when conditions are met */
  action: Action;
}

// ================================
// 📌 7. RISK SECTION
// ================================

export interface Risk {
  /** Position size as percentage of balance */
  position_size_percent: number;
  /** Maximum risk per trade as percentage */
  max_risk_per_trade_percent: number;
  /** Stop loss as percentage */
  stop_loss_percent: number | null;
  /** Take profit as percentage */
  take_profit_percent: number | null;
  /** Trailing stop as percentage (alternative to stop_loss) */
  trailing_stop_percent: number | null;
  /** Maximum daily loss as percentage */
  max_daily_loss_percent: number;
  /** Maximum trades per day */
  max_daily_trades: number;
}

// ================================
// 📌 8. RUNTIME SECTION
// ================================

export interface RuntimeLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, any>;
}

export interface Signal {
  timestamp: string;
  type: 'entry' | 'exit';
  direction: PositionDirection;
  price: number;
  reason: string;
}

export interface Runtime {
  /** Runtime logs */
  logs: RuntimeLog[];
  /** Last computed signals */
  last_signals: Signal[];
  /** Arbitrary state storage */
  state: Record<string, any>;
}

// ================================
// 📌 1. ROOT OBJECT
// ================================

export interface TQJSSchema {
  /** Strategy metadata */
  meta: Meta;
  /** Strategy settings */
  settings: Settings;
  /** Indicator definitions */
  indicators: Indicator[];
  /** Trading rules */
  rules: {
    /** Entry rules */
    entry: Rule[];
    /** Exit rules */
    exit: Rule[];
    /** Filter rules (applied to all entries/exits) */
    filters: Rule[];
  };
  /** Risk management parameters */
  risk: Risk;
  /** Runtime data (for backtesting, live sim, logging) */
  runtime: Runtime;
  /** Schema version */
  version: string;
}

// ================================
// 📌 10. VALIDATION REQUIREMENTS
// ================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates a TQ-JSS schema
 */
export function validateTQJSSchema(schema: Partial<TQJSSchema>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check meta.name exists
  if (!schema.meta?.name || typeof schema.meta.name !== 'string' || schema.meta.name.trim() === '') {
    errors.push({
      field: 'meta.name',
      message: 'Strategy name is required',
      code: 'META_NAME_MISSING',
    });
  }

  // Check settings.symbol + settings.timeframe
  if (!schema.settings?.symbol || typeof schema.settings.symbol !== 'string') {
    errors.push({
      field: 'settings.symbol',
      message: 'Trading symbol is required',
      code: 'SETTINGS_SYMBOL_MISSING',
    });
  }

  if (!schema.settings?.timeframe || typeof schema.settings.timeframe !== 'string') {
    errors.push({
      field: 'settings.timeframe',
      message: 'Timeframe is required',
      code: 'SETTINGS_TIMEFRAME_MISSING',
    });
  }

  // Check risk.stop_loss_percent OR risk.trailing_stop_percent must exist
  if (
    (!schema.risk?.stop_loss_percent || schema.risk.stop_loss_percent === null) &&
    (!schema.risk?.trailing_stop_percent || schema.risk.trailing_stop_percent === null)
  ) {
    errors.push({
      field: 'risk',
      message: 'Either stop_loss_percent or trailing_stop_percent must be set',
      code: 'RISK_STOP_MISSING',
    });
  }

  // Check at least ONE entry rule
  if (!schema.rules?.entry || schema.rules.entry.length === 0) {
    errors.push({
      field: 'rules.entry',
      message: 'At least one entry rule is required',
      code: 'RULES_ENTRY_MISSING',
    });
  }

  // Check at least ONE exit rule
  if (!schema.rules?.exit || schema.rules.exit.length === 0) {
    errors.push({
      field: 'rules.exit',
      message: 'At least one exit rule is required',
      code: 'RULES_EXIT_MISSING',
    });
  }

  // Check every condition uses valid indicators
  if (schema.rules) {
    const allRules = [
      ...(schema.rules.entry || []),
      ...(schema.rules.exit || []),
      ...(schema.rules.filters || []),
    ];

    const indicatorIds = new Set((schema.indicators || []).map((ind) => ind.id));

    for (const rule of allRules) {
      if (rule.conditions) {
        for (const condition of rule.conditions) {
          if ('left' in condition && condition.left.source_type === 'indicator') {
            if (!condition.left.id || !indicatorIds.has(condition.left.id)) {
              errors.push({
                field: 'rules',
                message: `Indicator "${condition.left.id}" is referenced but not defined`,
                code: 'INDICATOR_UNDEFINED',
              });
            }
          }
          if ('right' in condition && condition.right.source_type === 'indicator') {
            if (!condition.right.id || !indicatorIds.has(condition.right.id)) {
              errors.push({
                field: 'rules',
                message: `Indicator "${condition.right.id}" is referenced but not defined`,
                code: 'INDICATOR_UNDEFINED',
              });
            }
          }
        }
      }
    }
  }

  // Check no direction conflicts
  if (schema.settings && schema.rules) {
    const positionMode = schema.settings.position_mode;
    const allRules = [
      ...(schema.rules.entry || []),
      ...(schema.rules.exit || []),
    ];

    for (const rule of allRules) {
      if (rule.action) {
        if (rule.action.type === 'enter_position') {
          if (positionMode === 'long_only' && rule.action.direction === 'short') {
            errors.push({
              field: 'rules',
              message: 'Cannot enter short position in long_only mode',
              code: 'DIRECTION_CONFLICT',
            });
          }
          if (positionMode === 'short_only' && rule.action.direction === 'long') {
            errors.push({
              field: 'rules',
              message: 'Cannot enter long position in short_only mode',
              code: 'DIRECTION_CONFLICT',
            });
          }
        }
      }
    }
  }

  // Check max_trades_per_day ≥ 1
  if (schema.risk?.max_daily_trades !== undefined && schema.risk.max_daily_trades < 1) {
    errors.push({
      field: 'risk.max_daily_trades',
      message: 'max_daily_trades must be at least 1',
      code: 'RISK_MAX_TRADES_INVALID',
    });
  }

  // Check position_size_percent ≤ 100
  if (schema.risk?.position_size_percent !== undefined && schema.risk.position_size_percent > 100) {
    errors.push({
      field: 'risk.position_size_percent',
      message: 'position_size_percent cannot exceed 100',
      code: 'RISK_POSITION_SIZE_INVALID',
    });
  }

  // Check for reserved keywords in indicator IDs
  if (schema.indicators) {
    for (const indicator of schema.indicators) {
      if (RESERVED_KEYWORDS.includes(indicator.id.toLowerCase() as ReservedKeyword)) {
        errors.push({
          field: `indicators[${indicator.id}]`,
          message: `Indicator ID "${indicator.id}" is a reserved keyword`,
          code: 'RESERVED_KEYWORD',
        });
      }
    }
  }

  // Warnings
  if (schema.risk?.stop_loss_percent !== undefined && schema.risk.stop_loss_percent !== null) {
    if (schema.risk.stop_loss_percent > 50) {
      warnings.push({
        field: 'risk.stop_loss_percent',
        message: 'Stop loss exceeds 50% - this is unusually high',
        code: 'RISK_STOP_LOSS_HIGH',
      });
    }
  }

  if (
    schema.risk?.stop_loss_percent !== undefined &&
    schema.risk.stop_loss_percent !== null &&
    schema.risk?.take_profit_percent !== undefined &&
    schema.risk.take_profit_percent !== null
  ) {
    if (schema.risk.take_profit_percent < schema.risk.stop_loss_percent * 0.5) {
      warnings.push({
        field: 'risk.take_profit_percent',
        message: 'Take profit is less than 0.5× stop loss - consider adjusting',
        code: 'RISK_TP_LOW',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ================================
// 📌 11. DEBUGGER RULES
// ================================

export interface DebuggerCheck {
  type: 'structural' | 'logic' | 'risk' | 'block_compiler';
  severity: 'error' | 'warning';
  message: string;
  field?: string;
}

/**
 * Performs comprehensive debugger checks on a strategy
 */
export function debugStrategy(schema: Partial<TQJSSchema>): DebuggerCheck[] {
  const checks: DebuggerCheck[] = [];

  // STRUCTURAL ERRORS
  if (!schema.meta) {
    checks.push({
      type: 'structural',
      severity: 'error',
      message: 'Missing meta section',
      field: 'meta',
    });
  }

  if (!schema.settings) {
    checks.push({
      type: 'structural',
      severity: 'error',
      message: 'Missing settings section',
      field: 'settings',
    });
  }

  if (!schema.indicators || schema.indicators.length === 0) {
    checks.push({
      type: 'structural',
      severity: 'warning',
      message: 'No indicators defined',
      field: 'indicators',
    });
  }

  // Check for unbound variables (indicators referenced but not defined)
  if (schema.rules && schema.indicators) {
    const indicatorIds = new Set(schema.indicators.map((ind) => ind.id));
    const allRules = [
      ...(schema.rules.entry || []),
      ...(schema.rules.exit || []),
      ...(schema.rules.filters || []),
    ];

    for (const rule of allRules) {
      if (rule.conditions) {
        for (const condition of rule.conditions) {
          if ('left' in condition && condition.left.source_type === 'indicator') {
            if (!indicatorIds.has(condition.left.id!)) {
              checks.push({
                type: 'structural',
                severity: 'error',
                message: `Unbound indicator reference: ${condition.left.id}`,
                field: 'rules',
              });
            }
          }
        }
      }
    }
  }

  // LOGIC ERRORS
  if (schema.rules) {
    const entryRules = schema.rules.entry || [];
    const exitRules = schema.rules.exit || [];

    // Check for empty condition groups
    for (const rule of [...entryRules, ...exitRules]) {
      if (rule.conditions && rule.conditions.length === 0) {
        checks.push({
          type: 'logic',
          severity: 'error',
          message: 'Rule has no conditions',
          field: 'rules',
        });
      }
    }

    // Check for impossible comparisons (e.g., comparing incompatible types)
    // This would require runtime type checking, but we can do basic validation
  }

  // RISK ERRORS
  if (schema.risk) {
    if (schema.risk.stop_loss_percent !== undefined && schema.risk.stop_loss_percent !== null) {
      if (schema.risk.stop_loss_percent > 50) {
        checks.push({
          type: 'risk',
          severity: 'warning',
          message: 'Stop loss exceeds 50%',
          field: 'risk.stop_loss_percent',
        });
      }
    }

    if (schema.risk.position_size_percent > 100) {
      checks.push({
        type: 'risk',
        severity: 'error',
        message: 'Position size exceeds 100%',
        field: 'risk.position_size_percent',
      });
    }

    if (
      schema.risk.take_profit_percent !== undefined &&
      schema.risk.take_profit_percent !== null &&
      schema.risk.stop_loss_percent !== undefined &&
      schema.risk.stop_loss_percent !== null
    ) {
      if (schema.risk.take_profit_percent < schema.risk.stop_loss_percent * 0.5) {
        checks.push({
          type: 'risk',
          severity: 'warning',
          message: 'Take profit is less than 0.5× stop loss',
          field: 'risk.take_profit_percent',
        });
      }
    }
  }

  return checks;
}

// ================================
// 📌 12. TEST CASES - Example Valid Strategy
// ================================

export const EXAMPLE_VALID_STRATEGY: TQJSSchema = {
  meta: {
    name: 'RSI Basic',
    description: 'Buy RSI<30 sell RSI>70',
    author: 'WALLET123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
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
      id: 'rsi_main',
      indicator: 'rsi',
      params: { length: 14, source: 'close' },
      output: 'numeric',
    },
  ],
  rules: {
    entry: [
      {
        conditions: [
          {
            type: 'condition',
            left: { source_type: 'indicator', id: 'rsi_main' },
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
            left: { source_type: 'indicator', id: 'rsi_main' },
            operator: 'gt',
            right: { source_type: 'value', value: 70 },
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
    position_size_percent: 10,
    max_risk_per_trade_percent: 2,
    stop_loss_percent: 3,
    take_profit_percent: 7,
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
};

// ================================
// 📌 EXPORTS
// ================================

/**
 * Schema utilities and constants
 * Note: All types/interfaces are already exported above
 */
export const TQJSSchemaUtils = {
  // Constants
  RESERVED_KEYWORDS,
  EXAMPLE_VALID_STRATEGY,
  // Functions
  validateTQJSSchema,
  debugStrategy,
  // Version
  VERSION: '1.0',
} as const;

// Default export for convenience (exports the utilities object)
export default TQJSSchemaUtils;

