// =====================================================================
// CHAPTER 3: BLOCK REGISTRY (TQ-BLOCKS) — v1.0
// =====================================================================
//
// This registry defines:
//  - All block types
//  - Block categories
//  - Input/output ports
//  - Allowed child structure
//  - Mapping to JSON strategy schema (TQ-JSS)
//  - Mapping to TQL syntax
//  - Validation rules
//  - Info-button documentation metadata
//
// =====================================================================

import type { Indicator } from './schema';
import { TQIndicatorRegistry, getIndicatorSpec, type TQIndicatorId } from './indicators';

export type TQBlockCategory =
  | "indicator"
  | "value"
  | "logic"
  | "math"
  | "rule"
  | "entry"
  | "exit"
  | "filter"
  | "risk"
  | "meta";

export type TQBlockInputType =
  | "indicator"
  | "number"
  | "boolean"
  | "string"
  | "comparison"
  | "action"
  | "rule_chain";

export interface TQBlockInputSpec {
  name: string;
  type: TQBlockInputType;
  optional?: boolean;
  description: string;
}

export interface TQBlockOutputSpec {
  type: TQBlockInputType;
  description: string;
}

export interface TQBlockSpec {
  id: string;
  label: string;
  category: TQBlockCategory;
  color: string;
  description: string;
  info: string; // for "i" button pop-up
  inputs: TQBlockInputSpec[];
  output?: TQBlockOutputSpec;
  allowedChildren?: string[];
  tql?: (args: any) => string;
  toJSON?: (args: any) => Record<string, any>;
}

// =====================================================================
// BLOCK CATEGORY COLORS (UI definition)
// =====================================================================

export const TQBlockColors = {
  indicator: "#4FD0FF",
  value: "#FFD84F",
  logic: "#FF6B6B",
  math: "#A890FF",
  rule: "#4FFF85",
  entry: "#4FFF85",
  exit: "#FF628C",
  filter: "#C7FF4F",
  risk: "#FF9F4F",
  meta: "#808080"
};

// =====================================================================
// BLOCK REGISTRY
// =====================================================================

export const TQBlockRegistry: Record<string, TQBlockSpec> = {

  // ================================================================
  // 1. INDICATOR BLOCKS
  // These wrap indicator definitions from Chapter 2 and expose them
  // as drag-and-drop blocks.
  // ================================================================

  "indicator_generic": {
    id: "indicator_generic",
    label: "Indicator",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Select any indicator from the registry and configure its parameters.",
    info: "An indicator block allows you to use RSI, MACD, MA, etc. Indicators produce numeric or boolean values depending on the indicator.",
    inputs: [
      { name: "indicator_id", type: "string", description: "The indicator to use." },
      { name: "params", type: "string", optional: true, description: "Indicator parameters." }
    ],
    output: {
      type: "indicator",
      description: "Produces indicator output usable in conditions."
    },
    tql: (args) => `${args.indicator_id}(${JSON.stringify(args.params)})`,
    toJSON: (args) => ({
      source_type: "indicator",
      id: args.indicator_id,
      params: args.params || {}
    })
  },

  // Individual Indicator Blocks
  "indicator_rsi": {
    id: "indicator_rsi",
    label: "RSI",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Relative Strength Index - Momentum oscillator (0-100).",
    info: "RSI measures momentum. Values above 70 indicate overbought, below 30 oversold.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 14).", optional: true }
    ],
    output: { type: "indicator", description: "RSI value (0-100)." },
    tql: (args) => `rsi(length: ${args.length || 14})`,
    toJSON: (args) => ({ source_type: "indicator", id: "rsi", params: { length: args.length || 14 } })
  },

  "indicator_macd": {
    id: "indicator_macd",
    label: "MACD",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "MACD with signal line - Trend momentum indicator.",
    info: "MACD shows trend changes. Watch for MACD crossing above/below signal line.",
    inputs: [
      { name: "fast", type: "number", description: "Fast period (default: 12).", optional: true },
      { name: "slow", type: "number", description: "Slow period (default: 26).", optional: true },
      { name: "signal", type: "number", description: "Signal period (default: 9).", optional: true }
    ],
    output: { type: "indicator", description: "MACD series." },
    tql: (args) => `macd(fast: ${args.fast || 12}, slow: ${args.slow || 26}, signal: ${args.signal || 9})`,
    toJSON: (args) => ({ source_type: "indicator", id: "macd", params: { fast: args.fast || 12, slow: args.slow || 26, signal: args.signal || 9 } })
  },

  "indicator_sma": {
    id: "indicator_sma",
    label: "SMA",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Simple Moving Average - Average price over N candles.",
    info: "SMA smooths price data. Use to identify trends and support/resistance levels.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 20).", optional: true },
      { name: "source", type: "string", description: "Price source (default: close).", optional: true }
    ],
    output: { type: "indicator", description: "SMA value." },
    tql: (args) => `sma(length: ${args.length || 20}${args.source ? `, source: ${args.source}` : ''})`,
    toJSON: (args) => ({ source_type: "indicator", id: "sma", params: { length: args.length || 20, source: args.source || "close" } })
  },

  "indicator_ema": {
    id: "indicator_ema",
    label: "EMA",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Exponential Moving Average - Weighted average giving more weight to recent prices.",
    info: "EMA reacts faster to price changes than SMA. Popular periods: 9, 21, 50, 200.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 20).", optional: true },
      { name: "source", type: "string", description: "Price source (default: close).", optional: true }
    ],
    output: { type: "indicator", description: "EMA value." },
    tql: (args) => `ema(length: ${args.length || 20}${args.source ? `, source: ${args.source}` : ''})`,
    toJSON: (args) => ({ source_type: "indicator", id: "ema", params: { length: args.length || 20, source: args.source || "close" } })
  },

  "indicator_bollinger": {
    id: "indicator_bollinger",
    label: "Bollinger Bands",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Bollinger Bands - Volatility bands around moving average.",
    info: "Bands expand during volatility. Price touching lower band may indicate oversold, upper band overbought.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 20).", optional: true },
      { name: "stddev", type: "number", description: "Standard deviation multiplier (default: 2).", optional: true }
    ],
    output: { type: "indicator", description: "Bollinger Bands (upper, middle, lower)." },
    tql: (args) => `bollinger(length: ${args.length || 20}, stddev: ${args.stddev || 2})`,
    toJSON: (args) => ({ source_type: "indicator", id: "bollinger", params: { length: args.length || 20, stddev: args.stddev || 2 } })
  },

  "indicator_atr": {
    id: "indicator_atr",
    label: "ATR",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Average True Range - Measures market volatility.",
    info: "ATR shows volatility. Higher ATR = more volatile market. Use for stop-loss placement.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 14).", optional: true }
    ],
    output: { type: "indicator", description: "ATR value." },
    tql: (args) => `atr(length: ${args.length || 14})`,
    toJSON: (args) => ({ source_type: "indicator", id: "atr", params: { length: args.length || 14 } })
  },

  "indicator_stochastic": {
    id: "indicator_stochastic",
    label: "Stochastic",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Stochastic Oscillator - Momentum indicator comparing closing price to price range.",
    info: "Values above 80 = overbought, below 20 = oversold. Watch for %K crossing %D.",
    inputs: [
      { name: "k", type: "number", description: "K period (default: 14).", optional: true },
      { name: "d", type: "number", description: "D period (default: 3).", optional: true }
    ],
    output: { type: "indicator", description: "Stochastic value." },
    tql: (args) => `stochastic(k: ${args.k || 14}, d: ${args.d || 3})`,
    toJSON: (args) => ({ source_type: "indicator", id: "stochastic", params: { k: args.k || 14, d: args.d || 3 } })
  },

  "indicator_cci": {
    id: "indicator_cci",
    label: "CCI",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Commodity Channel Index - Measures price deviation from average.",
    info: "CCI above +100 = strong uptrend, below -100 = strong downtrend.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 20).", optional: true }
    ],
    output: { type: "indicator", description: "CCI value." },
    tql: (args) => `cci(length: ${args.length || 20})`,
    toJSON: (args) => ({ source_type: "indicator", id: "cci", params: { length: args.length || 20 } })
  },

  "indicator_adx": {
    id: "indicator_adx",
    label: "ADX",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Average Directional Index - Measures trend strength.",
    info: "ADX above 25 = strong trend, below 20 = weak/no trend. Doesn't show direction, only strength.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 14).", optional: true }
    ],
    output: { type: "indicator", description: "ADX value." },
    tql: (args) => `adx(length: ${args.length || 14})`,
    toJSON: (args) => ({ source_type: "indicator", id: "adx", params: { length: args.length || 14 } })
  },

  "indicator_wma": {
    id: "indicator_wma",
    label: "WMA",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Weighted Moving Average - Linearly weighted average.",
    info: "WMA gives more weight to recent prices. Reacts faster than SMA.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 20).", optional: true }
    ],
    output: { type: "indicator", description: "WMA value." },
    tql: (args) => `wma(length: ${args.length || 20})`,
    toJSON: (args) => ({ source_type: "indicator", id: "wma", params: { length: args.length || 20 } })
  },

  "indicator_hma": {
    id: "indicator_hma",
    label: "HMA",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "Hull Moving Average - Fast smoothing with noise reduction.",
    info: "HMA reduces lag while maintaining smoothness. Popular for trend following.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 20).", optional: true }
    ],
    output: { type: "indicator", description: "HMA value." },
    tql: (args) => `hma(length: ${args.length || 20})`,
    toJSON: (args) => ({ source_type: "indicator", id: "hma", params: { length: args.length || 20 } })
  },

  "indicator_rma": {
    id: "indicator_rma",
    label: "RMA",
    category: "indicator",
    color: TQBlockColors.indicator,
    description: "RMA / SMMA - Smoothed Moving Average.",
    info: "RMA is similar to EMA but uses different smoothing. Used in some indicators like RSI.",
    inputs: [
      { name: "length", type: "number", description: "Period length (default: 14).", optional: true }
    ],
    output: { type: "indicator", description: "RMA value." },
    tql: (args) => `rma(length: ${args.length || 14})`,
    toJSON: (args) => ({ source_type: "indicator", id: "rma", params: { length: args.length || 14 } })
  },

  // ================================================================
  // 2. VALUE BLOCKS
  // ================================================================

  "value_number": {
    id: "value_number",
    label: "Number",
    category: "value",
    color: TQBlockColors.value,
    description: "A numeric constant.",
    info: "Use this block for threshold values like RSI < 30 or price > 20000.",
    inputs: [
      { name: "value", type: "number", description: "Numeric value." }
    ],
    output: {
      type: "number",
      description: "Outputs a numeric value."
    },
    tql: (args) => `${args.value}`,
    toJSON: (args) => ({
      source_type: "value",
      value: Number(args.value)
    })
  },

  "value_boolean": {
    id: "value_boolean",
    label: "Boolean",
    category: "value",
    color: TQBlockColors.value,
    description: "True or false value.",
    info: "Used for boolean logic or pattern detections.",
    inputs: [
      { name: "value", type: "boolean", description: "True or False." }
    ],
    output: {
      type: "boolean",
      description: "Outputs a boolean."
    },
    tql: (args) => `${args.value}`,
    toJSON: (args) => ({
      source_type: "value",
      value: Boolean(args.value)
    })
  },

  "value_string": {
    id: "value_string",
    label: "String",
    category: "value",
    color: TQBlockColors.value,
    description: "A text string value.",
    info: "Used for string comparisons or text values.",
    inputs: [
      { name: "value", type: "string", description: "String value." }
    ],
    output: {
      type: "string",
      description: "Outputs a string value."
    },
    tql: (args) => `"${args.value}"`,
    toJSON: (args) => ({
      source_type: "value",
      value: String(args.value)
    })
  },

  "value_price": {
    id: "value_price",
    label: "Price Field",
    category: "value",
    color: TQBlockColors.value,
    description: "Reference to price data (open, high, low, close, volume).",
    info: "Use to access current candle price data.",
    inputs: [
      { name: "field", type: "string", description: "Price field: open, high, low, close, volume." }
    ],
    output: {
      type: "number",
      description: "Outputs the price field value."
    },
    tql: (args) => args.field,
    toJSON: (args) => ({
      source_type: "price",
      field: args.field
    })
  },

  "value_reference": {
    id: "value_reference",
    label: "Reference",
    category: "value",
    color: TQBlockColors.value,
    description: "Reference to another block's output.",
    info: "Use to connect blocks together.",
    inputs: [
      { name: "reference_id", type: "string", description: "ID of the referenced block." }
    ],
    output: {
      type: "indicator",
      description: "Outputs the referenced block's value."
    },
    tql: (args) => args.reference_id,
    toJSON: (args) => ({
      source_type: "indicator",
      id: args.reference_id
    })
  },

  // ================================================================
  // 3. LOGIC BLOCKS (CONDITIONS)
  // ================================================================

  "logic_compare": {
    id: "logic_compare",
    label: "Compare",
    category: "logic",
    color: TQBlockColors.logic,
    description: "Compare two values using >, <, ==, etc.",
    info: "Use this block to build conditions like RSI < 30 or price > MA.",
    inputs: [
      { name: "left", type: "comparison", description: "Left side." },
      { name: "operator", type: "string", description: "Operator (gt, lt, gte, lte, eq, neq)." },
      { name: "right", type: "comparison", description: "Right side." }
    ],
    output: {
      type: "boolean",
      description: "Returns result of the comparison."
    },
    tql: (args) => `${args.left} ${args.operator} ${args.right}`,
    toJSON: (args) => ({
      type: "condition",
      left: args.left,
      operator: args.operator,
      right: args.right
    })
  },

  "logic_cross": {
    id: "logic_cross",
    label: "Crosses",
    category: "logic",
    color: TQBlockColors.logic,
    description: "Detects indicator crossovers.",
    info: "Use for MACD crossing signal or EMA50 crossing EMA200.",
    inputs: [
      { name: "left", type: "comparison", description: "Left indicator." },
      { name: "direction", type: "string", description: "crosses_above or crosses_below" },
      { name: "right", type: "comparison", description: "Right indicator." }
    ],
    output: { type: "boolean", description: "True on crossover event." },
    tql: (args) => `${args.left} ${args.direction} ${args.right}`,
    toJSON: (args) => ({
      type: "condition",
      left: args.left,
      operator: args.direction,
      right: args.right
    })
  },

  // ================================================================
  // 4. RULE BLOCKS
  // ================================================================

  "rule_group": {
    id: "rule_group",
    label: "Rule Group",
    category: "rule",
    color: TQBlockColors.rule,
    description: "A group of conditions and actions representing entries or exits.",
    info: "Attach multiple conditions and one or more actions into a complete rule.",
    inputs: [
      { name: "conditions", type: "rule_chain", description: "List of boolean conditions." },
      { name: "actions", type: "action", description: "Entry or exit actions." }
    ],
    allowedChildren: ["logic_compare", "logic_cross", "entry_market", "exit_position"],
    toJSON: (args) => [...args.conditions, ...args.actions]
  },

  // ================================================================
  // 5. ENTRY ACTIONS
  // ================================================================

  "entry_market": {
    id: "entry_market",
    label: "Enter Position",
    category: "entry",
    color: TQBlockColors.entry,
    description: "Enter long or short position.",
    info: "Defines market entry: direction and size.",
    inputs: [
      { name: "direction", type: "string", description: "long or short." },
      { name: "size_mode", type: "string", description: "percent or fixed." },
      { name: "size", type: "number", description: "Size value." }
    ],
    output: {
      type: "action",
      description: "Action to open a position."
    },
    tql: (args) => `enter ${args.direction} size=${args.size}${args.size_mode === "percent" ? "%" : ""}`,
    toJSON: (args) => ({
      type: "enter_position",
      direction: args.direction,
      size_mode: args.size_mode,
      size: Number(args.size)
    })
  },

  // ================================================================
  // 6. EXIT ACTIONS
  // ================================================================

  "exit_position": {
    id: "exit_position",
    label: "Exit Position",
    category: "exit",
    color: TQBlockColors.exit,
    description: "Closes a position (long, short, or any).",
    info: "Used inside exit rule groups.",
    inputs: [
      { name: "direction", type: "string", description: "long, short, or any." }
    ],
    output: {
      type: "action",
      description: "Action to close a position."
    },
    tql: (args) => `exit ${args.direction}`,
    toJSON: (args) => ({
      type: "exit_position",
      direction: args.direction
    })
  }

}; // END REGISTRY

export type TQBlockId = keyof typeof TQBlockRegistry;

// =====================================================================
// BLOCK VALIDATOR
// =====================================================================

export interface BlockValidationError {
  field: string;
  message: string;
}

export interface BlockValidationResult {
  valid: boolean;
  errors: BlockValidationError[];
}

export function validateBlockInstance(
  blockId: string,
  args: Record<string, any>
): BlockValidationResult {
  const spec = TQBlockRegistry[blockId];

  if (!spec) {
    return {
      valid: false,
      errors: [{ field: 'blockId', message: `Invalid block ID: ${blockId}` }],
    };
  }

  const errors: BlockValidationError[] = [];

  // Validate inputs
  for (const input of spec.inputs) {
    const value = args[input.name];

    if (!input.optional && (value === undefined || value === null)) {
      errors.push({
        field: input.name,
        message: `Missing required input: ${input.name}`,
      });
      continue;
    }

    // Type validation (skip for comparison type as it can be various types)
    if (
      value !== undefined &&
      input.type !== "comparison" &&
      input.type !== "rule_chain" &&
      input.type !== "action"
    ) {
      const expectedType = input.type === "number" ? "number" :
                          input.type === "boolean" ? "boolean" :
                          input.type === "string" ? "string" : "any";

      // Special handling for indicator params - can be string or object
      if (input.name === "params" && blockId === "indicator_generic") {
        // Allow both string and object for params
        if (typeof value !== "string" && typeof value !== "object") {
          errors.push({
            field: input.name,
            message: `Invalid type for ${input.name}. Expected string or object, got ${typeof value}.`,
          });
        }
      } else if (expectedType !== "any" && typeof value !== expectedType) {
        errors.push({
          field: input.name,
          message: `Invalid type for ${input.name}. Expected ${expectedType}, got ${typeof value}.`,
        });
      }
    }
  }

  // Special validation for indicator blocks
  if (blockId === "indicator_generic" && args.indicator_id) {
    if (!getIndicatorSpec(args.indicator_id)) {
      errors.push({
        field: "indicator_id",
        message: `Unknown indicator: ${args.indicator_id}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Get block specification by ID
 */
export function getBlockSpec(blockId: string): TQBlockSpec | undefined {
  return TQBlockRegistry[blockId];
}

/**
 * Check if a block ID exists in the registry
 */
export function isValidBlockId(blockId: string): blockId is TQBlockId {
  return blockId in TQBlockRegistry;
}

/**
 * Get all blocks in a specific category
 */
export function getBlocksByCategory(category: TQBlockCategory): TQBlockSpec[] {
  return Object.values(TQBlockRegistry).filter(
    (block) => block.category === category
  );
}

/**
 * Get all block IDs
 */
export function getAllBlockIds(): TQBlockId[] {
  return Object.keys(TQBlockRegistry) as TQBlockId[];
}

/**
 * Convert block instance to JSON schema format (TQ-JSS)
 */
export function blockToJSON(
  blockId: string,
  args: Record<string, any>
): Record<string, any> | null {
  const spec = getBlockSpec(blockId);
  if (!spec || !spec.toJSON) {
    return null;
  }

  try {
    return spec.toJSON(args);
  } catch (error) {
    console.error(`Error converting block ${blockId} to JSON:`, error);
    return null;
  }
}

/**
 * Convert block instance to TQL syntax
 */
export function blockToTQL(
  blockId: string,
  args: Record<string, any>
): string | null {
  const spec = getBlockSpec(blockId);
  if (!spec || !spec.tql) {
    return null;
  }

  try {
    return spec.tql(args);
  } catch (error) {
    console.error(`Error converting block ${blockId} to TQL:`, error);
    return null;
  }
}

/**
 * Get blocks that can be children of a given block
 */
export function getAllowedChildren(blockId: string): string[] {
  const spec = getBlockSpec(blockId);
  return spec?.allowedChildren || [];
}

/**
 * Check if a child block is allowed for a parent block
 */
export function canAttachChild(parentBlockId: string, childBlockId: string): boolean {
  const allowed = getAllowedChildren(parentBlockId);
  return allowed.length === 0 || allowed.includes(childBlockId);
}

/**
 * Get all blocks grouped by category
 */
export function getBlocksByCategoryMap(): Record<TQBlockCategory, TQBlockSpec[]> {
  const grouped: Record<string, TQBlockSpec[]> = {};

  for (const block of Object.values(TQBlockRegistry)) {
    if (!grouped[block.category]) {
      grouped[block.category] = [];
    }
    grouped[block.category].push(block);
  }

  return grouped as Record<TQBlockCategory, TQBlockSpec[]>;
}

/**
 * Count total blocks in registry
 */
export function getBlockCount(): number {
  return Object.keys(TQBlockRegistry).length;
}

