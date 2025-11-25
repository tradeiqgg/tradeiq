// ========================================================
// CHAPTER 2: TRADEIQ - FULL INDICATOR REGISTRY (v1.0)
// ========================================================

export type TQIndicatorOutput =
  | "numeric"
  | "boolean"
  | "band"
  | "series";

export type TQIndicatorParamType =
  | "number"
  | "string"
  | "boolean";

export interface TQIndicatorParamSpec {
  type: TQIndicatorParamType;
  default: any;
  min?: number;
  max?: number;
  allowedValues?: any[];
}

export interface TQIndicatorSpec {
  name: string;
  category: string;
  description: string;
  output: TQIndicatorOutput;
  params: Record<string, TQIndicatorParamSpec>;
  example: string;
}

// =====================================================================
// CATEGORY DEFINITIONS
// =====================================================================

export const TQIndicatorCategories = {
  PRICE: "price",
  MA: "moving_averages",
  MOMENTUM: "momentum",
  VOLATILITY: "volatility",
  VOLUME: "volume",
  TREND: "trend",
  PATTERN: "pattern",
  SENTIMENT: "sentiment"
} as const;

// =====================================================================
// INDICATOR REGISTRY
// =====================================================================

export const TQIndicatorRegistry: Record<string, TQIndicatorSpec> = {

  // ================================================================
  // PRICE-BASED INDICATORS
  // ================================================================

  "price_open": {
    name: "Open Price",
    category: TQIndicatorCategories.PRICE,
    description: "The opening price of each candle.",
    output: "numeric",
    params: {},
    example: "open"
  },

  "price_close": {
    name: "Close Price",
    category: TQIndicatorCategories.PRICE,
    description: "The closing price of each candle.",
    output: "numeric",
    params: {},
    example: "close"
  },

  "price_high": {
    name: "High Price",
    category: TQIndicatorCategories.PRICE,
    description: "The highest price of each candle.",
    output: "numeric",
    params: {},
    example: "high"
  },

  "price_low": {
    name: "Low Price",
    category: TQIndicatorCategories.PRICE,
    description: "The lowest price of each candle.",
    output: "numeric",
    params: {},
    example: "low"
  },

  "hl2": {
    name: "HL2",
    category: TQIndicatorCategories.PRICE,
    description: "Average of high and low.",
    output: "numeric",
    params: {},
    example: "hl2"
  },

  "ohlc4": {
    name: "OHLC4",
    category: TQIndicatorCategories.PRICE,
    description: "Average of open, high, low, close.",
    output: "numeric",
    params: {},
    example: "ohlc4"
  },

  // ================================================================
  // MOVING AVERAGES
  // ================================================================

  "sma": {
    name: "Simple Moving Average",
    category: TQIndicatorCategories.MA,
    description: "Average price over N candles.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 14 },
      source: { type: "string", default: "close", allowedValues: ["open","high","low","close","hl2","ohlc4"] }
    },
    example: "sma(length=14)"
  },

  "ema": {
    name: "Exponential Moving Average",
    category: TQIndicatorCategories.MA,
    description: "Exponentially weighted moving average.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 14 },
      source: { type: "string", default: "close", allowedValues: ["open","high","low","close","hl2","ohlc4"] }
    },
    example: "ema(50)"
  },

  "wma": {
    name: "Weighted Moving Average",
    category: TQIndicatorCategories.MA,
    description: "Price average weighted linearly by age.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 20 }
    },
    example: "wma(20)"
  },

  "hma": {
    name: "Hull Moving Average",
    category: TQIndicatorCategories.MA,
    description: "Fast smoothing with noise reduction.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 20 }
    },
    example: "hma(21)"
  },

  "rma": {
    name: "RMA / SMMA",
    category: TQIndicatorCategories.MA,
    description: "Smoothed moving average.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 14 }
    },
    example: "rma(14)"
  },

  // ================================================================
  // MOMENTUM INDICATORS
  // ================================================================

  "rsi": {
    name: "Relative Strength Index",
    category: TQIndicatorCategories.MOMENTUM,
    description: "Momentum oscillator: 0-100 scale.",
    output: "numeric",
    params: {
      length: { type: "number", min: 2, max: 1000, default: 14 }
    },
    example: "rsi(14)"
  },

  "macd": {
    name: "MACD",
    category: TQIndicatorCategories.MOMENTUM,
    description: "MACD with signal line.",
    output: "series",
    params: {
      fast: { type: "number", min: 2, max: 200, default: 12 },
      slow: { type: "number", min: 2, max: 200, default: 26 },
      signal: { type: "number", min: 2, max: 200, default: 9 }
    },
    example: "macd(fast=12, slow=26, signal=9)"
  },

  "stochastic": {
    name: "Stochastic Oscillator",
    category: TQIndicatorCategories.MOMENTUM,
    description: "Momentum between high-low range.",
    output: "numeric",
    params: {
      k: { type: "number", min: 1, max: 100, default: 14 },
      d: { type: "number", min: 1, max: 100, default: 3 }
    },
    example: "stoch(14,3)"
  },

  "cci": {
    name: "Commodity Channel Index",
    category: TQIndicatorCategories.MOMENTUM,
    description: "Measures price deviation from average.",
    output: "numeric",
    params: {
      length: { type: "number", min: 2, max: 1000, default: 20 }
    },
    example: "cci(20)"
  },

  "roc": {
    name: "Rate of Change",
    category: TQIndicatorCategories.MOMENTUM,
    description: "Percent change over N candles.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 10 }
    },
    example: "roc(10)"
  },

  "adx": {
    name: "ADX",
    category: TQIndicatorCategories.MOMENTUM,
    description: "Measures trend strength.",
    output: "numeric",
    params: {
      length: { type: "number", min: 2, max: 1000, default: 14 }
    },
    example: "adx(14)"
  },

  // ================================================================
  // VOLATILITY INDICATORS
  // ================================================================

  "atr": {
    name: "Average True Range",
    category: TQIndicatorCategories.VOLATILITY,
    description: "Measures volatility range.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 14 }
    },
    example: "atr(14)"
  },

  "bollinger": {
    name: "Bollinger Bands",
    category: TQIndicatorCategories.VOLATILITY,
    description: "Middle band + upper/lower std dev.",
    output: "band",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 20 },
      stddev: { type: "number", min: 0.5, max: 10, default: 2 }
    },
    example: "bb(20,2)"
  },

  "donchian": {
    name: "Donchian Channels",
    category: TQIndicatorCategories.VOLATILITY,
    description: "Highest high and lowest low channel.",
    output: "band",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 20 }
    },
    example: "donchian(20)"
  },

  "keltner": {
    name: "Keltner Channels",
    category: TQIndicatorCategories.VOLATILITY,
    description: "EMA + ATR volatility channel.",
    output: "band",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 20 },
      atr_mult: { type: "number", min: 0.5, max: 10, default: 1.5 }
    },
    example: "keltner(20,1.5)"
  },

  // ================================================================
  // VOLUME INDICATORS
  // ================================================================

  "volume": {
    name: "Volume",
    category: TQIndicatorCategories.VOLUME,
    description: "Total traded volume of each candle.",
    output: "numeric",
    params: {},
    example: "volume"
  },

  "vwap": {
    name: "VWAP",
    category: TQIndicatorCategories.VOLUME,
    description: "Volume-weighted average price.",
    output: "numeric",
    params: {},
    example: "vwap"
  },

  "obv": {
    name: "On-Balance Volume",
    category: TQIndicatorCategories.VOLUME,
    description: "Measures cumulative buyer/seller pressure.",
    output: "numeric",
    params: {},
    example: "obv"
  },

  "chaikin_money_flow": {
    name: "Chaikin Money Flow",
    category: TQIndicatorCategories.VOLUME,
    description: "Volume-weighted accumulation/distribution.",
    output: "numeric",
    params: {
      length: { type: "number", min: 1, max: 1000, default: 20 }
    },
    example: "cmf(20)"
  },

  // ================================================================
  // TREND INDICATORS
  // ================================================================

  "supertrend": {
    name: "Supertrend",
    category: TQIndicatorCategories.TREND,
    description: "Trend-following stop system.",
    output: "series",
    params: {
      length: { type: "number", min: 1, max: 100, default: 10 },
      multiplier: { type: "number", min: 1, max: 10, default: 3 }
    },
    example: "supertrend(10,3)"
  },

  "ichimoku": {
    name: "Ichimoku Cloud",
    category: TQIndicatorCategories.TREND,
    description: "Cloud-based trend visualization.",
    output: "series",
    params: {
      conversion: { type: "number", default: 9, min: 1, max: 100 },
      base: { type: "number", default: 26, min: 1, max: 100 },
      span_b: { type: "number", default: 52, min: 1, max: 200 }
    },
    example: "ichimoku()"
  },

  "sar": {
    name: "Parabolic SAR",
    category: TQIndicatorCategories.TREND,
    description: "Stop and reverse trend indicator.",
    output: "numeric",
    params: {
      step: { type: "number", min: 0.01, max: 1, default: 0.02 },
      max: { type: "number", min: 0.1, max: 5, default: 0.2 }
    },
    example: "sar(step=0.02, max=0.2)"
  },

  // ================================================================
  // PATTERN INDICATORS
  // ================================================================

  "higher_high": {
    name: "Higher High",
    category: TQIndicatorCategories.PATTERN,
    description: "True if current high > previous high.",
    output: "boolean",
    params: {
      lookback: { type: "number", default: 1, min: 1, max: 100 }
    },
    example: "higher_high()"
  },

  "lower_low": {
    name: "Lower Low",
    category: TQIndicatorCategories.PATTERN,
    description: "True if current low < previous low.",
    output: "boolean",
    params: {
      lookback: { type: "number", default: 1, min: 1, max: 100 }
    },
    example: "lower_low()"
  },

  "doji": {
    name: "Doji Pattern",
    category: TQIndicatorCategories.PATTERN,
    description: "True when candle body is small relative to range.",
    output: "boolean",
    params: {
      threshold: { type: "number", default: 0.1, min: 0.01, max: 0.5 }
    },
    example: "doji(0.1)"
  },

  // ================================================================
  // SENTIMENT INDICATORS (FUTURE-ENABLED)
  // ================================================================

  "fear_greed": {
    name: "Fear & Greed Index",
    category: TQIndicatorCategories.SENTIMENT,
    description: "External sentiment index (0-100).",
    output: "numeric",
    params: {},
    example: "fear_greed"
  },

  "news_sentiment": {
    name: "News Sentiment",
    category: TQIndicatorCategories.SENTIMENT,
    description: "Aggregated news sentiment score.",
    output: "numeric",
    params: {},
    example: "news_sentiment"
  }

}; // END OF REGISTRY

export type TQIndicatorId = keyof typeof TQIndicatorRegistry;

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Get indicator specification by ID
 */
export function getIndicatorSpec(id: string): TQIndicatorSpec | undefined {
  return TQIndicatorRegistry[id];
}

/**
 * Check if an indicator ID exists in the registry
 */
export function isValidIndicatorId(id: string): id is TQIndicatorId {
  return id in TQIndicatorRegistry;
}

/**
 * Get all indicators in a specific category
 */
export function getIndicatorsByCategory(category: string): TQIndicatorSpec[] {
  return Object.values(TQIndicatorRegistry).filter(
    (indicator) => indicator.category === category
  );
}

/**
 * Get all indicator IDs
 */
export function getAllIndicatorIds(): TQIndicatorId[] {
  return Object.keys(TQIndicatorRegistry) as TQIndicatorId[];
}

/**
 * Validate indicator parameters against the spec
 */
export interface ParameterValidationError {
  param: string;
  message: string;
}

export function validateIndicatorParams(
  indicatorId: string,
  params: Record<string, any>
): {
  valid: boolean;
  errors: ParameterValidationError[];
  normalizedParams: Record<string, any>;
} {
  const spec = getIndicatorSpec(indicatorId);
  const errors: ParameterValidationError[] = [];
  const normalizedParams: Record<string, any> = {};

  if (!spec) {
    return {
      valid: false,
      errors: [{ param: 'indicator', message: `Unknown indicator: ${indicatorId}` }],
      normalizedParams: {},
    };
  }

  // Check all required params exist and validate them
  for (const [paramName, paramSpec] of Object.entries(spec.params)) {
    const providedValue = params[paramName];

    // Use default if not provided
    if (providedValue === undefined || providedValue === null) {
      normalizedParams[paramName] = paramSpec.default;
      continue;
    }

    normalizedParams[paramName] = providedValue;

    // Type validation
    if (paramSpec.type === 'number') {
      if (typeof providedValue !== 'number' || isNaN(providedValue)) {
        errors.push({
          param: paramName,
          message: `Parameter ${paramName} must be a number`,
        });
        continue;
      }

      // Range validation
      if (paramSpec.min !== undefined && providedValue < paramSpec.min) {
        errors.push({
          param: paramName,
          message: `Parameter ${paramName} must be >= ${paramSpec.min}`,
        });
      }
      if (paramSpec.max !== undefined && providedValue > paramSpec.max) {
        errors.push({
          param: paramName,
          message: `Parameter ${paramName} must be <= ${paramSpec.max}`,
        });
      }
    } else if (paramSpec.type === 'string') {
      if (typeof providedValue !== 'string') {
        errors.push({
          param: paramName,
          message: `Parameter ${paramName} must be a string`,
        });
        continue;
      }

      // Allowed values validation
      if (paramSpec.allowedValues && !paramSpec.allowedValues.includes(providedValue)) {
        errors.push({
          param: paramName,
          message: `Parameter ${paramName} must be one of: ${paramSpec.allowedValues.join(', ')}`,
        });
      }
    } else if (paramSpec.type === 'boolean') {
      if (typeof providedValue !== 'boolean') {
        errors.push({
          param: paramName,
          message: `Parameter ${paramName} must be a boolean`,
        });
      }
    }
  }

  // Check for unknown parameters
  for (const paramName of Object.keys(params)) {
    if (!(paramName in spec.params)) {
      errors.push({
        param: paramName,
        message: `Unknown parameter: ${paramName}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalizedParams,
  };
}

/**
 * Get default parameters for an indicator
 */
export function getDefaultParams(indicatorId: string): Record<string, any> {
  const spec = getIndicatorSpec(indicatorId);
  if (!spec) return {};

  const defaults: Record<string, any> = {};
  for (const [paramName, paramSpec] of Object.entries(spec.params)) {
    defaults[paramName] = paramSpec.default;
  }
  return defaults;
}

/**
 * Count total indicators in registry
 */
export function getIndicatorCount(): number {
  return Object.keys(TQIndicatorRegistry).length;
}

/**
 * Get indicators grouped by category
 */
export function getIndicatorsByCategoryMap(): Record<string, TQIndicatorSpec[]> {
  const grouped: Record<string, TQIndicatorSpec[]> = {};
  
  for (const indicator of Object.values(TQIndicatorRegistry)) {
    if (!grouped[indicator.category]) {
      grouped[indicator.category] = [];
    }
    grouped[indicator.category].push(indicator);
  }
  
  return grouped;
}

