/**
 * Test file for TQ Indicator Registry
 * Run with: npx tsx lib/tql/indicators.test.ts
 */

import {
  TQIndicatorRegistry,
  TQIndicatorCategories,
  getIndicatorSpec,
  isValidIndicatorId,
  getIndicatorsByCategory,
  getAllIndicatorIds,
  validateIndicatorParams,
  getDefaultParams,
  getIndicatorCount,
  getIndicatorsByCategoryMap,
  type TQIndicatorId,
} from './indicators';

console.log('🧪 Testing TQ Indicator Registry...\n');

// Test 1: Count indicators
console.log('📊 Test 1: Indicator Count');
const count = getIndicatorCount();
console.log(`✅ Total indicators: ${count}`);
if (count < 20) {
  console.warn('⚠️  Expected at least 20 indicators');
} else {
  console.log('✅ Indicator count looks good!\n');
}

// Test 2: Get indicator by ID
console.log('🔍 Test 2: Get Indicator by ID');
const rsiSpec = getIndicatorSpec('rsi');
if (rsiSpec) {
  console.log(`✅ Found RSI: ${rsiSpec.name}`);
  console.log(`   Category: ${rsiSpec.category}`);
  console.log(`   Output: ${rsiSpec.output}`);
  console.log(`   Description: ${rsiSpec.description}`);
  console.log(`   Example: ${rsiSpec.example}`);
} else {
  console.error('❌ RSI indicator not found!\n');
}

// Test 3: Validate indicator ID
console.log('\n✅ Test 3: Validate Indicator IDs');
const validIds = ['rsi', 'sma', 'macd', 'bollinger'];
const invalidIds = ['unknown_indicator', 'fake_rsi'];

validIds.forEach((id) => {
  if (isValidIndicatorId(id)) {
    console.log(`✅ "${id}" is valid`);
  } else {
    console.error(`❌ "${id}" should be valid but isn't`);
  }
});

invalidIds.forEach((id) => {
  if (!isValidIndicatorId(id)) {
    console.log(`✅ "${id}" correctly rejected`);
  } else {
    console.error(`❌ "${id}" should be invalid but was accepted`);
  }
});

// Test 4: Get indicators by category
console.log('\n📁 Test 4: Get Indicators by Category');
const momentumIndicators = getIndicatorsByCategory(TQIndicatorCategories.MOMENTUM);
console.log(`✅ Found ${momentumIndicators.length} momentum indicators:`);
momentumIndicators.forEach((ind) => {
  console.log(`   - ${ind.name} (${Object.keys(ind.params).length} params)`);
});

// Test 5: Validate indicator parameters
console.log('\n✅ Test 5: Validate Indicator Parameters');

// Valid RSI params
const rsiValidation = validateIndicatorParams('rsi', { length: 14 });
console.log('✅ RSI with length=14:', rsiValidation.valid ? 'VALID' : 'INVALID');
if (!rsiValidation.valid) {
  console.error('   Errors:', rsiValidation.errors);
}

// Invalid RSI params (out of range)
const invalidRsi = validateIndicatorParams('rsi', { length: 2000 });
console.log('✅ RSI with length=2000:', invalidRsi.valid ? 'VALID' : 'INVALID (expected)');
if (!invalidRsi.valid && invalidRsi.errors.length > 0) {
  console.log(`   Error: ${invalidRsi.errors[0].message}`);
}

// Missing params (should use defaults)
const defaultRsi = validateIndicatorParams('rsi', {});
console.log('✅ RSI with no params (uses defaults):', defaultRsi.valid ? 'VALID' : 'INVALID');
console.log(`   Normalized params:`, defaultRsi.normalizedParams);

// Test 6: Get default parameters
console.log('\n⚙️  Test 6: Get Default Parameters');
const smaDefaults = getDefaultParams('sma');
console.log('✅ SMA defaults:', smaDefaults);
const expectedSmaDefaults = { length: 14, source: 'close' };
if (JSON.stringify(smaDefaults) === JSON.stringify(expectedSmaDefaults)) {
  console.log('✅ Defaults match expected values');
} else {
  console.error('❌ Defaults do not match!');
}

// Test 7: Get all indicator IDs
console.log('\n📋 Test 7: Get All Indicator IDs');
const allIds = getAllIndicatorIds();
console.log(`✅ Total indicator IDs: ${allIds.length}`);
console.log(`   Sample IDs: ${allIds.slice(0, 5).join(', ')}...`);

// Test 8: Get indicators by category map
console.log('\n🗺️  Test 8: Get Indicators by Category Map');
const categoryMap = getIndicatorsByCategoryMap();
const categories = Object.keys(categoryMap);
console.log(`✅ Found ${categories.length} categories:`);
categories.forEach((cat) => {
  console.log(`   - ${cat}: ${categoryMap[cat].length} indicators`);
});

// Test 9: Test all categories have indicators
console.log('\n📊 Test 9: Category Coverage');
const allCategoryValues = Object.values(TQIndicatorCategories);
allCategoryValues.forEach((cat) => {
  const indicators = getIndicatorsByCategory(cat);
  if (indicators.length > 0) {
    console.log(`✅ ${cat}: ${indicators.length} indicators`);
  } else {
    console.warn(`⚠️  ${cat}: No indicators found`);
  }
});

// Test 10: Validate complex indicator (MACD)
console.log('\n🔬 Test 10: Complex Indicator Validation (MACD)');
const macdSpec = getIndicatorSpec('macd');
if (macdSpec) {
  console.log(`✅ MACD spec found`);
  console.log(`   Output type: ${macdSpec.output}`);
  console.log(`   Parameters: ${Object.keys(macdSpec.params).join(', ')}`);
  
  const macdValidation = validateIndicatorParams('macd', {
    fast: 12,
    slow: 26,
    signal: 9,
  });
  console.log(`   Validation: ${macdValidation.valid ? 'VALID' : 'INVALID'}`);
}

// Test 11: Test band indicators
console.log('\n📊 Test 11: Band Indicators');
const bandIndicators = Object.values(TQIndicatorRegistry).filter(
  (ind) => ind.output === 'band'
);
console.log(`✅ Found ${bandIndicators.length} band indicators:`);
bandIndicators.forEach((ind) => {
  console.log(`   - ${ind.name}`);
});

// Test 12: Test boolean indicators
console.log('\n🔘 Test 12: Boolean Indicators');
const booleanIndicators = Object.values(TQIndicatorRegistry).filter(
  (ind) => ind.output === 'boolean'
);
console.log(`✅ Found ${booleanIndicators.length} boolean indicators:`);
booleanIndicators.forEach((ind) => {
  console.log(`   - ${ind.name}`);
});

// Test 13: Test series indicators
console.log('\n📈 Test 13: Series Indicators');
const seriesIndicators = Object.values(TQIndicatorRegistry).filter(
  (ind) => ind.output === 'series'
);
console.log(`✅ Found ${seriesIndicators.length} series indicators:`);
seriesIndicators.forEach((ind) => {
  console.log(`   - ${ind.name}`);
});

console.log('\n🎉 All indicator registry tests complete!');
console.log(`\n📊 Summary:`);
console.log(`   - Total indicators: ${getIndicatorCount()}`);
console.log(`   - Categories: ${Object.keys(getIndicatorsByCategoryMap()).length}`);
console.log(`   - Price indicators: ${getIndicatorsByCategory(TQIndicatorCategories.PRICE).length}`);
console.log(`   - Moving averages: ${getIndicatorsByCategory(TQIndicatorCategories.MA).length}`);
console.log(`   - Momentum indicators: ${getIndicatorsByCategory(TQIndicatorCategories.MOMENTUM).length}`);
console.log(`   - Volatility indicators: ${getIndicatorsByCategory(TQIndicatorCategories.VOLATILITY).length}`);
console.log(`   - Volume indicators: ${getIndicatorsByCategory(TQIndicatorCategories.VOLUME).length}`);
console.log(`   - Trend indicators: ${getIndicatorsByCategory(TQIndicatorCategories.TREND).length}`);
console.log(`   - Pattern indicators: ${getIndicatorsByCategory(TQIndicatorCategories.PATTERN).length}`);
console.log(`   - Sentiment indicators: ${getIndicatorsByCategory(TQIndicatorCategories.SENTIMENT).length}`);

