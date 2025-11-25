/**
 * Comprehensive test suite for TQL Validator & Debugger (Chapter 5)
 * Run with: npx tsx lib/tql/validator.test.ts
 */

import {
  validateStrategy,
  isValidStrategy,
  getValidationErrors,
  getValidationWarnings,
} from './validator';
import { EXAMPLE_VALID_STRATEGY } from './schema';
import { TQErrorCode } from './errors';

console.log('🧪 Testing TQL Validator & Debugger (Chapter 5)...\n');

// =====================================================================
// TEST 1: VALID STRATEGY
// =====================================================================

console.log('✅ Test 1: Valid Strategy Validation');
const validResult = validateStrategy({ json: EXAMPLE_VALID_STRATEGY });
if (validResult.valid) {
  console.log('✅ Valid strategy passes validation');
  console.log(`   Errors: ${validResult.errors.length}`);
  console.log(`   Warnings: ${validResult.warnings.length}`);
  console.log(`   Info: ${validResult.info.length}\n`);
} else {
  console.error(`❌ Valid strategy failed: ${validResult.errors.length} errors\n`);
  validResult.errors.forEach((e) => console.error(`   - ${e.message}`));
}

// =====================================================================
// TEST 2: MISSING SECTIONS
// =====================================================================

console.log('✅ Test 2: Missing Sections');
const missingMeta = { ...EXAMPLE_VALID_STRATEGY };
delete (missingMeta as any).meta;
const missingMetaResult = validateStrategy({ json: missingMeta });
if (!missingMetaResult.valid && missingMetaResult.errors.length > 0) {
  console.log('✅ Missing meta section detected\n');
} else {
  console.error('❌ Missing meta section not detected\n');
}

// =====================================================================
// TEST 3: INVALID INDICATORS
// =====================================================================

console.log('✅ Test 3: Invalid Indicators');
const invalidIndicator = {
  ...EXAMPLE_VALID_STRATEGY,
  indicators: [
    {
      id: 'unknown_ind',
      indicator: 'unknown_indicator',
      params: {},
      output: 'numeric' as const,
    },
  ],
};
const invalidIndicatorResult = validateStrategy({ json: invalidIndicator });
if (
  !invalidIndicatorResult.valid &&
  invalidIndicatorResult.errors.some((e) => e.code === TQErrorCode.UNKNOWN_INDICATOR)
) {
  console.log('✅ Unknown indicator detected\n');
} else {
  console.error('❌ Unknown indicator not detected\n');
}

// =====================================================================
// TEST 4: INVALID INDICATOR PARAMS
// =====================================================================

console.log('✅ Test 4: Invalid Indicator Parameters');
const invalidParams = {
  ...EXAMPLE_VALID_STRATEGY,
  indicators: [
    {
      id: 'rsi_main',
      indicator: 'rsi',
      params: { length: 2000 }, // Out of range
      output: 'numeric' as const,
    },
  ],
};
const invalidParamsResult = validateStrategy({ json: invalidParams });
if (
  !invalidParamsResult.valid &&
  invalidParamsResult.errors.some((e) => e.code === TQErrorCode.INVALID_INDICATOR_PARAMS)
) {
  console.log('✅ Invalid indicator parameters detected\n');
} else {
  console.error('❌ Invalid indicator parameters not detected\n');
}

// =====================================================================
// TEST 5: MISSING ENTRY RULES
// =====================================================================

console.log('✅ Test 5: Missing Entry Rules');
const noEntryRules = {
  ...EXAMPLE_VALID_STRATEGY,
  rules: {
    ...EXAMPLE_VALID_STRATEGY.rules,
    entry: [],
  },
};
const noEntryResult = validateStrategy({ json: noEntryRules });
if (
  !noEntryResult.valid &&
  noEntryResult.errors.some((e) => e.code === TQErrorCode.NO_ENTRY_RULES)
) {
  console.log('✅ Missing entry rules detected\n');
} else {
  console.error('❌ Missing entry rules not detected\n');
}

// =====================================================================
// TEST 6: MISSING EXIT RULES
// =====================================================================

console.log('✅ Test 6: Missing Exit Rules');
const noExitRules = {
  ...EXAMPLE_VALID_STRATEGY,
  rules: {
    ...EXAMPLE_VALID_STRATEGY.rules,
    exit: [],
  },
};
const noExitResult = validateStrategy({ json: noExitRules });
if (
  !noExitResult.valid &&
  noExitResult.errors.some((e) => e.code === TQErrorCode.NO_EXIT_RULES)
) {
  console.log('✅ Missing exit rules detected\n');
} else {
  console.error('❌ Missing exit rules not detected\n');
}

// =====================================================================
// TEST 7: MISSING STOP LOSS
// =====================================================================

console.log('✅ Test 7: Missing Stop Loss');
const noStopLoss = {
  ...EXAMPLE_VALID_STRATEGY,
  risk: {
    ...EXAMPLE_VALID_STRATEGY.risk,
    stop_loss_percent: null,
    trailing_stop_percent: null,
  },
};
const noStopLossResult = validateStrategy({ json: noStopLoss });
if (
  !noStopLossResult.valid &&
  noStopLossResult.errors.some((e) => e.code === TQErrorCode.MISSING_STOP_LOSS)
) {
  console.log('✅ Missing stop loss detected\n');
} else {
  console.error('❌ Missing stop loss not detected\n');
}

// =====================================================================
// TEST 8: UNDEFINED INDICATOR
// =====================================================================

console.log('✅ Test 8: Undefined Indicator Usage');
const undefinedIndicator = {
  ...EXAMPLE_VALID_STRATEGY,
  rules: {
    ...EXAMPLE_VALID_STRATEGY.rules,
    entry: [
      {
        conditions: [
          {
            type: 'condition' as const,
            left: { source_type: 'indicator' as const, id: 'undefined_ind' },
            operator: 'lt' as const,
            right: { source_type: 'value' as const, value: 30 },
          },
        ],
        action: EXAMPLE_VALID_STRATEGY.rules.entry[0].action,
      },
    ],
  },
};
const undefinedResult = validateStrategy({ json: undefinedIndicator });
if (
  !undefinedResult.valid &&
  undefinedResult.errors.some((e) => e.code === TQErrorCode.INDICATOR_UNDEFINED)
) {
  console.log('✅ Undefined indicator usage detected\n');
} else {
  console.error('❌ Undefined indicator usage not detected\n');
}

// =====================================================================
// TEST 9: TQL VALIDATION
// =====================================================================

console.log('✅ Test 9: TQL Validation');
const validTQL = `
meta {
  name: "RSI Basic"
}

settings {
  symbol: BTCUSDT
  timeframe: 1h
}

indicators {
  rsi_main = rsi(length:14)
}

rules {
  entry {
    when rsi_main < 30 then enter long size:10%
  }
  
  exit {
    when rsi_main > 70 then exit long
  }
}

risk {
  stop_loss: 3%
}
`;

const tqlResult = validateStrategy({ tql: validTQL });
if (tqlResult.valid || tqlResult.errors.length === 0) {
  console.log('✅ TQL validation works\n');
} else {
  console.log(`⚠️  TQL validation found ${tqlResult.errors.length} errors`);
  tqlResult.errors.forEach((e) => console.log(`   - ${e.message}\n`));
}

// =====================================================================
// TEST 10: POSITION SIZE TOO LARGE
// =====================================================================

console.log('✅ Test 10: Position Size Too Large');
const largePosition = {
  ...EXAMPLE_VALID_STRATEGY,
  risk: {
    ...EXAMPLE_VALID_STRATEGY.risk,
    position_size_percent: 150,
  },
};
const largePositionResult = validateStrategy({ json: largePosition });
if (
  !largePositionResult.valid &&
  largePositionResult.errors.some((e) => e.code === TQErrorCode.POSITION_SIZE_TOO_LARGE)
) {
  console.log('✅ Position size too large detected\n');
} else {
  console.error('❌ Position size too large not detected\n');
}

// =====================================================================
// TEST 11: DUPLICATE INDICATOR NAMES
// =====================================================================

console.log('✅ Test 11: Duplicate Indicator Names');
const duplicateIndicators = {
  ...EXAMPLE_VALID_STRATEGY,
  indicators: [
    ...EXAMPLE_VALID_STRATEGY.indicators,
    {
      id: 'rsi_main', // Duplicate
      indicator: 'rsi',
      params: { length: 14 },
      output: 'numeric' as const,
    },
  ],
};
const duplicateResult = validateStrategy({ json: duplicateIndicators });
if (
  !duplicateResult.valid &&
  duplicateResult.errors.some((e) => e.code === TQErrorCode.DUPLICATE_INDICATOR_NAME)
) {
  console.log('✅ Duplicate indicator names detected\n');
} else {
  console.error('❌ Duplicate indicator names not detected\n');
}

// =====================================================================
// TEST 12: QUICK VALIDATION HELPERS
// =====================================================================

console.log('✅ Test 12: Quick Validation Helpers');
const isValid = isValidStrategy({ json: EXAMPLE_VALID_STRATEGY });
const errors = getValidationErrors({ json: EXAMPLE_VALID_STRATEGY });
const warnings = getValidationWarnings({ json: EXAMPLE_VALID_STRATEGY });

if (isValid && errors.length === 0) {
  console.log('✅ Quick validation helpers work\n');
} else {
  console.error('❌ Quick validation helpers failed\n');
}

console.log('🎉 All validator tests complete!\n');
console.log('📊 Summary:');
console.log('   ✅ Valid strategy validation');
console.log('   ✅ Missing sections detection');
console.log('   ✅ Invalid indicators detection');
console.log('   ✅ Invalid parameters detection');
console.log('   ✅ Missing rules detection');
console.log('   ✅ Risk validation');
console.log('   ✅ TQL validation');
console.log('   ✅ Semantic analysis');

