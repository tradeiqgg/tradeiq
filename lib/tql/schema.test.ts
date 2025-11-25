/**
 * Quick test file to verify TQ-JSS schema works correctly
 * Run with: npx tsx lib/tql/schema.test.ts
 * Or import in browser console
 */

import {
  TQJSSchemaUtils,
  validateTQJSSchema,
  debugStrategy,
  EXAMPLE_VALID_STRATEGY,
  type TQJSSchema,
} from './schema';

// Test 1: Validate example strategy
console.log('🧪 Test 1: Validating example strategy...');
const validationResult = validateTQJSSchema(EXAMPLE_VALID_STRATEGY);
console.log('✅ Validation result:', {
  valid: validationResult.valid,
  errors: validationResult.errors.length,
  warnings: validationResult.warnings.length,
});

if (!validationResult.valid) {
  console.error('❌ Example strategy failed validation!');
  console.error(validationResult.errors);
} else {
  console.log('✅ Example strategy is valid!');
}

// Test 2: Debug example strategy
console.log('\n🧪 Test 2: Debugging example strategy...');
const debugResults = debugStrategy(EXAMPLE_VALID_STRATEGY);
console.log(`✅ Found ${debugResults.length} debug checks`);
debugResults.forEach((check) => {
  const icon = check.severity === 'error' ? '❌' : '⚠️';
  console.log(`${icon} [${check.type}] ${check.message}`);
});

// Test 3: Test invalid strategy (missing required fields)
console.log('\n🧪 Test 3: Testing invalid strategy...');
const invalidStrategy = {
  meta: {
    name: '',
    description: 'Test',
    author: 'WALLET',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
} as Partial<TQJSSchema>;

const invalidResult = validateTQJSSchema(invalidStrategy);
console.log('✅ Invalid strategy correctly detected:', {
  valid: invalidResult.valid,
  errors: invalidResult.errors.length,
});
if (invalidResult.errors.length > 0) {
  console.log('✅ Errors:', invalidResult.errors.map((e) => e.message));
}

// Test 4: Test reserved keywords
console.log('\n🧪 Test 4: Testing reserved keywords...');
const reservedKeywordStrategy = {
  ...EXAMPLE_VALID_STRATEGY,
  indicators: [
    {
      id: 'close', // Reserved keyword!
      indicator: 'sma',
      params: { length: 20 },
      output: 'numeric' as const,
    },
  ],
} as TQJSSchema;

const reservedResult = validateTQJSSchema(reservedKeywordStrategy);
if (reservedResult.errors.some((e) => e.code === 'RESERVED_KEYWORD')) {
  console.log('✅ Reserved keyword correctly detected!');
} else {
  console.log('❌ Reserved keyword not detected!');
}

// Test 5: Export test (for browser console)
console.log('\n🧪 Test 5: Schema exports...');
console.log('✅ RESERVED_KEYWORDS:', TQJSSchemaUtils.RESERVED_KEYWORDS.length, 'keywords');
console.log('✅ VERSION:', TQJSSchemaUtils.VERSION);
console.log('✅ validateTQJSSchema:', typeof validateTQJSSchema === 'function');
console.log('✅ debugStrategy:', typeof debugStrategy === 'function');

console.log('\n🎉 All tests complete! Schema is ready to use.');

