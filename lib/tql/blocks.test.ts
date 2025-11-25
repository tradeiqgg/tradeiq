/**
 * Test file for TQ Block Registry
 * Run with: npx tsx lib/tql/blocks.test.ts
 */

import {
  TQBlockRegistry,
  TQBlockColors,
  getBlockSpec,
  isValidBlockId,
  getBlocksByCategory,
  getAllBlockIds,
  validateBlockInstance,
  blockToJSON,
  blockToTQL,
  getAllowedChildren,
  canAttachChild,
  getBlocksByCategoryMap,
  getBlockCount,
  type TQBlockCategory,
} from './blocks';

console.log('🧪 Testing TQ Block Registry...\n');

// Test 1: Count blocks
console.log('📊 Test 1: Block Count');
const count = getBlockCount();
console.log(`✅ Total blocks: ${count}`);
if (count < 5) {
  console.warn('⚠️  Expected at least 5 blocks');
} else {
  console.log('✅ Block count looks good!\n');
}

// Test 2: Get block by ID
console.log('🔍 Test 2: Get Block by ID');
const compareBlock = getBlockSpec('logic_compare');
if (compareBlock) {
  console.log(`✅ Found Compare block: ${compareBlock.label}`);
  console.log(`   Category: ${compareBlock.category}`);
  console.log(`   Color: ${compareBlock.color}`);
  console.log(`   Description: ${compareBlock.description}`);
  console.log(`   Inputs: ${compareBlock.inputs.length}`);
  console.log(`   Has output: ${!!compareBlock.output}`);
} else {
  console.error('❌ Compare block not found!\n');
}

// Test 3: Validate block ID
console.log('\n✅ Test 3: Validate Block IDs');
const validIds = ['logic_compare', 'value_number', 'entry_market', 'exit_position'];
const invalidIds = ['unknown_block', 'fake_compare'];

validIds.forEach((id) => {
  if (isValidBlockId(id)) {
    console.log(`✅ "${id}" is valid`);
  } else {
    console.error(`❌ "${id}" should be valid but isn't`);
  }
});

invalidIds.forEach((id) => {
  if (!isValidBlockId(id)) {
    console.log(`✅ "${id}" correctly rejected`);
  } else {
    console.error(`❌ "${id}" should be invalid but was accepted`);
  }
});

// Test 4: Get blocks by category
console.log('\n📁 Test 4: Get Blocks by Category');
const logicBlocks = getBlocksByCategory('logic');
console.log(`✅ Found ${logicBlocks.length} logic blocks:`);
logicBlocks.forEach((block) => {
  console.log(`   - ${block.label} (${block.inputs.length} inputs)`);
});

// Test 5: Validate block instances
console.log('\n✅ Test 5: Validate Block Instances');

// Valid value_number block
const validNumber = validateBlockInstance('value_number', { value: 42 });
console.log('✅ value_number with value=42:', validNumber.valid ? 'VALID' : 'INVALID');
if (!validNumber.valid) {
  console.error('   Errors:', validNumber.errors);
}

// Invalid value_number block (missing required input)
const invalidNumber = validateBlockInstance('value_number', {});
console.log('✅ value_number with no value:', invalidNumber.valid ? 'VALID' : 'INVALID (expected)');
if (!invalidNumber.valid && invalidNumber.errors.length > 0) {
  console.log(`   Error: ${invalidNumber.errors[0].message}`);
}

// Valid logic_compare block
const validCompare = validateBlockInstance('logic_compare', {
  left: { source_type: 'indicator', id: 'rsi' },
  operator: 'lt',
  right: { source_type: 'value', value: 30 },
});
console.log('✅ logic_compare block:', validCompare.valid ? 'VALID' : 'INVALID');
if (!validCompare.valid) {
  console.error('   Errors:', validCompare.errors);
}

// Test 6: Block to JSON conversion
console.log('\n🔄 Test 6: Block to JSON Conversion');
const numberJSON = blockToJSON('value_number', { value: 42 });
console.log('✅ value_number to JSON:', JSON.stringify(numberJSON));

const entryJSON = blockToJSON('entry_market', {
  direction: 'long',
  size_mode: 'percent',
  size: 10,
});
console.log('✅ entry_market to JSON:', JSON.stringify(entryJSON));

// Test 7: Block to TQL conversion
console.log('\n📝 Test 7: Block to TQL Conversion');
const numberTQL = blockToTQL('value_number', { value: 42 });
console.log('✅ value_number to TQL:', numberTQL);

const entryTQL = blockToTQL('entry_market', {
  direction: 'long',
  size_mode: 'percent',
  size: 10,
});
console.log('✅ entry_market to TQL:', entryTQL);

// Test 8: Allowed children
console.log('\n🔗 Test 8: Allowed Children');
const ruleGroupChildren = getAllowedChildren('rule_group');
console.log('✅ rule_group allowed children:', ruleGroupChildren.join(', '));

const canAttach = canAttachChild('rule_group', 'logic_compare');
console.log('✅ Can attach logic_compare to rule_group:', canAttach);

// Test 9: Get blocks by category map
console.log('\n🗺️  Test 9: Get Blocks by Category Map');
const categoryMap = getBlocksByCategoryMap();
const categories = Object.keys(categoryMap);
console.log(`✅ Found ${categories.length} categories:`);
categories.forEach((cat) => {
  console.log(`   - ${cat}: ${categoryMap[cat as TQBlockCategory].length} blocks`);
});

// Test 10: Test all categories have blocks
console.log('\n📊 Test 10: Category Coverage');
const allCategories: TQBlockCategory[] = [
  'indicator',
  'value',
  'logic',
  'math',
  'rule',
  'entry',
  'exit',
  'filter',
  'risk',
  'meta',
];

allCategories.forEach((cat) => {
  const blocks = getBlocksByCategory(cat);
  if (blocks.length > 0) {
    console.log(`✅ ${cat}: ${blocks.length} blocks`);
  } else {
    console.warn(`⚠️  ${cat}: No blocks found`);
  }
});

// Test 11: Test indicator block integration
console.log('\n🔗 Test 11: Indicator Block Integration');
const indicatorBlock = getBlockSpec('indicator_generic');
if (indicatorBlock) {
  console.log('✅ Indicator block found');
  console.log(`   Label: ${indicatorBlock.label}`);
  console.log(`   Info: ${indicatorBlock.info.substring(0, 50)}...`);

  // Test validation with valid indicator
  const validIndicator = validateBlockInstance('indicator_generic', {
    indicator_id: 'rsi',
    params: { length: 14 },
  });
  console.log(`   Validation with RSI: ${validIndicator.valid ? 'VALID' : 'INVALID'}`);

  // Test validation with invalid indicator
  const invalidIndicator = validateBlockInstance('indicator_generic', {
    indicator_id: 'unknown_indicator',
    params: {},
  });
  console.log(`   Validation with unknown indicator: ${invalidIndicator.valid ? 'VALID' : 'INVALID (expected)'}`);
  if (!invalidIndicator.valid) {
    console.log(`   Error: ${invalidIndicator.errors[0].message}`);
  }
}

// Test 12: Test block colors
console.log('\n🎨 Test 12: Block Colors');
console.log('✅ Block category colors:');
Object.entries(TQBlockColors).forEach(([category, color]) => {
  console.log(`   - ${category}: ${color}`);
});

// Test 13: Test complete block chain
console.log('\n🔗 Test 13: Complete Block Chain');
const ruleGroup = getBlockSpec('rule_group');
if (ruleGroup) {
  console.log('✅ Rule group block found');
  console.log(`   Allowed children: ${ruleGroup.allowedChildren?.join(', ') || 'none'}`);

  // Simulate a complete rule with conditions and actions
  const conditions = [
    blockToJSON('logic_compare', {
      left: { source_type: 'indicator', id: 'rsi' },
      operator: 'lt',
      right: { source_type: 'value', value: 30 },
    }),
  ];

  const actions = [
    blockToJSON('entry_market', {
      direction: 'long',
      size_mode: 'percent',
      size: 10,
    }),
  ];

  const ruleJSON = blockToJSON('rule_group', {
    conditions: conditions.filter(Boolean),
    actions: actions.filter(Boolean),
  });

  console.log('✅ Complete rule JSON:', JSON.stringify(ruleJSON, null, 2));
}

console.log('\n🎉 All block registry tests complete!');
console.log(`\n📊 Summary:`);
console.log(`   - Total blocks: ${getBlockCount()}`);
console.log(`   - Categories: ${Object.keys(getBlocksByCategoryMap()).length}`);
console.log(`   - Indicator blocks: ${getBlocksByCategory('indicator').length}`);
console.log(`   - Value blocks: ${getBlocksByCategory('value').length}`);
console.log(`   - Logic blocks: ${getBlocksByCategory('logic').length}`);
console.log(`   - Rule blocks: ${getBlocksByCategory('rule').length}`);
console.log(`   - Entry blocks: ${getBlocksByCategory('entry').length}`);
console.log(`   - Exit blocks: ${getBlocksByCategory('exit').length}`);

