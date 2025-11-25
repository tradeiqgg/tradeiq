# 📘 TradeIQ: Developer Manual, Feature Documentation & Full Testing Guide

**Version 1.0 – Auto-Generated**  
**Chapters 1–12 Complete Implementation**  
**Last Updated: 2024**

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Chapter 1: TQ-JSS Schema](#chapter-1-tq-jss-schema)
3. [Chapter 2: Indicator Library](#chapter-2-indicator-library)
4. [Chapter 3: Block System](#chapter-3-block-system)
5. [Chapter 4: TQL Language](#chapter-4-tql-language)
6. [Chapter 5: Real-Time Validator & Debugger](#chapter-5-real-time-validator--debugger)
7. [Chapter 6: IDE Engine](#chapter-6-ide-engine)
8. [Chapter 7: Backtester Engine](#chapter-7-backtester-engine)
9. [Chapter 8: Backtesting UI](#chapter-8-backtesting-ui)
10. [Chapter 9: Competition Engine](#chapter-9-competition-engine)
11. [Chapter 10: Cloud Sync & Social System](#chapter-10-cloud-sync--social-system)
12. [Chapter 11: Real-Time Market Data Layer](#chapter-11-real-time-market-data-layer)
13. [Chapter 12: Alerts, Notifications & Triggers](#chapter-12-alerts-notifications--triggers)
14. [End-to-End Testing Protocol](#end-to-end-testing-protocol)
15. [Appendices](#appendices)

---

# Introduction

## Overview

TradeIQ is a comprehensive algorithmic trading platform that combines:
- **Visual Strategy Builder** (Block-based IDE)
- **Text-Based Strategy Language** (TQL)
- **JSON Schema** (TQ-JSS)
- **Real-Time Market Data** (WebSocket feeds)
- **Backtesting Engine** (Historical simulation)
- **Live Strategy Monitoring** (Paper trading)
- **Competition System** (Deterministic leaderboards)
- **Social Platform** (Profiles, sharing, forking)
- **Alert System** (Real-time notifications)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Charts:** TradingView Lightweight Charts
- **Wallet:** Solana Wallet Adapter
- **Real-Time:** WebSockets (Binance, Finnhub, CryptoCompare)

## Project Structure

```
TradeIQ.gg/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   ├── alerts/                   # Alert Center page
│   ├── charts/                   # Charts explorer
│   ├── competitions/             # Competitions page
│   ├── dashboard/                # User dashboard
│   ├── discover/                 # Strategy discovery
│   ├── leaderboard/              # Leaderboard page
│   ├── strategy/                 # Strategy pages
│   ├── u/                        # User profiles
│   └── page.tsx                  # Landing page
├── components/                   # React Components
│   ├── alerts/                   # Alert components
│   ├── competition/              # Competition components
│   ├── ide/                      # IDE components
│   ├── profiles/                 # Profile components
│   ├── sharing/                  # Sharing components
│   ├── strategyLibrary/          # Strategy library components
│   └── ui/                       # UI primitives
├── lib/                          # Core Libraries
│   ├── alerts/                   # Alert system
│   ├── backtester/              # Backtesting engine
│   ├── cloud/                    # Cloud sync
│   ├── competition/               # Competition engine
│   ├── realtime/                 # Real-time data layer
│   └── tql/                      # TQL language system
├── stores/                       # Zustand stores
├── types/                        # TypeScript types
└── supabase/                     # Database migrations
    └── migrations/
```

---

# Chapter 1: TQ-JSS Schema

## Summary

The TQ-JSS (TradeIQ JSON Strategy Schema) is the foundational data structure that represents trading strategies. It serves as the single source of truth for all strategy representations (TQL, Blocks, JSON).

**File:** `/lib/tql/schema.ts`

## Architecture

```
TQ-JSS Schema
├── meta (name, description, author, timestamps)
├── settings (symbol, timeframe, balance, position mode)
├── indicators (array of indicator definitions)
├── rules
│   ├── entry (array of entry rules)
│   ├── exit (array of exit rules)
│   └── filters (array of filter rules)
├── risk (position sizing, stop loss, take profit, limits)
├── runtime (logs, signals, state)
└── version (schema version string)
```

## Type Definitions

### Core Types

```typescript
interface TQJSSchema {
  meta: Meta;
  settings: Settings;
  indicators: Indicator[];
  rules: {
    entry: Rule[];
    exit: Rule[];
    filters: Rule[];
  };
  risk: Risk;
  runtime: Runtime;
  version: string;
}
```

### Key Type Definitions

- **ConditionOperator:** `'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'crosses_above' | 'crosses_below'`
- **PositionMode:** `'long_only' | 'short_only' | 'long_short'`
- **ExecutionMode:** `'candle_close' | 'intrabar' | 'tick'`
- **SizeMode:** `'percent' | 'fixed'`
- **IndicatorOutputType:** `'numeric' | 'boolean' | 'band' | 'series'`

## Validation Rules

### Required Fields

1. **meta.name** - Strategy name (non-empty string)
2. **settings.symbol** - Trading symbol (e.g., "BTCUSDT")
3. **settings.timeframe** - Timeframe (e.g., "1h", "15m")
4. **rules.entry** - At least one entry rule
5. **rules.exit** - At least one exit rule
6. **risk.stop_loss_percent OR risk.trailing_stop_percent** - Must have at least one

### Validation Function

**Function:** `validateTQJSSchema(schema: Partial<TQJSSchema>): ValidationResult`

**Returns:**
```typescript
{
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

## Testing Procedures

### Test Case 1: Valid Strategy

**Input:**
```json
{
  "meta": {
    "name": "RSI Basic",
    "description": "Buy RSI<30 sell RSI>70",
    "author": "WALLET123",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "settings": {
    "symbol": "BTCUSDT",
    "timeframe": "1h",
    "initial_balance": 1000,
    "position_mode": "long_only",
    "max_open_positions": 1,
    "allow_reentry": true,
    "execution_mode": "candle_close"
  },
  "indicators": [
    {
      "id": "rsi_main",
      "indicator": "rsi",
      "params": { "length": 14, "source": "close" },
      "output": "numeric"
    }
  ],
  "rules": {
    "entry": [
      {
        "conditions": [
          {
            "type": "condition",
            "left": { "source_type": "indicator", "id": "rsi_main" },
            "operator": "lt",
            "right": { "source_type": "value", "value": 30 }
          }
        ],
        "action": {
          "type": "enter_position",
          "direction": "long",
          "size_mode": "percent",
          "size": 10
        }
      }
    ],
    "exit": [
      {
        "conditions": [
          {
            "type": "condition",
            "left": { "source_type": "indicator", "id": "rsi_main" },
            "operator": "gt",
            "right": { "source_type": "value", "value": 70 }
          }
        ],
        "action": {
          "type": "exit_position",
          "direction": "long"
        }
      }
    ],
    "filters": []
  },
  "risk": {
    "position_size_percent": 10,
    "max_risk_per_trade_percent": 2,
    "stop_loss_percent": 3,
    "take_profit_percent": 7,
    "trailing_stop_percent": null,
    "max_daily_loss_percent": 10,
    "max_daily_trades": 15
  },
  "runtime": {
    "logs": [],
    "last_signals": [],
    "state": {}
  },
  "version": "1.0"
}
```

**Expected Result:**
```typescript
{
  valid: true,
  errors: [],
  warnings: []
}
```

**Verification Steps:**
1. Import `validateTQJSSchema` from `@/lib/tql/schema`
2. Call function with above JSON
3. Assert `valid === true`
4. Assert `errors.length === 0`

### Test Case 2: Missing Required Field

**Input:** Strategy without `meta.name`

**Expected Result:**
```typescript
{
  valid: false,
  errors: [
    {
      field: 'meta.name',
      message: 'Strategy name is required',
      code: 'META_NAME_MISSING'
    }
  ],
  warnings: []
}
```

**Verification Steps:**
1. Create strategy object without `meta.name`
2. Call `validateTQJSSchema`
3. Assert `valid === false`
4. Assert error code is `'META_NAME_MISSING'`

### Test Case 3: Invalid Indicator Reference

**Input:** Rule references indicator `rsi_main` but indicator not defined

**Expected Result:**
```typescript
{
  valid: false,
  errors: [
    {
      field: 'rules',
      message: 'Indicator "rsi_main" is referenced but not defined',
      code: 'INDICATOR_UNDEFINED'
    }
  ]
}
```

### Test Case 4: Direction Conflict

**Input:** Strategy with `position_mode: 'long_only'` but entry rule with `direction: 'short'`

**Expected Result:**
```typescript
{
  valid: false,
  errors: [
    {
      field: 'rules',
      message: 'Cannot enter short position in long_only mode',
      code: 'DIRECTION_CONFLICT'
    }
  ]
}
```

### Test Case 5: Missing Stop Loss

**Input:** Strategy with both `stop_loss_percent: null` and `trailing_stop_percent: null`

**Expected Result:**
```typescript
{
  valid: false,
  errors: [
    {
      field: 'risk',
      message: 'Either stop_loss_percent or trailing_stop_percent must be set',
      code: 'RISK_STOP_MISSING'
    }
  ]
}
```

### Test Case 6: Warning - High Stop Loss

**Input:** Strategy with `stop_loss_percent: 60`

**Expected Result:**
```typescript
{
  valid: true,
  errors: [],
  warnings: [
    {
      field: 'risk.stop_loss_percent',
      message: 'Stop loss exceeds 50% - this is unusually high',
      code: 'RISK_STOP_LOSS_HIGH'
    }
  ]
}
```

## Debugger Function

**Function:** `debugStrategy(schema: Partial<TQJSSchema>): DebuggerCheck[]`

Returns comprehensive debug checks:

- **Structural errors:** Missing sections, undefined references
- **Logic errors:** Empty conditions, impossible comparisons
- **Risk errors:** Invalid risk parameters
- **Block compiler errors:** Block-specific issues

## Manual Testing Checklist

- [ ] Valid strategy passes validation
- [ ] Missing `meta.name` fails validation
- [ ] Missing `settings.symbol` fails validation
- [ ] Missing entry rules fails validation
- [ ] Missing exit rules fails validation
- [ ] Undefined indicator reference fails validation
- [ ] Direction conflict fails validation
- [ ] Missing stop loss fails validation
- [ ] High stop loss generates warning
- [ ] Low take profit generates warning
- [ ] Reserved keyword in indicator ID fails validation
- [ ] Position size > 100% fails validation
- [ ] Max daily trades < 1 fails validation

## Integration Testing

### Test Schema Conversion Flow

1. **TQL → JSON:**
   - Write valid TQL code
   - Compile to JSON
   - Validate JSON schema
   - Assert `valid === true`

2. **Blocks → JSON:**
   - Create block structure
   - Convert to JSON
   - Validate JSON schema
   - Assert `valid === true`

3. **JSON → TQL:**
   - Start with valid JSON
   - Convert to TQL
   - Parse TQL back to JSON
   - Assert JSON matches original

## Debugging Guide

### Common Validation Errors

1. **META_NAME_MISSING**
   - **Cause:** `meta.name` is empty or undefined
   - **Fix:** Ensure strategy has a non-empty name

2. **INDICATOR_UNDEFINED**
   - **Cause:** Rule references indicator not in `indicators` array
   - **Fix:** Add indicator definition or fix reference

3. **DIRECTION_CONFLICT**
   - **Cause:** Entry/exit direction conflicts with `position_mode`
   - **Fix:** Adjust rules or change `position_mode`

4. **RISK_STOP_MISSING**
   - **Cause:** Both stop loss and trailing stop are null
   - **Fix:** Set at least one stop mechanism

### How to Verify in Browser DevTools

1. Open browser console
2. Import schema: `import { validateTQJSSchema } from '@/lib/tql/schema'`
3. Test strategy object
4. Check validation result

### How to Verify in Supabase

1. Open Supabase dashboard
2. Navigate to Table Editor → `strategies`
3. Check `strategy_json` column
4. Verify JSON structure matches schema

---

# Chapter 2: Indicator Library

## Summary

Complete indicator registry with 33+ indicators covering price, moving averages, momentum, volatility, volume, trend, pattern, and sentiment categories.

**File:** `/lib/tql/indicators.ts`

## Architecture

```
Indicator Registry
├── Category Definitions (PRICE, MA, MOMENTUM, VOLATILITY, VOLUME, TREND, PATTERN, SENTIMENT)
├── Indicator Specifications
│   ├── name
│   ├── category
│   ├── description
│   ├── output (numeric, boolean, band, series)
│   ├── params (with types, defaults, ranges)
│   └── example
└── Validation Functions
    ├── getIndicatorSpec()
    ├── validateIndicatorParams()
    └── normalizeIndicatorParams()
```

## Indicator Categories

1. **PRICE** - Price-based indicators (open, high, low, close, HL2, HLC3, OHLC4)
2. **MA** - Moving averages (SMA, EMA, WMA, DEMA, TEMA, Hull MA)
3. **MOMENTUM** - Momentum indicators (RSI, MACD, Stochastic, CCI, Williams %R)
4. **VOLATILITY** - Volatility indicators (ATR, Bollinger Bands, Keltner Channels)
5. **VOLUME** - Volume indicators (Volume SMA, OBV, VWAP)
6. **TREND** - Trend indicators (ADX, Parabolic SAR, Ichimoku)
7. **PATTERN** - Pattern recognition (Candlestick patterns)
8. **SENTIMENT** - Sentiment indicators (Future implementations)

## Complete Indicator List

### Price Indicators (7)
- `price_open`, `price_high`, `price_low`, `price_close`, `hl2`, `hlc3`, `ohlc4`

### Moving Averages (6)
- `sma` - Simple Moving Average
- `ema` - Exponential Moving Average
- `wma` - Weighted Moving Average
- `dema` - Double Exponential Moving Average
- `tema` - Triple Exponential Moving Average
- `hull` - Hull Moving Average

### Momentum Indicators (5)
- `rsi` - Relative Strength Index
- `macd` - Moving Average Convergence Divergence
- `stochastic` - Stochastic Oscillator
- `cci` - Commodity Channel Index
- `williams_r` - Williams %R

### Volatility Indicators (3)
- `atr` - Average True Range
- `bollinger` - Bollinger Bands
- `keltner` - Keltner Channels

### Volume Indicators (3)
- `volume_sma` - Volume Simple Moving Average
- `obv` - On-Balance Volume
- `vwap` - Volume Weighted Average Price

### Trend Indicators (3)
- `adx` - Average Directional Index
- `parabolic_sar` - Parabolic SAR
- `ichimoku` - Ichimoku Cloud

### Pattern Indicators (6+)
- `candlestick_patterns` - Various candlestick patterns

## Indicator Parameter Specifications

### Example: RSI Indicator

```typescript
{
  name: "RSI",
  category: "momentum",
  description: "Relative Strength Index (0-100)",
  output: "numeric",
  params: {
    length: {
      type: "number",
      default: 14,
      min: 2,
      max: 200
    },
    source: {
      type: "string",
      default: "close",
      allowedValues: ["open", "high", "low", "close"]
    }
  },
  example: "rsi(length=14, source=close)"
}
```

## Testing Procedures

### Test Case 1: Get Indicator Spec

**Test:** Retrieve indicator specification

```typescript
import { getIndicatorSpec } from '@/lib/tql/indicators';

const spec = getIndicatorSpec('rsi');
// Expected: Returns RSI specification object
```

**Verification:**
- Assert `spec.name === 'RSI'`
- Assert `spec.category === 'momentum'`
- Assert `spec.output === 'numeric'`
- Assert `spec.params.length.default === 14`

### Test Case 2: Validate Indicator Parameters

**Test:** Valid parameters pass validation

```typescript
import { validateIndicatorParams } from '@/lib/tql/indicators';

const result = validateIndicatorParams('rsi', { length: 14, source: 'close' });
// Expected: { valid: true, normalizedParams: { length: 14, source: 'close' } }
```

**Verification:**
- Assert `result.valid === true`
- Assert `result.normalizedParams.length === 14`

### Test Case 3: Invalid Parameter Value

**Test:** Parameter outside valid range fails

```typescript
const result = validateIndicatorParams('rsi', { length: 300 });
// Expected: { valid: false, errors: [{ message: 'length must be <= 200' }] }
```

**Verification:**
- Assert `result.valid === false`
- Assert error message contains "length must be"

### Test Case 4: Missing Required Parameter

**Test:** Missing required parameter uses default

```typescript
const result = validateIndicatorParams('rsi', {});
// Expected: Uses default length=14, source='close'
```

**Verification:**
- Assert `result.valid === true`
- Assert `result.normalizedParams.length === 14`
- Assert `result.normalizedParams.source === 'close'`

### Test Case 5: Invalid Parameter Type

**Test:** Wrong parameter type fails validation

```typescript
const result = validateIndicatorParams('rsi', { length: 'invalid' });
// Expected: { valid: false, errors: [{ message: 'length must be a number' }] }
```

## Indicator Computation Testing

### Test Case: Compute RSI on Fake Data

**Setup:**
```typescript
import { computeIndicatorSeries } from '@/lib/backtester/indicatorEngine';

const candles = [
  { open: 100, high: 105, low: 99, close: 103, volume: 1000, time: 1000 },
  { open: 103, high: 107, low: 102, close: 106, volume: 1200, time: 2000 },
  // ... more candles
];

const rsi = computeIndicatorSeries(candles, 'rsi', { length: 14 });
```

**Expected:**
- Array of numbers (RSI values)
- First 13 values are `NaN` (insufficient data)
- Values range 0-100
- Values reflect price momentum

**Verification Steps:**
1. Assert `rsi.length === candles.length`
2. Assert first 13 values are `NaN`
3. Assert remaining values are numbers between 0-100
4. Assert RSI increases when price goes up

## Manual Testing Checklist

### For Each Indicator:

- [ ] Get spec returns correct specification
- [ ] Valid parameters pass validation
- [ ] Invalid parameters fail validation
- [ ] Missing parameters use defaults
- [ ] Parameter normalization works
- [ ] Indicator computes correctly on test data
- [ ] Output type matches specification
- [ ] Edge cases handled (empty data, single candle, etc.)

### Indicator-Specific Tests:

**RSI:**
- [ ] Length 2-200 accepted
- [ ] Source field validation
- [ ] Computes 0-100 range
- [ ] NaN for insufficient data

**MACD:**
- [ ] Fast, slow, signal parameters
- [ ] Fast < slow validation
- [ ] Returns MACD line values

**Bollinger Bands:**
- [ ] Returns band object `{ upper, middle, lower }`
- [ ] Length and stddev parameters
- [ ] Upper > middle > lower always

## Integration Testing

### Test Indicator in Strategy

1. Create strategy with RSI indicator
2. Add entry rule using RSI
3. Validate strategy
4. Run backtest
5. Verify RSI values computed correctly

### Test Indicator in Live Mode

1. Start live strategy with RSI
2. Subscribe to indicator updates
3. Verify indicator values update on new candles
4. Check indicator values match expected calculations

## Debugging Guide

### Common Indicator Errors

1. **Unknown Indicator**
   - **Error:** `Unknown indicator: xyz`
   - **Fix:** Check indicator ID spelling, verify indicator exists in registry

2. **Invalid Parameter Range**
   - **Error:** `length must be between 2 and 200`
   - **Fix:** Adjust parameter to valid range

3. **Missing Required Parameter**
   - **Error:** `source is required`
   - **Fix:** Provide required parameter or ensure default exists

4. **Insufficient Data**
   - **Symptom:** Indicator returns `NaN`
   - **Fix:** Ensure enough candles (usually `length` candles needed)

### How to Verify Indicator Computation

**In Browser Console:**
```javascript
import { computeIndicatorSeries } from '@/lib/backtester/indicatorEngine';

const testCandles = [/* your test data */];
const rsi = computeIndicatorSeries(testCandles, 'rsi', { length: 14 });
console.log('RSI values:', rsi);
```

**In IDE:**
1. Add indicator to strategy
2. Open Live Monitor
3. View Indicators tab
4. Verify values update in real-time

---

# Chapter 3: Block System

## Summary

Visual block-based strategy builder allowing users to drag-and-drop blocks to create trading strategies. Blocks represent conditions, actions, indicators, and operators.

**Files:**
- `/components/ide/BlockEditor.tsx`
- `/lib/tql/blocks.ts`

## Architecture

```
Block System
├── Block Types
│   ├── condition (comparisons, logical operators)
│   ├── action (enter_position, exit_position)
│   ├── indicator (all 33+ indicators)
│   └── operator (and, or, not)
├── Block Structure
│   ├── id (unique identifier)
│   ├── type (block type)
│   ├── label (display name)
│   ├── inputs (array of inputs)
│   └── outputs (array of outputs)
└── Conversion
    ├── Blocks → JSON
    ├── Blocks → TQL
    └── JSON → Blocks
```

## Block Types

### Condition Blocks

**Structure:**
```typescript
{
  id: string;
  type: 'condition';
  label: string;
  inputs: [
    { name: 'left', type: 'block', value: BlockReference },
    { name: 'operator', type: 'string', value: 'gt' | 'lt' | ... },
    { name: 'right', type: 'block', value: BlockReference }
  ];
}
```

**Operators:** `gt`, `gte`, `lt`, `lte`, `eq`, `neq`, `crosses_above`, `crosses_below`

### Action Blocks

**Enter Position:**
```typescript
{
  id: string;
  type: 'action';
  label: 'Enter Position';
  inputs: [
    { name: 'direction', type: 'string', value: 'long' | 'short' },
    { name: 'size_mode', type: 'string', value: 'percent' | 'fixed' },
    { name: 'size', type: 'number', value: number }
  ];
}
```

**Exit Position:**
```typescript
{
  id: string;
  type: 'action';
  label: 'Exit Position';
  inputs: [
    { name: 'direction', type: 'string', value: 'long' | 'short' | 'any' }
  ];
}
```

### Indicator Blocks

**Structure:**
```typescript
{
  id: string;
  type: 'indicator';
  label: 'RSI';
  inputs: [
    { name: 'length', type: 'number', value: 14 },
    { name: 'source', type: 'string', value: 'close' }
  ];
  outputs: [
    { name: 'value', type: 'number' }
  ];
}
```

### Operator Blocks

**AND/OR:**
```typescript
{
  id: string;
  type: 'operator';
  label: 'AND' | 'OR';
  inputs: [
    { name: 'left', type: 'block', value: BlockReference },
    { name: 'right', type: 'block', value: BlockReference }
  ];
}
```

## Block to JSON Conversion

**Function:** `blocksToJSON(blocks: Block[]): Partial<TQJSSchema>`

**Process:**
1. Extract indicator blocks → `indicators` array
2. Extract condition blocks → `rules.entry` and `rules.exit`
3. Extract action blocks → attach to rules
4. Build complete JSON schema

## Testing Procedures

### Test Case 1: Simple Block Chain

**Input Blocks:**
```typescript
[
  {
    id: 'ind1',
    type: 'indicator',
    label: 'RSI',
    inputs: [{ name: 'length', type: 'number', value: 14 }]
  },
  {
    id: 'cond1',
    type: 'condition',
    label: 'RSI < 30',
    inputs: [
      { name: 'left', type: 'block', value: 'ind1' },
      { name: 'operator', type: 'string', value: 'lt' },
      { name: 'right', type: 'value', value: 30 }
    ]
  },
  {
    id: 'action1',
    type: 'action',
    label: 'Enter Long',
    inputs: [
      { name: 'direction', type: 'string', value: 'long' },
      { name: 'size', type: 'number', value: 10 }
    ]
  }
]
```

**Expected JSON:**
```json
{
  "indicators": [
    {
      "id": "ind1",
      "indicator": "rsi",
      "params": { "length": 14 },
      "output": "numeric"
    }
  ],
  "rules": {
    "entry": [
      {
        "conditions": [
          {
            "type": "condition",
            "left": { "source_type": "indicator", "id": "ind1" },
            "operator": "lt",
            "right": { "source_type": "value", "value": 30 }
          }
        ],
        "action": {
          "type": "enter_position",
          "direction": "long",
          "size_mode": "percent",
          "size": 10
        }
      }
    ]
  }
}
```

**Verification Steps:**
1. Call `blocksToJSON(blocks)`
2. Assert `indicators.length === 1`
3. Assert `rules.entry.length === 1`
4. Assert condition operator is `'lt'`
5. Assert action direction is `'long'`

### Test Case 2: Complex Block Chain with AND

**Input:** Multiple conditions connected with AND operator

**Expected:** Condition group with `operator: 'and'`

### Test Case 3: Invalid Block Reference

**Input:** Condition block references non-existent indicator block

**Expected:** Error or validation failure

### Test Case 4: Block Validation

**Test:** Validate block structure

```typescript
import { validateBlock } from '@/lib/tql/blocks';

const block = { /* block structure */ };
const result = validateBlock(block);
// Expected: { valid: boolean, errors: [] }
```

## Manual Testing Checklist

### Block Editor UI Tests:

- [ ] Can drag indicator block onto canvas
- [ ] Can drag condition block onto canvas
- [ ] Can drag action block onto canvas
- [ ] Can connect blocks with wires
- [ ] Can delete blocks
- [ ] Can edit block properties
- [ ] Block validation shows errors
- [ ] Invalid connections prevented
- [ ] Block → JSON conversion works
- [ ] JSON → Block regeneration works

### Block Structure Tests:

- [ ] Indicator block has correct inputs
- [ ] Condition block validates operator
- [ ] Action block validates direction
- [ ] Operator block connects correctly
- [ ] Block IDs are unique
- [ ] Block references are valid

## Integration Testing

### Test Block → Strategy Flow

1. Create blocks in Block Editor
2. Convert to JSON
3. Validate JSON schema
4. Save strategy
5. Load strategy
6. Verify blocks regenerate correctly

### Test Block → Backtest Flow

1. Create blocks
2. Convert to JSON
3. Run backtest
4. Verify strategy executes correctly

## Debugging Guide

### Common Block Errors

1. **Invalid Block Reference**
   - **Error:** Block references non-existent block ID
   - **Fix:** Ensure all referenced blocks exist

2. **Type Mismatch**
   - **Error:** Block output type doesn't match input type
   - **Fix:** Check block type compatibility

3. **Missing Required Input**
   - **Error:** Block missing required input
   - **Fix:** Provide all required inputs

### How to Verify Blocks in IDE

1. Open IDE → Block Mode tab
2. Create blocks
3. Check block properties panel
4. Verify connections
5. Check validation errors in status bar

---

# Chapter 4: TQL Language

## Summary

TradeIQ Query Language (TQL) - a domain-specific language for writing trading strategies in a human-readable format.

**Files:**
- `/lib/tql/lexer.ts` - Tokenization
- `/lib/tql/parser.ts` - AST generation
- `/lib/tql/compiler.ts` - JSON compilation
- `/lib/tql/debugger.ts` - Debugging tools

## Architecture

```
TQL Processing Pipeline
├── Lexer (Tokenization)
│   ├── Keywords (IF, THEN, ENTER, EXIT, etc.)
│   ├── Operators (>, <, ==, AND, OR)
│   ├── Identifiers (indicator names, variables)
│   └── Literals (numbers, strings)
├── Parser (AST Generation)
│   ├── Expression parsing
│   ├── Rule parsing
│   └── Strategy parsing
├── Compiler (JSON Generation)
│   ├── AST → JSON conversion
│   └── Schema validation
└── Debugger (Error Detection)
    ├── Syntax errors
    ├── Semantic errors
    └── Runtime errors
```

## TQL Grammar

### Basic Syntax

```
strategy := STRATEGY name settings indicators rules

settings := SETTINGS
  symbol: string
  timeframe: string
  initial_balance: number
  position_mode: (long_only | short_only | long_short)

indicators := INDICATORS
  indicator_id: indicator_type(params)

rules := RULES
  ENTRY:
    IF condition THEN action
  EXIT:
    IF condition THEN action

condition := 
  | indicator operator value
  | condition AND condition
  | condition OR condition
  | (condition)

action :=
  | ENTER direction size
  | EXIT direction
```

### Example TQL Code

```tql
STRATEGY "RSI Basic"
SETTINGS
  symbol: BTCUSDT
  timeframe: 1h
  initial_balance: 1000
  position_mode: long_only

INDICATORS
  rsi_main: rsi(length=14, source=close)

RULES
  ENTRY:
    IF rsi_main < 30 THEN ENTER long 10%
  
  EXIT:
    IF rsi_main > 70 THEN EXIT long
```

## Lexer Tokens

### Token Types

- **KEYWORD:** `IF`, `THEN`, `ENTER`, `EXIT`, `AND`, `OR`, `STRATEGY`, etc.
- **OPERATOR:** `>`, `<`, `>=`, `<=`, `==`, `!=`
- **IDENTIFIER:** Variable names, indicator IDs
- **NUMBER:** Numeric literals
- **STRING:** String literals
- **PUNCTUATION:** `:`, `,`, `(`, `)`, `{`, `}`

## Parser AST Structure

### AST Node Types

```typescript
interface ASTNode {
  type: 'strategy' | 'rule' | 'condition' | 'action' | 'indicator' | 'expression';
  // ... node-specific fields
}
```

## Testing Procedures

### Test Case 1: Parse Valid TQL

**Input:**
```tql
STRATEGY "Test"
SETTINGS
  symbol: BTCUSDT
  timeframe: 1h
INDICATORS
  rsi: rsi(length=14)
RULES
  ENTRY:
    IF rsi < 30 THEN ENTER long 10%
```

**Expected:**
- Lexer produces tokens without errors
- Parser produces valid AST
- Compiler produces valid JSON

**Verification Steps:**
1. Call `lex(tqlCode)` → assert tokens array
2. Call `parse(tokens)` → assert AST
3. Call `compile(ast)` → assert JSON
4. Validate JSON schema

### Test Case 2: Invalid Syntax

**Input:** `IF rsi < THEN ENTER` (missing value)

**Expected:** Parser error

**Verification:**
- Assert parser throws error
- Assert error message indicates missing value

### Test Case 3: Unknown Indicator

**Input:** `unknown_indicator(length=14)`

**Expected:** Compiler error or warning

### Test Case 4: TQL → JSON → TQL Round-Trip

**Test:** Convert TQL to JSON, then JSON back to TQL

**Expected:** TQL code matches original (or functionally equivalent)

## Manual Testing Checklist

### Lexer Tests:

- [ ] Keywords tokenized correctly
- [ ] Operators tokenized correctly
- [ ] Numbers parsed correctly
- [ ] Strings parsed correctly
- [ ] Identifiers parsed correctly
- [ ] Comments ignored
- [ ] Whitespace handled

### Parser Tests:

- [ ] Valid TQL parses successfully
- [ ] Invalid syntax produces errors
- [ ] AST structure correct
- [ ] Nested conditions parsed
- [ ] Multiple rules parsed

### Compiler Tests:

- [ ] AST → JSON conversion works
- [ ] JSON validates against schema
- [ ] Indicator references resolved
- [ ] Rule structure correct

### Editor Integration Tests:

- [ ] TQL editor shows syntax highlighting
- [ ] Real-time validation works
- [ ] Error markers appear
- [ ] Auto-completion works
- [ ] Format on save works

## Integration Testing

### Test TQL Editor Flow

1. Open IDE → TQL Mode
2. Type TQL code
3. Verify real-time validation
4. Check error markers
5. Convert to JSON
6. Verify JSON is valid
7. Switch to Block Mode
8. Verify blocks generated correctly

## Debugging Guide

### Common TQL Errors

1. **Syntax Error**
   - **Error:** `Unexpected token: X`
   - **Fix:** Check syntax, verify keywords spelled correctly

2. **Unknown Indicator**
   - **Error:** `Unknown indicator: xyz`
   - **Fix:** Check indicator name, verify it exists in registry

3. **Type Mismatch**
   - **Error:** `Cannot compare indicator with string`
   - **Fix:** Ensure compatible types in comparisons

### How to Debug TQL

**In Browser Console:**
```javascript
import { lex, parse, compile } from '@/lib/tql';

const tql = `STRATEGY "Test" ...`;
const tokens = lex(tql);
console.log('Tokens:', tokens);
const ast = parse(tokens);
console.log('AST:', ast);
const json = compile(ast);
console.log('JSON:', json);
```

---

# Chapter 5: Real-Time Validator & Debugger

## Summary

Comprehensive validation and debugging system that checks strategies for errors, warnings, and potential issues in real-time.

**Files:**
- `/lib/tql/validator.ts`
- `/lib/tql/debugger.ts`
- `/lib/tql/diagnostics.ts`
- `/lib/tql/errors.ts`
- `/lib/tql/fixes.ts`

## Architecture

```
Validation System
├── Schema Validator (Chapter 1)
├── Indicator Validator
├── Rule Validator
├── Risk Validator
├── Logic Validator
└── Debugger
    ├── Structural Checks
    ├── Logic Checks
    ├── Risk Checks
    └── Block Compiler Checks
```

## Validation Error Codes

### Schema Errors (from Chapter 1)
- `META_NAME_MISSING`
- `SETTINGS_SYMBOL_MISSING`
- `SETTINGS_TIMEFRAME_MISSING`
- `RISK_STOP_MISSING`
- `RULES_ENTRY_MISSING`
- `RULES_EXIT_MISSING`
- `INDICATOR_UNDEFINED`
- `DIRECTION_CONFLICT`
- `RISK_MAX_TRADES_INVALID`
- `RISK_POSITION_SIZE_INVALID`
- `RESERVED_KEYWORD`

### Debugger Checks

**Structural:**
- Missing meta section
- Missing settings section
- No indicators defined
- Unbound indicator references

**Logic:**
- Empty condition groups
- Impossible comparisons
- Circular dependencies

**Risk:**
- Stop loss exceeds 50%
- Position size exceeds 100%
- Take profit < 0.5× stop loss

## Testing Procedures

### Test Case 1: Valid Strategy Passes All Checks

**Input:** Valid strategy (from Chapter 1 Test Case 1)

**Expected:**
```typescript
{
  valid: true,
  errors: [],
  warnings: [],
  debugChecks: []
}
```

### Test Case 2: Structural Error Detection

**Input:** Strategy without indicators but rules reference indicators

**Expected:**
```typescript
{
  valid: false,
  errors: [
    {
      type: 'structural',
      severity: 'error',
      message: 'Unbound indicator reference: rsi_main'
    }
  ]
}
```

### Test Case 3: Risk Warning

**Input:** Strategy with stop loss = 60%

**Expected:**
```typescript
{
  valid: true,
  warnings: [
    {
      type: 'risk',
      severity: 'warning',
      message: 'Stop loss exceeds 50%'
    }
  ]
}
```

### Test Case 4: Logic Error Detection

**Input:** Rule with empty conditions array

**Expected:**
```typescript
{
  valid: false,
  errors: [
    {
      type: 'logic',
      severity: 'error',
      message: 'Rule has no conditions'
    }
  ]
}
```

## Manual Testing Checklist

- [ ] Valid strategy passes validation
- [ ] Missing sections detected
- [ ] Undefined indicators detected
- [ ] Direction conflicts detected
- [ ] Risk warnings generated
- [ ] Logic errors detected
- [ ] Fix suggestions provided
- [ ] Real-time validation in IDE works
- [ ] Error markers appear in editor
- [ ] Hover shows error details

## Integration Testing

### Test IDE Validation Integration

1. Open IDE
2. Create invalid strategy
3. Verify errors appear in diagnostics overlay
4. Fix errors
5. Verify errors disappear
6. Verify status bar shows "Valid"

## Debugging Guide

### Common Validation Errors

1. **Unbound Indicator**
   - **Fix:** Add indicator definition or fix reference

2. **Empty Conditions**
   - **Fix:** Add at least one condition to rule

3. **Direction Conflict**
   - **Fix:** Adjust rules or position mode

---

# Chapter 6: IDE Engine

## Summary

Central IDE engine managing state, mode switching, validation, history, and synchronization between TQL, JSON, and Block representations.

**File:** `/components/ide/core/IDEEngine.ts`

## Architecture

```
IDE Engine (Zustand Store)
├── Mode Management
│   ├── Current mode (tql | json | blocks)
│   └── Mode switching logic
├── Content Management
│   ├── TQL text
│   ├── JSON text
│   └── Block tree
├── Validation State
│   ├── Diagnostics
│   ├── Compile result
│   └── Validation status
├── History Management
│   ├── Undo stack
│   └── Redo stack
├── File State
│   ├── Strategy ID
│   ├── Dirty flag
│   ├── Saving status
│   └── Last saved timestamp
└── Snapshots
    └── Version snapshots
```

## State Structure

```typescript
interface IDEState {
  mode: IDEMode;
  tqlText: string;
  jsonText: string;
  blockTree: any;
  ast: any;
  compiledJSON: Partial<TQJSSchema> | null;
  diagnostics: TQDiagnostic[];
  compileResult: TQValidationResult | null;
  isValidating: boolean;
  cursorPosition: { line: number; column: number };
  selection: { start: number; end: number } | null;
  undoStack: IDERepresentation[];
  redoStack: IDERepresentation[];
  strategyId: string | null;
  strategyName: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  snapshots: Array<{
    id: string;
    timestamp: Date;
    representation: IDERepresentation;
  }>;
}
```

## Mode Switching

### TQL Mode → JSON Mode

**Process:**
1. Parse TQL text → AST
2. Compile AST → JSON
3. Set `jsonText` to formatted JSON
4. Update `compiledJSON`

### JSON Mode → Block Mode

**Process:**
1. Parse JSON
2. Convert JSON → Block tree
3. Set `blockTree`
4. Render blocks in Block Editor

### Block Mode → JSON Mode

**Process:**
1. Convert blocks → JSON
2. Set `jsonText`
3. Update `compiledJSON`

## Testing Procedures

### Test Case 1: Mode Switching

**Steps:**
1. Start in TQL mode
2. Enter TQL code
3. Switch to JSON mode
4. Verify JSON generated correctly
5. Switch to Block mode
6. Verify blocks generated correctly

**Verification:**
- JSON matches TQL semantics
- Blocks match JSON structure
- No data loss during conversion

### Test Case 2: Undo/Redo

**Steps:**
1. Make edit in TQL mode
2. Press Undo (Cmd+Z)
3. Verify previous state restored
4. Press Redo (Cmd+Shift+Z)
5. Verify edit reapplied

**Verification:**
- Undo stack maintained correctly
- Redo stack cleared on new edit
- State restored accurately

### Test Case 3: Auto-Save Integration

**Steps:**
1. Make changes to strategy
2. Wait 3 seconds (autosave interval)
3. Verify `isSaving` flag set
4. Verify save completes
5. Verify `lastSaved` updated
6. Verify `isDirty` cleared

### Test Case 4: Snapshot Creation

**Steps:**
1. Make significant changes (>5% diff)
2. Verify snapshot created
3. Load snapshot
4. Verify state restored

## Manual Testing Checklist

### Mode Switching:

- [ ] TQL → JSON conversion works
- [ ] JSON → TQL conversion works
- [ ] JSON → Blocks conversion works
- [ ] Blocks → JSON conversion works
- [ ] No data loss during conversion
- [ ] Validation runs after mode switch

### History:

- [ ] Undo works
- [ ] Redo works
- [ ] History limited to 50 entries
- [ ] Redo cleared on new edit

### File Operations:

- [ ] Dirty flag set on edit
- [ ] Dirty flag cleared on save
- [ ] Last saved timestamp updates
- [ ] Strategy ID persists

### Snapshots:

- [ ] Snapshots created on major changes
- [ ] Snapshots load correctly
- [ ] Snapshot list shows all versions

## Integration Testing

### Test Full IDE Workflow

1. Create new strategy
2. Write TQL code
3. Switch to JSON mode
4. Edit JSON
5. Switch to Block mode
6. Modify blocks
7. Switch back to TQL
8. Verify all changes preserved
9. Save strategy
10. Reload strategy
11. Verify state restored

## Debugging Guide

### Common IDE Issues

1. **State Not Syncing**
   - **Symptom:** Changes in one mode not reflected in another
   - **Fix:** Check conversion functions, verify event handlers

2. **Undo Not Working**
   - **Symptom:** Undo doesn't restore previous state
   - **Fix:** Check undo stack, verify state restoration logic

3. **Validation Not Running**
   - **Symptom:** Errors not detected
   - **Fix:** Check validation triggers, verify diagnostics update

---

# Chapter 7: Backtester Engine

## Summary

Complete backtesting engine that simulates strategy execution on historical market data.

**Files:**
- `/lib/backtester/runner.ts` - Main runner
- `/lib/backtester/candleLoader.ts` - Data loading
- `/lib/backtester/indicatorEngine.ts` - Indicator computation
- `/lib/backtester/executionEngine.ts` - Rule evaluation
- `/lib/backtester/riskEngine.ts` - Risk management
- `/lib/backtester/pnlEngine.ts` - P&L calculation

## Architecture

```
Backtest Pipeline
├── Candle Loader
│   ├── Fetch historical data
│   ├── Validate candles
│   └── Return candle array
├── Indicator Engine
│   ├── Pre-compute all indicators
│   └── Create indicator cache
├── Execution Engine
│   ├── Evaluate entry rules
│   ├── Evaluate exit rules
│   ├── Execute actions
│   └── Track positions
├── Risk Engine
│   ├── Check stop loss
│   ├── Check take profit
│   ├── Check daily limits
│   └── Force exits if needed
└── PnL Engine
    ├── Calculate unrealized PnL
    ├── Calculate realized PnL
    ├── Track equity curve
    └── Calculate drawdown
```

## Backtest Flow

```typescript
async function runBacktest(strategy: TQJSSchema, options: BacktestOptions) {
  // 1. Validate strategy
  const validation = validateStrategy(strategy);
  
  // 2. Load candles
  const candles = await loadCandles(options);
  
  // 3. Pre-compute indicators
  const indicatorCache = precomputeIndicators(candles, strategy);
  
  // 4. Initialize state
  const state = initializeState(options);
  
  // 5. Process each candle
  for (const candle of candles) {
    // Update PnL
    updatePNL(state, candle);
    
    // Apply risk management
    applyRisk(state, candle, strategy);
    
    // Evaluate strategy rules
    evaluateStrategyOnCandle(state, candle, indicators, strategy);
  }
  
  // 6. Calculate summary
  return calculateSummary(state);
}
```

## Testing Procedures

### Test Case 1: Simple Backtest

**Input:**
- Strategy: RSI < 30 enter, RSI > 70 exit
- Symbol: BTCUSDT
- Timeframe: 1h
- Date Range: Last 30 days

**Expected:**
- Backtest completes successfully
- Returns trades array
- Returns PnL value
- Returns equity curve
- Returns drawdown curve

**Verification Steps:**
1. Call `runBacktest(strategy, options)`
2. Assert no errors thrown
3. Assert `result.trades.length > 0`
4. Assert `result.pnl` is a number
5. Assert `result.equityCurve.length === candles.length`
6. Assert `result.winRate` between 0-100

### Test Case 2: Stop Loss Triggered

**Input:** Strategy with stop loss = 5%

**Expected:** Trades exit at stop loss price

**Verification:**
- Check trade exit reasons
- Verify exit price matches stop loss
- Verify PnL matches expected loss

### Test Case 3: Take Profit Triggered

**Input:** Strategy with take profit = 10%

**Expected:** Trades exit at take profit price

### Test Case 4: Max Daily Trades Limit

**Input:** Strategy with `max_daily_trades: 3`

**Expected:** Only 3 trades per day maximum

### Test Case 5: Empty Strategy (No Trades)

**Input:** Strategy with impossible conditions

**Expected:** No trades executed, PnL = 0

## Manual Testing Checklist

- [ ] Backtest runs without errors
- [ ] Trades executed correctly
- [ ] Entry prices correct
- [ ] Exit prices correct
- [ ] Stop loss triggered
- [ ] Take profit triggered
- [ ] Daily limits enforced
- [ ] PnL calculated correctly
- [ ] Equity curve generated
- [ ] Drawdown calculated
- [ ] Win rate calculated
- [ ] Summary statistics correct

## Integration Testing

### Test Backtest → UI Flow

1. Create strategy in IDE
2. Open Backtest panel
3. Select date range
4. Click "Run Backtest"
5. Verify results displayed
6. Verify charts render
7. Verify trade list shows trades
8. Verify logs show execution

## Debugging Guide

### Common Backtest Errors

1. **No Candles Loaded**
   - **Error:** `No candles loaded for the specified date range`
   - **Fix:** Check date range, verify data source available

2. **Indicator Computation Error**
   - **Error:** `Failed to compute indicator`
   - **Fix:** Check indicator parameters, verify sufficient data

3. **Infinite Loop**
   - **Symptom:** Backtest hangs
   - **Fix:** Check for circular dependencies, verify exit conditions

---

# Chapter 8: Backtesting UI

## Summary

Complete UI for running backtests, viewing results, and analyzing performance.

**Files:**
- `/components/ide/backtest/BacktestPanel.tsx`
- `/components/ide/backtest/BacktestChart.tsx`
- `/components/ide/backtest/BacktestResults.tsx`
- `/components/ide/backtest/BacktestTradeList.tsx`
- `/components/ide/backtest/BacktestEquityChart.tsx`
- `/components/ide/backtest/BacktestDrawdownChart.tsx`
- `/components/ide/backtest/BacktestLogs.tsx`
- `/components/ide/backtest/BacktestHistory.tsx`
- `/components/ide/backtest/BacktestControls.tsx`

## Component Structure

```
BacktestPanel
├── BacktestControls (date range, symbol, run button)
├── BacktestResults (summary stats)
├── BacktestChart (candlestick chart with trade markers)
├── BacktestEquityChart (equity curve)
├── BacktestDrawdownChart (drawdown curve)
├── BacktestTradeList (list of trades)
├── BacktestLogs (execution logs)
└── BacktestHistory (previous backtests)
```

## Testing Procedures

### Test Case 1: Run Backtest

**Steps:**
1. Open IDE → Backtests tab
2. Select strategy
3. Set date range
4. Click "Run Backtest"
5. Wait for completion

**Expected:**
- Loading indicator shows
- Results appear when complete
- Charts render
- Trade list populated
- Logs show execution

**Verification:**
- Assert results displayed
- Assert charts visible
- Assert trade count > 0
- Assert PnL displayed
- Assert win rate displayed

### Test Case 2: View Trade Details

**Steps:**
1. Run backtest
2. Click on trade in trade list
3. View trade details

**Expected:**
- Trade details modal/popup
- Entry/exit prices shown
- PnL shown
- Timestamps shown

### Test Case 3: View Equity Curve

**Steps:**
1. Run backtest
2. View Equity Chart tab
3. Verify curve renders

**Expected:**
- Line chart showing equity over time
- X-axis: time
- Y-axis: equity value

### Test Case 4: View Drawdown

**Steps:**
1. Run backtest
2. View Drawdown Chart tab
3. Verify drawdown curve

**Expected:**
- Area chart showing drawdown
- Negative values (below zero)
- Max drawdown highlighted

### Test Case 5: Backtest History

**Steps:**
1. Run multiple backtests
2. View History tab
3. Select previous backtest

**Expected:**
- List of previous backtests
- Can select and view old results
- Results persist

## Manual Testing Checklist

- [ ] Backtest controls work
- [ ] Date range picker works
- [ ] Symbol selector works
- [ ] Run button triggers backtest
- [ ] Loading state shows
- [ ] Results display correctly
- [ ] Charts render correctly
- [ ] Trade markers appear on chart
- [ ] Trade list shows all trades
- [ ] Trade details viewable
- [ ] Equity curve renders
- [ ] Drawdown chart renders
- [ ] Logs show execution
- [ ] History saves backtests
- [ ] Can compare multiple backtests

## Integration Testing

### Test Full Backtest Workflow

1. Create strategy
2. Validate strategy
3. Open Backtest panel
4. Configure backtest
5. Run backtest
6. View results
7. Analyze performance
8. Save backtest
9. View in history
10. Compare with other backtests

---

# Chapter 9: Competition Engine

## Summary

Deterministic competition system with anti-cheat, leaderboards, and replay functionality.

**Files:**
- `/lib/competition/engine.ts`
- `/lib/competition/deterministicRunner.ts`
- `/lib/competition/antiCheat.ts`
- `/lib/competition/leaderboard.ts`
- `/lib/competition/scoring.ts`

## Architecture

```
Competition System
├── Competition Engine
│   ├── Create competition
│   ├── Validate submissions
│   └── Run deterministic backtests
├── Anti-Cheat
│   ├── Strategy fingerprinting
│   ├── Duplicate detection
│   └── Manipulation detection
├── Scoring System
│   ├── Calculate scores
│   ├── Rank strategies
│   └── Update leaderboard
└── Replay System
    ├── Store execution logs
    ├── Replay backtest
    └── Verify results
```

## Database Tables

### competitions
- `id`, `name`, `start_date`, `end_date`, `prize_pool`, `status`

### competition_entries
- `id`, `competition_id`, `user_id`, `strategy_id`, `pnl`, `rank`

## Testing Procedures

### Test Case 1: Submit Strategy to Competition

**Steps:**
1. Create competition
2. Create strategy
3. Submit strategy to competition
4. Verify entry created

**Expected:**
- Entry created in database
- Strategy validated
- Backtest run deterministically
- Score calculated
- Rank assigned

### Test Case 2: View Leaderboard

**Steps:**
1. Submit multiple strategies
2. View competition leaderboard
3. Verify rankings

**Expected:**
- Strategies ranked by PnL
- User names displayed
- PnL values shown
- Rankings update in real-time

### Test Case 3: Replay Competition Entry

**Steps:**
1. Submit strategy
2. View replay
3. Verify execution matches

**Expected:**
- Replay shows exact execution
- Trades match original
- PnL matches original
- Can step through execution

## Manual Testing Checklist

- [ ] Can create competition
- [ ] Can submit strategy
- [ ] Strategy validated
- [ ] Backtest runs deterministically
- [ ] Leaderboard updates
- [ ] Rankings correct
- [ ] Replay works
- [ ] Anti-cheat detects duplicates
- [ ] Competition timer works
- [ ] Prize pool displayed

---

# Chapter 10: Cloud Sync & Social System

## Summary

Complete social platform with profiles, strategy publishing, sharing, forking, likes, comments, and cloud synchronization.

**Files:**
- `/lib/cloud/strategySync.ts`
- `/lib/cloud/useCloudSync.ts`
- `/components/profiles/`
- `/components/sharing/`
- `/components/strategyLibrary/`

## Database Schema

See migration: `002_chapter10_social_schema.sql`

**Tables:**
- `users` (extended with profile fields)
- `strategies` (extended with publishing fields)
- `strategy_versions`
- `strategy_likes`
- `strategy_comments`
- `user_following`
- `strategy_saves`

## Testing Procedures

### Test Case 1: Publish Strategy

**Steps:**
1. Create strategy
2. Click "Publish"
3. Fill in title, description, tags
4. Set visibility to "public"
5. Submit

**Expected:**
- Strategy saved to database
- Visibility set to "public"
- Strategy appears in discover page
- Strategy accessible via public URL

**Verification:**
1. Check Supabase: `strategies` table
2. Verify `visibility = 'public'`
3. Verify `title`, `description`, `tags` set
4. Visit `/strategy/{id}`
5. Verify public view loads

### Test Case 2: Like Strategy

**Steps:**
1. View public strategy
2. Click Like button
3. Verify like count increases

**Expected:**
- Like created in database
- Like count increments
- Button shows "Liked" state

**Verification:**
1. Check Supabase: `strategy_likes` table
2. Verify row created
3. Check `strategies.likes_count` incremented
4. Verify UI shows updated count

### Test Case 3: Comment on Strategy

**Steps:**
1. View public strategy
2. Write comment
3. Submit comment

**Expected:**
- Comment saved to database
- Comment appears in list
- Comment count increments

### Test Case 4: Fork Strategy

**Steps:**
1. View public strategy
2. Click "Fork Strategy"
3. Verify fork created

**Expected:**
- New strategy created
- `forked_from` set to original
- Strategy loads in IDE
- User owns forked strategy

### Test Case 5: Cloud Sync Autosave

**Steps:**
1. Open strategy in IDE
2. Make changes
3. Wait 3 seconds
4. Verify autosave triggers

**Expected:**
- Changes saved to database
- `updated_at` timestamp updates
- Version snapshot created if >5% change
- Sync status shows "Saved"

**Verification:**
1. Check browser network tab
2. Verify API call to update strategy
3. Check Supabase: `strategies` table
4. Verify `updated_at` changed
5. Check `strategy_versions` if version created

### Test Case 6: Version History

**Steps:**
1. Make multiple changes to strategy
2. View version history
3. Restore previous version

**Expected:**
- Versions listed chronologically
- Can view version details
- Can restore version
- Strategy reverts to selected version

## Manual Testing Checklist

### Publishing:

- [ ] Can publish strategy
- [ ] Strategy appears in discover
- [ ] Public URL works
- [ ] Unlisted URL works
- [ ] Private strategy not visible publicly

### Social Features:

- [ ] Can like strategy
- [ ] Can unlike strategy
- [ ] Like count updates
- [ ] Can comment
- [ ] Comments display
- [ ] Can delete own comments
- [ ] Can fork strategy
- [ ] Fork link shows original

### Cloud Sync:

- [ ] Autosave works (3s interval)
- [ ] Manual save works
- [ ] Version snapshots created
- [ ] Version history accessible
- [ ] Can restore versions
- [ ] Sync conflicts detected
- [ ] Last saved timestamp updates

### Profiles:

- [ ] Can view user profile
- [ ] Profile shows strategies
- [ ] Can follow user
- [ ] Follow count updates
- [ ] Can update own profile
- [ ] Avatar upload works
- [ ] Bio updates

### Discovery:

- [ ] Discover page loads
- [ ] Search works
- [ ] Filters work
- [ ] Trending shows
- [ ] Top builders shows
- [ ] Tag pages work

## Integration Testing

### Test Full Publishing Flow

1. Create strategy in IDE
2. Validate strategy
3. Publish strategy
4. Set visibility to public
5. Add description and tags
6. View public strategy page
7. Like strategy
8. Comment on strategy
9. Fork strategy
10. Verify fork in own dashboard

### Test Cloud Sync Flow

1. Create strategy
2. Make changes
3. Verify autosave
4. Check version created
5. Make more changes
6. View version history
7. Restore previous version
8. Verify state restored

## Debugging Guide

### Common Sync Issues

1. **Autosave Not Working**
   - **Check:** Is strategy valid? Is user logged in?
   - **Fix:** Verify `useCloudSync` hook initialized

2. **Version Not Created**
   - **Check:** Is change >5%?
   - **Fix:** Verify diff calculation

3. **Sync Conflict**
   - **Check:** Multiple users editing?
   - **Fix:** Implement conflict resolution

---

# Chapter 11: Real-Time Market Data Layer

## Summary

Real-time market data feeds, live indicator computation, and live strategy evaluation.

**Files:**
- `/lib/realtime/feeds/` - Data feeds
- `/lib/realtime/indicators/` - Live indicators
- `/lib/realtime/engine/` - Live strategy runner
- `/lib/realtime/hooks/` - React hooks
- `/lib/realtime/ui/` - UI components

## Architecture

```
Real-Time System
├── Feed Manager
│   ├── Binance Feed (crypto)
│   ├── Finnhub Feed (stocks)
│   └── CryptoCompare Feed (fallback)
├── Indicator Engine
│   ├── Incremental updates
│   ├── Caching (500 candles)
│   └── Subscriber pattern
├── Strategy Runner
│   ├── Live evaluation
│   ├── Signal generation
│   └── PnL tracking
└── Event Bus
    ├── Price updates
    ├── Indicator updates
    ├── Signal events
    └── Risk alerts
```

## Testing Procedures

### Test Case 1: Subscribe to Price Feed

**Steps:**
1. Use `useLivePrice('BTCUSDT', '1h')`
2. Verify connection established
3. Wait for candle updates

**Expected:**
- `connected === true`
- `candle` updates with new data
- `candles` array grows
- Status badge shows "LIVE"

**Verification:**
1. Check browser console for WebSocket connection
2. Verify `candle` object has `open`, `high`, `low`, `close`
3. Verify `timestamp` updates
4. Check `LiveStatusBadge` shows "LIVE"

### Test Case 2: Live Indicator Updates

**Steps:**
1. Subscribe to RSI indicator
2. Wait for price updates
3. Verify RSI values update

**Expected:**
- Indicator values computed
- Values update on new candles
- Values match expected calculations

### Test Case 3: Live Strategy Evaluation

**Steps:**
1. Start live strategy
2. Wait for signals
3. Verify entry/exit signals generated

**Expected:**
- Strategy evaluates on each candle
- Signals emitted when conditions met
- PnL updates in real-time
- Logs show evaluation

### Test Case 4: Feed Reconnection

**Steps:**
1. Connect to feed
2. Disconnect network
3. Reconnect network

**Expected:**
- Feed detects disconnection
- Attempts reconnection
- Reconnects successfully
- Data resumes

## Manual Testing Checklist

- [ ] Price feed connects
- [ ] Candles update in real-time
- [ ] Indicators compute correctly
- [ ] Strategy evaluates live
- [ ] Signals generated
- [ ] PnL updates
- [ ] Reconnection works
- [ ] Rate limiting works
- [ ] Feed switching works
- [ ] Multiple subscriptions work

## Integration Testing

### Test Live Monitor in IDE

1. Open IDE → Live Monitor tab
2. Start live monitoring
3. Verify chart updates
4. Verify indicators update
5. Verify logs stream
6. Verify stats update
7. Stop monitoring
8. Verify cleanup

---

# Chapter 12: Alerts, Notifications & Triggers

## Summary

Complete alert system with user-defined triggers, risk event detection, cross-strategy signals, and notifications.

**Files:**
- `/lib/alerts/` - Alert system
- `/components/alerts/` - Alert UI
- `/app/api/alerts/` - Alert API

## Architecture

```
Alert System
├── Alert Engine
│   ├── Listens to event bus
│   ├── Creates alerts
│   └── Stores in database
├── Trigger Engine
│   ├── User-defined rules
│   ├── Condition evaluation
│   └── Action execution
├── Risk Events
│   ├── Drawdown detection
│   ├── Whipsaw detection
│   └── Volatility detection
├── Cross-Strategy Signals
│   ├── Signal routing
│   ├── Value forwarding
│   └── Risk sync
└── Notifier
    ├── In-app notifications
    ├── Browser push
    └── Database storage
```

## Testing Procedures

### Test Case 1: Entry Signal Alert

**Steps:**
1. Start live strategy
2. Wait for entry signal
3. Verify alert created

**Expected:**
- Alert created in database
- Notification appears
- Alert shows in Alert Center
- Notification bell shows count

**Verification:**
1. Check Supabase: `alerts` table
2. Verify row created with `type='entry'`
3. Check `notifications` table
4. Verify notification created
5. Check UI: Notification bell
6. Verify alert in Alert Center

### Test Case 2: Create Custom Trigger

**Steps:**
1. Open IDE → Alerts tab
2. Click "New Trigger"
3. Define condition: RSI < 30
4. Define action: Alert "Oversold"
5. Save trigger

**Expected:**
- Trigger saved to database
- Trigger evaluates on new candles
- Alert created when condition met

### Test Case 3: Risk Alert

**Steps:**
1. Run strategy with high drawdown
2. Verify risk alert created

**Expected:**
- Alert created when drawdown > 10%
- Alert severity based on drawdown level
- Alert shows in Risk Alert Panel

### Test Case 4: Cross-Strategy Signal

**Steps:**
1. Create link: BTC strategy → ETH strategy
2. BTC strategy generates entry signal
3. Verify signal forwarded to ETH strategy

**Expected:**
- Link created in database
- Signal forwarded via event bus
- ETH strategy receives signal

## Manual Testing Checklist

- [ ] Alerts created on signals
- [ ] Notifications appear
- [ ] Notification bell shows count
- [ ] Can mark alerts as read
- [ ] Can delete alerts
- [ ] Custom triggers work
- [ ] Risk alerts generated
- [ ] Cross-strategy links work
- [ ] Alert Center filters work
- [ ] Real-time alert updates

---

# End-to-End Testing Protocol

## Full Regression Test

### Test 1: Complete Strategy Creation Flow

1. **Landing Page**
   - [ ] Page loads
   - [ ] Wallet connect button works
   - [ ] Navigation works

2. **Wallet Connection**
   - [ ] Connect wallet
   - [ ] User created in database
   - [ ] Redirected to dashboard

3. **Create Strategy**
   - [ ] Navigate to "New Strategy"
   - [ ] Write TQL code
   - [ ] Validate strategy
   - [ ] Save strategy
   - [ ] Strategy appears in dashboard

4. **Edit Strategy**
   - [ ] Open strategy in IDE
   - [ ] Switch between modes
   - [ ] Make changes
   - [ ] Verify autosave
   - [ ] Save manually

5. **Run Backtest**
   - [ ] Open Backtest panel
   - [ ] Configure backtest
   - [ ] Run backtest
   - [ ] View results
   - [ ] Verify charts render

6. **Publish Strategy**
   - [ ] Click "Publish"
   - [ ] Fill in details
   - [ ] Set visibility
   - [ ] Submit
   - [ ] Verify public page

7. **Live Monitoring**
   - [ ] Open Live Monitor
   - [ ] Start live monitoring
   - [ ] Verify data streams
   - [ ] Verify alerts created

8. **Social Features**
   - [ ] Like strategy
   - [ ] Comment on strategy
   - [ ] Fork strategy
   - [ ] View profile

## User Flow Tests

### Flow 1: New User Onboarding

1. Land on homepage
2. Connect wallet
3. View dashboard
4. Create first strategy
5. Run backtest
6. Publish strategy

### Flow 2: Strategy Discovery

1. Browse discover page
2. Search strategies
3. View strategy details
4. Like strategy
5. Fork strategy
6. Edit fork

### Flow 3: Competition Participation

1. View competitions
2. Select competition
3. Submit strategy
4. View leaderboard
5. Check ranking
6. View replay

## API Testing

### Test All API Routes

**GET Routes:**
- [ ] `/api/strategies?user_id=X`
- [ ] `/api/strategies/[id]?user_id=X`
- [ ] `/api/discover/search?q=test`
- [ ] `/api/discover/trending`
- [ ] `/api/discover/builders`
- [ ] `/api/alerts/list?userId=X`
- [ ] `/api/strategy/comment?strategyId=X`

**POST Routes:**
- [ ] `/api/strategies` (create)
- [ ] `/api/strategy/publish`
- [ ] `/api/strategy/like`
- [ ] `/api/strategy/comment`
- [ ] `/api/strategy/fork`
- [ ] `/api/alerts/create`
- [ ] `/api/profile/update`

**DELETE Routes:**
- [ ] `/api/strategies/[id]?user_id=X`
- [ ] `/api/alerts/delete?alertId=X&userId=X`

## WebSocket Testing

### Test Real-Time Feeds

1. **Connect to Binance Feed**
   - [ ] WebSocket connects
   - [ ] Receives candle data
   - [ ] Data format correct

2. **Multiple Subscriptions**
   - [ ] Subscribe to multiple symbols
   - [ ] All feeds active
   - [ ] Rate limiting works

3. **Reconnection**
   - [ ] Disconnect network
   - [ ] Verify reconnection attempt
   - [ ] Verify reconnection success

## Database Testing

### Verify All Tables

1. **Users Table**
   - [ ] User created on wallet connect
   - [ ] Profile fields update
   - [ ] Followers/following counts update

2. **Strategies Table**
   - [ ] Strategy created
   - [ ] Publishing fields set
   - [ ] Version increments
   - [ ] Likes/comments counts update

3. **Alerts Table**
   - [ ] Alerts created
   - [ ] Read status updates
   - [ ] Deletion works

4. **Notifications Table**
   - [ ] Notifications created
   - [ ] Read status updates
   - [ ] Links work

## Performance Testing

### Load Tests

1. **Multiple Strategies**
   - [ ] Create 100 strategies
   - [ ] Verify performance
   - [ ] Verify pagination

2. **Multiple Backtests**
   - [ ] Run 10 backtests simultaneously
   - [ ] Verify no crashes
   - [ ] Verify results accurate

3. **Multiple Live Feeds**
   - [ ] Subscribe to 5 symbols
   - [ ] Verify performance
   - [ ] Verify rate limiting

## Browser Testing

### Cross-Browser

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive Testing

- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)

---

# Appendices

## Appendix A: Deployment Checklist

- [ ] Environment variables set
- [ ] Supabase migrations applied
- [ ] Database indexes created
- [ ] API routes tested
- [ ] WebSocket connections tested
- [ ] Build succeeds
- [ ] Production build tested
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Monitoring configured

## Appendix B: Troubleshooting Guide

### Common Issues

1. **Supabase Connection Failed**
   - Check environment variables
   - Verify Supabase URL and key
   - Check network connectivity

2. **WebSocket Not Connecting**
   - Check feed provider status
   - Verify API keys (Finnhub)
   - Check browser console for errors

3. **Strategy Not Saving**
   - Check user authentication
   - Verify strategy validation
   - Check network tab for errors

4. **Backtest Fails**
   - Check date range
   - Verify data available
   - Check strategy validity

## Appendix C: API Reference

### Strategy API

**Create Strategy:**
```
POST /api/strategies
Body: { user_id, title, raw_prompt, json_logic, block_schema, pseudocode }
Response: { strategy: Strategy }
```

**Get Strategies:**
```
GET /api/strategies?user_id=UUID
Response: { strategies: Strategy[] }
```

**Update Strategy:**
```
PUT /api/strategies/[id]
Body: { user_id, ...updates }
Response: { strategy: Strategy }
```

### Alert API

**Create Alert:**
```
POST /api/alerts/create
Body: { user_id, strategy_id, type, message, payload, severity }
Response: { alert: Alert }
```

**List Alerts:**
```
GET /api/alerts/list?userId=UUID&strategyId=UUID&type=entry&unreadOnly=true
Response: { alerts: Alert[] }
```

## Appendix D: File Structure Index

### Core Libraries
- `/lib/tql/` - TQL language system
- `/lib/backtester/` - Backtesting engine
- `/lib/realtime/` - Real-time data layer
- `/lib/alerts/` - Alert system
- `/lib/cloud/` - Cloud sync
- `/lib/competition/` - Competition engine

### Components
- `/components/ide/` - IDE components
- `/components/alerts/` - Alert components
- `/components/competition/` - Competition components
- `/components/profiles/` - Profile components
- `/components/sharing/` - Sharing components

### API Routes
- `/app/api/strategies/` - Strategy CRUD
- `/app/api/alerts/` - Alert management
- `/app/api/discover/` - Discovery/search
- `/app/api/strategy/` - Strategy actions (like, comment, fork)
- `/app/api/realtime/` - Real-time endpoints

## Appendix E: Version History

- **v1.0** - Chapters 1-12 complete
- Initial release with full feature set

---

# 🧪 COMPREHENSIVE TESTING OUTLINE - ALL FEATURES

## Overview

This section provides **complete testing procedures** for every feature in TradeIQ, including:
- **Frontend User Interactions** - What the user clicks, types, sees
- **Backend API Calls** - Request/response formats, status codes
- **Database Operations** - What gets saved, fetched, updated
- **Expected Results** - What should happen at each step
- **Error Cases** - What happens when things go wrong

---

## TESTING SCENARIO 1: User Onboarding & Authentication

### Frontend Flow

1. **User lands on homepage** (`/`)
   - **UI Elements:** Logo, "Connect Wallet" button, feature sections
   - **User Action:** Click "Connect Wallet" button
   - **Expected:** Wallet adapter modal opens

2. **User connects Phantom wallet**
   - **UI Elements:** Wallet selection modal
   - **User Action:** Select Phantom, approve connection
   - **Expected:** Wallet address displayed, redirect to dashboard

### Backend API Calls

**No API calls** - Wallet connection is client-side only

### Database Operations

**When user first connects:**
- **Table:** `users`
- **Operation:** `INSERT`
- **Data:**
  ```sql
  INSERT INTO users (wallet_address, created_at, fake_balance, tier)
  VALUES ('<wallet_address>', NOW(), 1000.00, 'free')
  ```
- **Result:** New user record created with UUID

**Verify in Supabase:**
```sql
SELECT * FROM users WHERE wallet_address = '<wallet_address>';
-- Should return 1 row with new user
```

### Expected Console Output

```
[Wallet] Connecting...
[Wallet] Connected: <wallet_address>
[AuthStore] Fetching user...
[AuthStore] User loaded: <user_id>
```

### Error Cases

- **Wallet Rejection:** User cancels connection
  - **Expected:** Modal closes, user stays on homepage
  - **No database changes**

- **Network Error:** Supabase connection fails
  - **Expected:** Error message shown, retry option
  - **Console:** `[Supabase] Connection failed: <error>`

---

## TESTING SCENARIO 2: Dashboard - View Strategies

### Frontend Flow

1. **User navigates to dashboard** (`/dashboard`)
   - **UI Elements:** Header, "New Strategy" button, strategy cards grid
   - **User Action:** Page loads automatically
   - **Expected:** Strategies list displayed

### Backend API Calls

**API Call:** `GET /api/strategies?user_id=<user_id>`

**Request:**
```http
GET /api/strategies?user_id=<uuid> HTTP/1.1
Host: localhost:3000
```

**Response (Success - 200):**
```json
{
  "strategies": [
    {
      "id": "<uuid>",
      "user_id": "<uuid>",
      "title": "My Strategy",
      "raw_prompt": "Buy when RSI < 30",
      "json_logic": {...},
      "block_schema": {...},
      "pseudocode": "...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "error": "user_id is required"
}
```

### Database Operations

**Query:**
```sql
SELECT * FROM strategies 
WHERE user_id = '<user_id>' 
ORDER BY created_at DESC;
```

**Expected Result:** Array of strategy records

**Verify in Supabase:**
1. Open Table Editor → `strategies`
2. Filter by `user_id`
3. Verify strategies match what's displayed

### Expected Console Output

```
[Dashboard] Fetching strategies for user: <user_id>
[StrategyStore] Strategies loaded: 3
```

### Error Cases

- **No Strategies:** User has no strategies
  - **Expected:** "No strategies yet" message with "Create First Strategy" button
  - **API Response:** `{ "strategies": [] }`

- **Invalid User ID:** Malformed UUID
  - **Expected:** Error message, redirect to homepage
  - **API Response:** `{ "error": "Invalid user_id format" }`

---

## TESTING SCENARIO 3: Create New Strategy

### Frontend Flow

1. **User clicks "New Strategy" button**
   - **UI Elements:** Button in dashboard header
   - **User Action:** Click button
   - **Expected:** Loading state, then redirect to IDE

2. **IDE loads with empty strategy**
   - **UI Elements:** IDE tabs (TQL, Blocks, JSON), editor panels
   - **User Action:** None (auto-loads)
   - **Expected:** Empty strategy editor ready for input

### Backend API Calls

**API Call:** `POST /api/strategies`

**Request:**
```http
POST /api/strategies HTTP/1.1
Content-Type: application/json

{
  "user_id": "<uuid>",
  "title": "Untitled Strategy",
  "raw_prompt": "",
  "json_logic": {},
  "block_schema": {},
  "pseudocode": ""
}
```

**Response (Success - 201):**
```json
{
  "strategy": {
    "id": "<new_uuid>",
    "user_id": "<uuid>",
    "title": "Untitled Strategy",
    "raw_prompt": "",
    "json_logic": {},
    "block_schema": {},
    "pseudocode": "",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Database Operations

**Insert:**
```sql
INSERT INTO strategies (
  user_id, title, raw_prompt, json_logic, block_schema, pseudocode, created_at, updated_at
) VALUES (
  '<user_id>', 'Untitled Strategy', '', '{}'::jsonb, '{}'::jsonb, '', NOW(), NOW()
) RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `strategies`
2. Find new row with `title = 'Untitled Strategy'`
3. Verify `user_id` matches current user
4. Verify `created_at` is recent timestamp

### Expected Console Output

```
[StrategyStore] Creating new strategy...
[StrategyStore] Strategy created: <strategy_id>
[Router] Navigating to /strategy/<strategy_id>
```

### Error Cases

- **Missing User ID:** `user_id` not provided
  - **Expected:** Error message, strategy not created
  - **API Response:** `{ "error": "user_id is required" }`

- **Database Error:** Supabase connection fails
  - **Expected:** Error toast, strategy not created
  - **Console:** `[Supabase] Insert failed: <error>`

---

## TESTING SCENARIO 4: Edit Strategy in IDE - TQL Mode

### Frontend Flow

1. **User types TQL code in editor**
   - **UI Elements:** TQL editor textarea
   - **User Action:** Type:
     ```tql
     STRATEGY "RSI Basic"
     SETTINGS
       symbol: BTCUSDT
       timeframe: 1h
     INDICATORS
       rsi: rsi(length=14)
     RULES
       ENTRY:
         IF rsi < 30 THEN ENTER long 10%
     ```
   - **Expected:** Code appears in editor, syntax highlighting active

2. **Auto-save triggers (after 3 seconds)**
   - **UI Elements:** Status bar shows "Saving..." then "Saved"
   - **User Action:** None (automatic)
   - **Expected:** Strategy saved to database

### Backend API Calls

**API Call:** `PUT /api/strategies/<strategy_id>`

**Request:**
```http
PUT /api/strategies/<strategy_id> HTTP/1.1
Content-Type: application/json

{
  "user_id": "<uuid>",
  "strategy_tql": "STRATEGY \"RSI Basic\"\nSETTINGS\n  symbol: BTCUSDT\n...",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Response (Success - 200):**
```json
{
  "strategy": {
    "id": "<strategy_id>",
    "strategy_tql": "...",
    "updated_at": "2024-01-01T00:00:01Z"
  }
}
```

### Database Operations

**Update:**
```sql
UPDATE strategies 
SET 
  strategy_tql = '<tql_code>',
  updated_at = NOW()
WHERE id = '<strategy_id>' AND user_id = '<user_id>'
RETURNING *;
```

**Version Snapshot (if >5% change):**
```sql
INSERT INTO strategy_versions (
  strategy_id, version, strategy_tql, created_at
) VALUES (
  '<strategy_id>', <version>, '<tql_code>', NOW()
);
```

**Verify in Supabase:**
1. Open Table Editor → `strategies`
2. Find strategy by ID
3. Verify `strategy_tql` column updated
4. Verify `updated_at` timestamp changed
5. Check `strategy_versions` table if version created

### Expected Console Output

```
[IDE] TQL text changed
[IDE] Auto-save triggered (3s delay)
[CloudSync] Uploading strategy...
[CloudSync] Strategy saved successfully
[IDE] Status: Saved at <timestamp>
```

### Error Cases

- **Invalid TQL Syntax:** User types invalid code
  - **Expected:** Validation errors shown in diagnostics overlay
  - **Auto-save:** Still saves, but with validation warnings
  - **Console:** `[Validator] Syntax error: <error>`

- **Network Error:** Save fails
  - **Expected:** Error message in status bar, retry option
  - **Console:** `[CloudSync] Save failed: <error>`

---

## TESTING SCENARIO 5: Switch IDE Modes (TQL → JSON → Blocks)

### Frontend Flow

1. **User clicks "JSON / Advanced" tab**
   - **UI Elements:** Tab bar, JSON editor
   - **User Action:** Click tab
   - **Expected:** JSON editor loads with compiled JSON

2. **User edits JSON**
   - **UI Elements:** JSON editor (monaco/codemirror)
   - **User Action:** Edit JSON structure
   - **Expected:** JSON updates, validation runs

3. **User clicks "Block Mode" tab**
   - **UI Elements:** Block editor canvas
   - **User Action:** Click tab
   - **Expected:** Blocks generated from JSON, displayed on canvas

### Backend API Calls

**No API calls** - Mode switching is client-side only

### Database Operations

**When user makes changes and auto-save triggers:**
- **Table:** `strategies`
- **Operation:** `UPDATE`
- **Data:**
  ```sql
  UPDATE strategies SET
    strategy_json = '<json_data>'::jsonb,
    strategy_blocks = '<blocks_data>'::jsonb,
    updated_at = NOW()
  WHERE id = '<strategy_id>'
  ```

**Verify in Supabase:**
1. Open Table Editor → `strategies`
2. Find strategy
3. Verify `strategy_json` column contains JSON
4. Verify `strategy_blocks` column contains block structure

### Expected Console Output

```
[IDE] Switching to JSON mode
[IDE] Compiling TQL to JSON...
[IDE] JSON compiled successfully
[IDE] Switching to Block mode
[IDE] Converting JSON to blocks...
[IDE] Blocks generated: 5 blocks
```

### Error Cases

- **Invalid JSON:** User types invalid JSON
  - **Expected:** JSON editor shows syntax errors
  - **Mode Switch:** Block mode disabled until JSON valid
  - **Console:** `[JSON] Parse error: <error>`

- **Conversion Error:** JSON can't convert to blocks
  - **Expected:** Error message, blocks not generated
  - **Console:** `[Blocks] Conversion failed: <error>`

---

## TESTING SCENARIO 6: Run Backtest

### Frontend Flow

1. **User opens Backtest panel**
   - **UI Elements:** Backtests tab, backtest controls
   - **User Action:** Click "Backtests" tab
   - **Expected:** Backtest panel loads

2. **User configures backtest**
   - **UI Elements:** Date range picker, symbol selector, timeframe selector
   - **User Action:** 
     - Select date range: Last 30 days
     - Symbol: BTCUSDT
     - Timeframe: 1h
   - **Expected:** Controls update

3. **User clicks "Run Backtest"**
   - **UI Elements:** Run button
   - **User Action:** Click button
   - **Expected:** Loading indicator, backtest runs

4. **Backtest completes**
   - **UI Elements:** Results panel, charts, trade list
   - **User Action:** None (automatic)
   - **Expected:** Results displayed with charts and statistics

### Backend API Calls

**API Call:** `POST /api/backtests`

**Request:**
```http
POST /api/backtests HTTP/1.1
Content-Type: application/json

{
  "user_id": "<uuid>",
  "strategy_id": "<uuid>",
  "chart_asset": "BTCUSDT",
  "pnl": 125.50,
  "trades": [
    {
      "entry_price": 50000,
      "exit_price": 51000,
      "entry_time": 1000,
      "exit_time": 2000,
      "pnl": 100,
      "direction": "long"
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "backtest": {
    "id": "<backtest_uuid>",
    "user_id": "<uuid>",
    "strategy_id": "<uuid>",
    "chart_asset": "BTCUSDT",
    "pnl": 125.50,
    "trades": [...],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Database Operations

**Backtest Execution (Client-Side):**
- Strategy validated
- Candles loaded from market data API
- Indicators pre-computed
- Strategy evaluated on each candle
- Trades executed
- PnL calculated

**Backtest Save:**
```sql
INSERT INTO backtests (
  user_id, strategy_id, chart_asset, pnl, trades, created_at
) VALUES (
  '<user_id>', '<strategy_id>', 'BTCUSDT', 125.50, '<trades_json>'::jsonb, NOW()
) RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `backtests`
2. Find new backtest record
3. Verify `pnl` matches displayed value
4. Verify `trades` JSON contains trade array
5. Verify `created_at` is recent

### Expected Console Output

```
[Backtester] Starting backtest...
[Backtester] Loading candles for BTCUSDT (1h)...
[Backtester] Loaded 720 candles
[Backtester] Pre-computing indicators...
[Backtester] Running strategy evaluation...
[Backtester] Trade executed: Entry at 50000
[Backtester] Trade executed: Exit at 51000
[Backtester] Backtest complete: PnL = 125.50, Trades = 5
[BacktestStore] Saving backtest...
[BacktestStore] Backtest saved: <backtest_id>
```

### Error Cases

- **No Candles:** Date range has no data
  - **Expected:** Error message: "No candles loaded for date range"
  - **Console:** `[Backtester] No candles found`

- **Invalid Strategy:** Strategy has validation errors
  - **Expected:** Error message, backtest not run
  - **Console:** `[Backtester] Strategy validation failed: <errors>`

- **Market Data API Error:** Can't fetch candles
  - **Expected:** Error message, retry option
  - **Console:** `[MarketAPI] Failed to fetch candles: <error>`

---

## TESTING SCENARIO 7: Publish Strategy

### Frontend Flow

1. **User clicks "Publish" button**
   - **UI Elements:** Publish button in IDE header
   - **User Action:** Click button
   - **Expected:** Publish modal opens

2. **User fills publish form**
   - **UI Elements:** Title input, description textarea, tags input, visibility dropdown
   - **User Action:** 
     - Title: "RSI Oversold Strategy"
     - Description: "Buys when RSI < 30"
     - Tags: "rsi", "momentum", "crypto"
     - Visibility: "Public"
   - **Expected:** Form fields update

3. **User clicks "Publish"**
   - **UI Elements:** Publish button in modal
   - **User Action:** Click button
   - **Expected:** Loading state, then success message

### Backend API Calls

**API Call:** `POST /api/strategy/publish`

**Request:**
```http
POST /api/strategy/publish HTTP/1.1
Content-Type: application/json

{
  "strategy_id": "<uuid>",
  "user_id": "<uuid>",
  "title": "RSI Oversold Strategy",
  "description": "Buys when RSI < 30",
  "tags": ["rsi", "momentum", "crypto"],
  "visibility": "public"
}
```

**Response (Success - 200):**
```json
{
  "strategy": {
    "id": "<uuid>",
    "title": "RSI Oversold Strategy",
    "description": "Buys when RSI < 30",
    "tags": ["rsi", "momentum", "crypto"],
    "visibility": "public",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Database Operations

**Update Strategy:**
```sql
UPDATE strategies SET
  title = 'RSI Oversold Strategy',
  description = 'Buys when RSI < 30',
  tags = ARRAY['rsi', 'momentum', 'crypto'],
  visibility = 'public',
  updated_at = NOW()
WHERE id = '<strategy_id>' AND user_id = '<user_id>'
RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `strategies`
2. Find strategy by ID
3. Verify `title`, `description`, `tags`, `visibility` updated
4. Verify `visibility = 'public'`
5. Check strategy appears in discover page query

### Expected Console Output

```
[Strategy] Publishing strategy...
[API] POST /api/strategy/publish
[Strategy] Strategy published successfully
[Router] Strategy is now public at /strategy/<strategy_id>
```

### Error Cases

- **Missing Title:** User doesn't provide title
  - **Expected:** Validation error, publish blocked
  - **API Response:** `{ "error": "Title is required" }`

- **Invalid Visibility:** Invalid visibility value
  - **Expected:** Validation error
  - **API Response:** `{ "error": "Invalid visibility value" }`

---

## TESTING SCENARIO 8: Like Strategy

### Frontend Flow

1. **User views public strategy**
   - **UI Elements:** Strategy page, like button
   - **User Action:** Navigate to `/strategy/<strategy_id>`
   - **Expected:** Strategy page loads, like button shows current like count

2. **User clicks Like button**
   - **UI Elements:** Heart icon button
   - **User Action:** Click button
   - **Expected:** Button fills, like count increments

### Backend API Calls

**API Call:** `POST /api/strategy/like`

**Request:**
```http
POST /api/strategy/like HTTP/1.1
Content-Type: application/json

{
  "strategy_id": "<uuid>",
  "user_id": "<uuid>"
}
```

**Response (Success - 200):**
```json
{
  "liked": true,
  "likes_count": 42
}
```

**Unlike (if already liked):**
```http
DELETE /api/strategy/like?strategy_id=<uuid>&user_id=<uuid>
```

### Database Operations

**Insert Like:**
```sql
INSERT INTO strategy_likes (user_id, strategy_id, created_at)
VALUES ('<user_id>', '<strategy_id>', NOW())
ON CONFLICT (user_id, strategy_id) DO NOTHING;
```

**Update Likes Count (Trigger):**
```sql
-- Trigger automatically updates strategies.likes_count
UPDATE strategies 
SET likes_count = likes_count + 1 
WHERE id = '<strategy_id>';
```

**Verify in Supabase:**
1. Open Table Editor → `strategy_likes`
2. Find row with `user_id` and `strategy_id`
3. Verify row exists
4. Check `strategies` table, verify `likes_count` incremented

### Expected Console Output

```
[Strategy] Liking strategy...
[API] POST /api/strategy/like
[Strategy] Strategy liked successfully
[Strategy] Likes count: 42
```

### Error Cases

- **Already Liked:** User clicks like again
  - **Expected:** Unlike action, count decrements
  - **API:** `DELETE` request sent

- **Unauthorized:** User not logged in
  - **Expected:** Error message, like not saved
  - **API Response:** `{ "error": "Unauthorized" }`

---

## TESTING SCENARIO 9: Comment on Strategy

### Frontend Flow

1. **User scrolls to comments section**
   - **UI Elements:** Comments section, comment input
   - **User Action:** Scroll down
   - **Expected:** Comments section visible

2. **User types comment**
   - **UI Elements:** Textarea input
   - **User Action:** Type "Great strategy!"
   - **Expected:** Text appears in input

3. **User clicks "Post Comment"**
   - **UI Elements:** Post button
   - **User Action:** Click button
   - **Expected:** Comment appears in list, input clears

### Backend API Calls

**API Call:** `POST /api/strategy/comment`

**Request:**
```http
POST /api/strategy/comment HTTP/1.1
Content-Type: application/json

{
  "strategy_id": "<uuid>",
  "user_id": "<uuid>",
  "message": "Great strategy!"
}
```

**Response (Success - 201):**
```json
{
  "comment": {
    "id": "<comment_uuid>",
    "strategy_id": "<uuid>",
    "user_id": "<uuid>",
    "message": "Great strategy!",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Database Operations

**Insert Comment:**
```sql
INSERT INTO strategy_comments (
  strategy_id, user_id, message, created_at, updated_at
) VALUES (
  '<strategy_id>', '<user_id>', 'Great strategy!', NOW(), NOW()
) RETURNING *;
```

**Update Comments Count (Trigger):**
```sql
-- Trigger automatically updates strategies.comments_count
UPDATE strategies 
SET comments_count = comments_count + 1 
WHERE id = '<strategy_id>';
```

**Verify in Supabase:**
1. Open Table Editor → `strategy_comments`
2. Find new comment row
3. Verify `message`, `user_id`, `strategy_id` correct
4. Check `strategies` table, verify `comments_count` incremented

### Expected Console Output

```
[Strategy] Posting comment...
[API] POST /api/strategy/comment
[Strategy] Comment posted successfully
[Strategy] Comments count: 5
```

### Error Cases

- **Empty Comment:** User submits empty message
  - **Expected:** Validation error, comment not posted
  - **API Response:** `{ "error": "Message is required" }`

- **Comment Too Long:** Message exceeds limit
  - **Expected:** Validation error
  - **API Response:** `{ "error": "Message too long (max 1000 characters)" }`

---

## TESTING SCENARIO 10: Fork Strategy

### Frontend Flow

1. **User views public strategy**
   - **UI Elements:** Fork button
   - **User Action:** Navigate to public strategy page
   - **Expected:** Fork button visible

2. **User clicks "Fork Strategy"**
   - **UI Elements:** Fork button
   - **User Action:** Click button
   - **Expected:** Confirmation modal, then redirect to IDE

3. **IDE loads with forked strategy**
   - **UI Elements:** IDE with strategy loaded
   - **User Action:** None (automatic)
   - **Expected:** Strategy loads, user can edit

### Backend API Calls

**API Call:** `POST /api/strategy/fork`

**Request:**
```http
POST /api/strategy/fork HTTP/1.1
Content-Type: application/json

{
  "strategy_id": "<source_uuid>",
  "user_id": "<user_uuid>"
}
```

**Response (Success - 201):**
```json
{
  "strategy": {
    "id": "<new_fork_uuid>",
    "user_id": "<user_uuid>",
    "forked_from": "<source_uuid>",
    "title": "Fork of: RSI Strategy",
    "strategy_json": {...},
    "strategy_tql": "...",
    "strategy_blocks": {...},
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Database Operations

**Create Fork:**
```sql
INSERT INTO strategies (
  user_id, title, forked_from, strategy_json, strategy_tql, strategy_blocks, 
  visibility, created_at, updated_at
) 
SELECT 
  '<user_id>',
  'Fork of: ' || title,
  '<source_strategy_id>',
  strategy_json,
  strategy_tql,
  strategy_blocks,
  'private',
  NOW(),
  NOW()
FROM strategies
WHERE id = '<source_strategy_id>'
RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `strategies`
2. Find new strategy with `forked_from = <source_id>`
3. Verify `user_id` is current user
4. Verify `visibility = 'private'`
5. Verify strategy data copied from source

### Expected Console Output

```
[Strategy] Forking strategy...
[API] POST /api/strategy/fork
[Strategy] Strategy forked successfully
[Router] Navigating to /strategy/<fork_id>
[IDE] Loading forked strategy...
```

### Error Cases

- **Already Forked:** User tries to fork own strategy
  - **Expected:** Error message or prevent action
  - **API Response:** `{ "error": "Cannot fork your own strategy" }`

- **Private Strategy:** User tries to fork private strategy
  - **Expected:** Error message, fork blocked
  - **API Response:** `{ "error": "Cannot fork private strategy" }`

---

## TESTING SCENARIO 11: Live Strategy Monitoring

### Frontend Flow

1. **User opens Live Monitor tab**
   - **UI Elements:** Live Monitor tab in IDE
   - **User Action:** Click "Live Monitor" tab
   - **Expected:** Live Monitor panel loads

2. **User clicks "Start Live"**
   - **UI Elements:** Start button
   - **User Action:** Click button
   - **Expected:** Button changes to "Stop", monitoring begins

3. **Live data streams**
   - **UI Elements:** Chart updates, indicators update, logs stream
   - **User Action:** None (automatic)
   - **Expected:** Real-time updates every few seconds

### Backend API Calls

**WebSocket Connection:** `ws://localhost:3000/api/realtime`

**Connection:**
```javascript
const ws = new WebSocket('/api/realtime');
ws.send(JSON.stringify({
  type: 'subscribe',
  symbol: 'BTCUSDT',
  interval: '1h'
}));
```

**Messages Received:**
```json
{
  "type": "candle",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "data": {
    "open": 50000,
    "high": 51000,
    "low": 49500,
    "close": 50500,
    "volume": 1000,
    "time": 1000
  }
}
```

### Database Operations

**No direct database operations** - Live monitoring is real-time only

**Alerts Created (if conditions met):**
```sql
INSERT INTO alerts (
  user_id, strategy_id, type, message, payload, created_at
) VALUES (
  '<user_id>', '<strategy_id>', 'entry', 'Entry signal detected', '{}'::jsonb, NOW()
);
```

**Verify in Supabase:**
1. Open Table Editor → `alerts`
2. Filter by `strategy_id`
3. Verify alerts created during live monitoring

### Expected Console Output

```
[LiveMonitor] Starting live monitoring...
[FeedManager] Connecting to Binance WebSocket...
[FeedManager] Connected: BTCUSDT@1h
[LiveStrategy] Strategy evaluation started
[LiveStrategy] New candle received
[LiveStrategy] Indicators updated: RSI = 45.2
[LiveStrategy] Entry signal detected!
[AlertEngine] Alert created: Entry signal
```

### Error Cases

- **WebSocket Disconnect:** Connection lost
  - **Expected:** Reconnection attempt, status shows "Reconnecting"
  - **Console:** `[FeedManager] Connection lost, reconnecting...`

- **Invalid Symbol:** Symbol not supported
  - **Expected:** Error message, monitoring stops
  - **Console:** `[FeedManager] Invalid symbol: <symbol>`

---

## TESTING SCENARIO 12: View Alerts

### Frontend Flow

1. **User clicks notification bell**
   - **UI Elements:** Bell icon in header
   - **User Action:** Click bell
   - **Expected:** Dropdown opens with notifications

2. **User views Alert Center**
   - **UI Elements:** Alert Center page
   - **User Action:** Click "View All" or navigate to `/alerts`
   - **Expected:** Full alert list displayed

3. **User marks alert as read**
   - **UI Elements:** Alert card, "Mark Read" button
   - **User Action:** Click "Mark Read"
   - **Expected:** Alert marked as read, unread count decrements

### Backend API Calls

**API Call:** `GET /api/alerts/list?userId=<uuid>`

**Request:**
```http
GET /api/alerts/list?userId=<uuid> HTTP/1.1
```

**Response (Success - 200):**
```json
{
  "alerts": [
    {
      "id": "<uuid>",
      "user_id": "<uuid>",
      "strategy_id": "<uuid>",
      "type": "entry",
      "message": "Entry signal detected: long",
      "payload": {...},
      "created_at": "2024-01-01T00:00:00Z",
      "read": false,
      "severity": "info"
    }
  ]
}
```

**Mark Read:** `POST /api/alerts/mark-read`

**Request:**
```http
POST /api/alerts/mark-read HTTP/1.1
Content-Type: application/json

{
  "alertId": "<uuid>",
  "userId": "<uuid>"
}
```

### Database Operations

**Fetch Alerts:**
```sql
SELECT * FROM alerts 
WHERE user_id = '<user_id>' 
ORDER BY created_at DESC 
LIMIT 100;
```

**Mark as Read:**
```sql
UPDATE alerts 
SET read = true 
WHERE id = '<alert_id>' AND user_id = '<user_id>'
RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `alerts`
2. Filter by `user_id`
3. Verify alerts listed
4. Check `read` column updates when marked

### Expected Console Output

```
[Alerts] Fetching alerts...
[API] GET /api/alerts/list
[Alerts] Loaded 15 alerts
[Alerts] Marking alert as read...
[Alerts] Alert marked as read
```

### Error Cases

- **No Alerts:** User has no alerts
  - **Expected:** "No alerts" message
  - **API Response:** `{ "alerts": [] }`

- **Invalid Alert ID:** Mark read with wrong ID
  - **Expected:** Error message
  - **API Response:** `{ "error": "Alert not found" }`

---

## TESTING SCENARIO 13: Create Custom Alert Trigger

### Frontend Flow

1. **User opens Alerts tab in IDE**
   - **UI Elements:** Alerts tab, Triggers section
   - **User Action:** Click "Alerts" tab
   - **Expected:** Alerts panel loads

2. **User clicks "New Trigger"**
   - **UI Elements:** New Trigger button
   - **User Action:** Click button
   - **Expected:** Trigger builder opens

3. **User defines trigger**
   - **UI Elements:** Condition builder, action builder
   - **User Action:** 
     - Condition: RSI < 30
     - Action: Alert "Oversold"
   - **Expected:** Trigger configuration displayed

4. **User saves trigger**
   - **UI Elements:** Save button
   - **User Action:** Click Save
   - **Expected:** Trigger saved, appears in list

### Backend API Calls

**API Call:** `POST /api/alerts/trigger` (if exists) or stored in `alert_triggers` table

**Request:**
```http
POST /api/alerts/trigger HTTP/1.1
Content-Type: application/json

{
  "strategy_id": "<uuid>",
  "user_id": "<uuid>",
  "name": "RSI Oversold",
  "trigger": {
    "conditions": [
      {
        "type": "indicator",
        "indicator_id": "rsi",
        "operator": "lt",
        "value": 30
      }
    ],
    "actions": [
      {
        "type": "alert",
        "message": "RSI is oversold!"
      }
    ]
  },
  "enabled": true
}
```

### Database Operations

**Insert Trigger:**
```sql
INSERT INTO alert_triggers (
  strategy_id, user_id, name, trigger, enabled, created_at, updated_at
) VALUES (
  '<strategy_id>', '<user_id>', 'RSI Oversold', '<trigger_json>'::jsonb, true, NOW(), NOW()
) RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `alert_triggers`
2. Find new trigger row
3. Verify `trigger` JSON contains conditions and actions
4. Verify `enabled = true`

### Expected Console Output

```
[TriggerEngine] Creating trigger...
[TriggerEngine] Trigger saved: <trigger_id>
[TriggerEngine] Trigger enabled, monitoring conditions...
```

### Error Cases

- **Invalid Condition:** Condition syntax invalid
  - **Expected:** Validation error, trigger not saved
  - **Console:** `[TriggerEngine] Invalid condition: <error>`

- **Missing Action:** No action defined
  - **Expected:** Validation error
  - **Console:** `[TriggerEngine] At least one action required`

---

## TESTING SCENARIO 14: Submit Strategy to Competition

### Frontend Flow

1. **User navigates to Competitions page**
   - **UI Elements:** Competitions list
   - **User Action:** Navigate to `/competitions`
   - **Expected:** Active competitions displayed

2. **User clicks competition**
   - **UI Elements:** Competition card
   - **User Action:** Click card
   - **Expected:** Competition details page loads

3. **User clicks "Submit Strategy"**
   - **UI Elements:** Submit button
   - **User Action:** Click button
   - **Expected:** Strategy selection modal opens

4. **User selects strategy and submits**
   - **UI Elements:** Strategy dropdown, Submit button
   - **User Action:** Select strategy, click Submit
   - **Expected:** Loading state, then success message

### Backend API Calls

**API Call:** `POST /api/competitions/<competition_id>/submit`

**Request:**
```http
POST /api/competitions/<competition_id>/submit HTTP/1.1
Content-Type: application/json

{
  "user_id": "<uuid>",
  "strategy_id": "<uuid>"
}
```

**Response (Success - 201):**
```json
{
  "entry": {
    "id": "<entry_uuid>",
    "competition_id": "<uuid>",
    "user_id": "<uuid>",
    "strategy_id": "<uuid>",
    "pnl": 0,
    "rank": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Database Operations

**Create Entry:**
```sql
INSERT INTO competition_entries (
  competition_id, user_id, strategy_id, pnl, rank, created_at
) VALUES (
  '<competition_id>', '<user_id>', '<strategy_id>', 0, 0, NOW()
) RETURNING *;
```

**Run Deterministic Backtest:**
- Strategy validated
- Backtest run with competition's date range
- PnL calculated
- Entry updated with PnL and rank

**Update Entry:**
```sql
UPDATE competition_entries 
SET pnl = <calculated_pnl>, rank = <calculated_rank>
WHERE id = '<entry_id>'
RETURNING *;
```

**Verify in Supabase:**
1. Open Table Editor → `competition_entries`
2. Find entry by `competition_id` and `user_id`
3. Verify `strategy_id` matches
4. Verify `pnl` calculated
5. Verify `rank` assigned

### Expected Console Output

```
[Competition] Submitting strategy...
[Competition] Validating strategy...
[Competition] Running deterministic backtest...
[Competition] Backtest complete: PnL = 125.50
[Competition] Entry created: Rank = 5
[Competition] Strategy submitted successfully
```

### Error Cases

- **Competition Ended:** Competition already ended
  - **Expected:** Error message, submission blocked
  - **API Response:** `{ "error": "Competition has ended" }`

- **Already Submitted:** User already submitted strategy
  - **Expected:** Error message
  - **API Response:** `{ "error": "Strategy already submitted" }`

- **Invalid Strategy:** Strategy has validation errors
  - **Expected:** Error message, submission blocked
  - **API Response:** `{ "error": "Strategy validation failed" }`

---

## COMPLETE API REFERENCE

### Strategy APIs

**GET /api/strategies**
- **Query Params:** `user_id` (required)
- **Response:** `{ strategies: Strategy[] }`
- **Database:** `SELECT * FROM strategies WHERE user_id = ?`

**POST /api/strategies**
- **Body:** `{ user_id, title, raw_prompt, json_logic, block_schema, pseudocode }`
- **Response:** `{ strategy: Strategy }`
- **Database:** `INSERT INTO strategies (...) VALUES (...)`

**PUT /api/strategies/[id]**
- **Body:** `{ user_id, ...updates }`
- **Response:** `{ strategy: Strategy }`
- **Database:** `UPDATE strategies SET ... WHERE id = ?`

**DELETE /api/strategies/[id]**
- **Query Params:** `user_id` (required)
- **Response:** `{ success: true }`
- **Database:** `DELETE FROM strategies WHERE id = ? AND user_id = ?`

### Alert APIs

**GET /api/alerts/list**
- **Query Params:** `userId`, `strategyId?`, `type?`, `unreadOnly?`
- **Response:** `{ alerts: Alert[] }`
- **Database:** `SELECT * FROM alerts WHERE user_id = ? ...`

**POST /api/alerts/create**
- **Body:** `{ user_id, strategy_id?, type, message, payload?, severity? }`
- **Response:** `{ alert: Alert }`
- **Database:** `INSERT INTO alerts (...) VALUES (...)`

**POST /api/alerts/mark-read**
- **Body:** `{ alertId, userId }` or `{ userId, markAll: true }`
- **Response:** `{ success: true }`
- **Database:** `UPDATE alerts SET read = true WHERE ...`

**DELETE /api/alerts/delete**
- **Query Params:** `alertId`, `userId`
- **Response:** `{ success: true }`
- **Database:** `DELETE FROM alerts WHERE id = ? AND user_id = ?`

### Social APIs

**POST /api/strategy/publish**
- **Body:** `{ strategy_id, user_id, title, description, tags, visibility }`
- **Response:** `{ strategy: Strategy }`
- **Database:** `UPDATE strategies SET ... WHERE id = ?`

**POST /api/strategy/like**
- **Body:** `{ strategy_id, user_id }`
- **Response:** `{ liked: boolean, likes_count: number }`
- **Database:** `INSERT INTO strategy_likes ...` + trigger updates count

**POST /api/strategy/comment**
- **Body:** `{ strategy_id, user_id, message }`
- **Response:** `{ comment: Comment }`
- **Database:** `INSERT INTO strategy_comments ...` + trigger updates count

**POST /api/strategy/fork**
- **Body:** `{ strategy_id, user_id }`
- **Response:** `{ strategy: Strategy }`
- **Database:** `INSERT INTO strategies ... (copied from source)`

### Discovery APIs

**GET /api/discover/search**
- **Query Params:** `q` (search query)
- **Response:** `{ strategies: Strategy[] }`
- **Database:** `SELECT * FROM strategies WHERE visibility = 'public' AND (title ILIKE ? OR description ILIKE ?)`

**GET /api/discover/trending**
- **Response:** `{ strategies: Strategy[] }`
- **Database:** `SELECT * FROM strategies WHERE visibility = 'public' ORDER BY likes_count DESC LIMIT 20`

**GET /api/discover/builders**
- **Response:** `{ builders: User[] }`
- **Database:** `SELECT users.*, COUNT(strategies.id) as strategy_count FROM users JOIN strategies ON users.id = strategies.user_id GROUP BY users.id ORDER BY strategy_count DESC`

---

## NETWORK TAB VERIFICATION

### How to Verify API Calls in Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Network Tab**
3. **Filter by "Fetch/XHR"**
4. **Perform action** (e.g., click button)
5. **Verify Request:**
   - Method (GET, POST, etc.)
   - URL
   - Headers
   - Request Body (if POST/PUT)
6. **Verify Response:**
   - Status Code (200, 201, 400, etc.)
   - Response Body
   - Response Time

### Expected Network Calls for Common Actions

**Dashboard Load:**
```
GET /api/strategies?user_id=<uuid> → 200 OK
```

**Create Strategy:**
```
POST /api/strategies → 201 Created
```

**Save Strategy:**
```
PUT /api/strategies/<id> → 200 OK
```

**Run Backtest:**
```
POST /api/backtests → 201 Created
```

**Publish Strategy:**
```
POST /api/strategy/publish → 200 OK
```

**Like Strategy:**
```
POST /api/strategy/like → 200 OK
```

**Comment:**
```
POST /api/strategy/comment → 201 Created
```

**Fork Strategy:**
```
POST /api/strategy/fork → 201 Created
```

**Get Alerts:**
```
GET /api/alerts/list?userId=<uuid> → 200 OK
```

---

## DATABASE VERIFICATION CHECKLIST

### After Each Action, Verify in Supabase:

1. **User Created:**
   - Table: `users`
   - Check: `wallet_address` matches connected wallet

2. **Strategy Created:**
   - Table: `strategies`
   - Check: `user_id` matches, `title` set, `created_at` recent

3. **Strategy Updated:**
   - Table: `strategies`
   - Check: `updated_at` changed, fields updated

4. **Version Created:**
   - Table: `strategy_versions`
   - Check: New row with `strategy_id`, `version` incremented

5. **Like Created:**
   - Table: `strategy_likes`
   - Check: Row with `user_id` and `strategy_id`
   - Table: `strategies`
   - Check: `likes_count` incremented

6. **Comment Created:**
   - Table: `strategy_comments`
   - Check: Row with `message`, `user_id`, `strategy_id`
   - Table: `strategies`
   - Check: `comments_count` incremented

7. **Alert Created:**
   - Table: `alerts`
   - Check: Row with `type`, `message`, `user_id`
   - Table: `notifications`
   - Check: Notification created (trigger)

8. **Backtest Saved:**
   - Table: `backtests`
   - Check: Row with `pnl`, `trades` JSON

9. **Competition Entry:**
   - Table: `competition_entries`
   - Check: Row with `competition_id`, `user_id`, `strategy_id`, `pnl`, `rank`

---

## CONSOLE ERROR CHECKLIST

### Common Errors to Watch For:

- **❌ "Failed to fetch"** - Network error, check API route
- **❌ "Unauthorized"** - User not authenticated
- **❌ "Validation failed"** - Strategy has errors
- **❌ "WebSocket connection failed"** - Real-time feed issue
- **❌ "Supabase error"** - Database connection issue
- **❌ "TypeError: Cannot read property"** - Null/undefined check needed
- **❌ "Duplicate key"** - Database constraint violation

### Expected Console Messages (Not Errors):

- **✅ "[Store] Loading..."** - Normal loading state
- **✅ "[API] Request sent"** - Normal API call
- **✅ "[WebSocket] Connected"** - Normal connection
- **✅ "[IDE] Auto-save triggered"** - Normal autosave

---

# 🎉 END OF COMPREHENSIVE TESTING DOCUMENTATION

**This testing outline covers all major user flows, API calls, and database operations.**

**Use this as a reference when testing features or debugging issues.**

**Ready for Chapter 13: AI Assistant Integration!**

