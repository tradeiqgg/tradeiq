// =====================================================================
// TQL to Blocks Converter - Auto-generate visual blocks from TQL
// =====================================================================

import type { ProgramNode, IndicatorDefNode, EntryRuleNode, ExitRuleNode, ConditionNode, ComparisonNode, CrossNode, ValueNode, EntryActionNode, ExitActionNode } from './parser';
import type { BlockInstance, Connection } from '@/components/ide/BlockEditor';
import { TQBlockRegistry, getBlockSpec } from './blocks';
import { getIndicatorSpec } from './indicators';

interface BlockLayout {
  x: number;
  y: number;
}

/**
 * Convert TQL AST to visual blocks with auto-layout
 */
export function tqlASTToBlocks(ast: ProgramNode): {
  blocks: BlockInstance[];
  connections: Connection[];
} {
  const blocks: BlockInstance[] = [];
  const connections: Connection[] = [];
  const blockIdMap = new Map<string, string>(); // Maps TQL identifiers to block IDs
  
  let yOffset = 50;
  const blockSpacing = 200;
  const rowSpacing = 150;
  
  // Layout configuration
  const layout = {
    indicators: { x: 50, y: yOffset },
    entryRules: { x: 50, y: 0 },
    exitRules: { x: 50, y: 0 },
    risk: { x: 50, y: 0 },
  };
  
  // Track current Y position for each section
  let currentY = yOffset;
  
  // 1. Create indicator blocks
  for (const indicatorDef of ast.indicators.indicators) {
    const indicatorId = indicatorDef.call.indicatorId;
    const params = indicatorDef.call.params;
    
    // Use specific indicator block if available, otherwise use generic
    const blockId = `indicator_${indicatorId}`;
    const blockSpec = getBlockSpec(blockId) || getBlockSpec('indicator_generic');
    
    if (blockSpec) {
      const block: BlockInstance = {
        id: `block-${Date.now()}-${blocks.length}`,
        blockId: blockSpec.id === 'indicator_generic' ? blockId : blockSpec.id,
        label: indicatorDef.id || indicatorId,
        x: layout.indicators.x,
        y: currentY,
        inputs: {
          indicator_id: indicatorId,
          params: Object.fromEntries(
            Object.entries(params).map(([key, valueNode]) => [key, valueNode.value])
          ),
        },
      };
      
      blocks.push(block);
      blockIdMap.set(indicatorDef.id, block.id);
      currentY += rowSpacing;
    }
  }
  
  // Update entry rules Y position
  layout.entryRules.y = currentY + 100;
  currentY = layout.entryRules.y;
  
  // 2. Create entry rule blocks
  for (let i = 0; i < ast.rules.entry.length; i++) {
    const entryRule = ast.rules.entry[i];
    const conditionBlocks = createConditionBlocks(
      entryRule.condition,
      layout.entryRules.x,
      currentY,
      blockIdMap
    );
    
    blocks.push(...conditionBlocks.blocks);
    connections.push(...conditionBlocks.connections);
    
    // Create entry action block
    const entryAction = entryRule.action;
    const entryBlock: BlockInstance = {
      id: `block-entry-${Date.now()}-${i}`,
      blockId: 'entry_market',
      label: `Enter ${entryAction.direction}`,
      x: layout.entryRules.x + blockSpacing * 2,
      y: currentY,
      inputs: {
        direction: entryAction.direction,
        size_mode: entryAction.sizeMode || 'percent',
        size: entryAction.size || 10,
      },
    };
    
    blocks.push(entryBlock);
    
    // Connect condition to entry action
    if (conditionBlocks.outputBlockId) {
      connections.push({
        id: `conn-entry-${Date.now()}-${i}`,
        fromBlockId: conditionBlocks.outputBlockId,
        fromPort: 'output',
        toBlockId: entryBlock.id,
        toPort: 'conditions',
      });
    }
    
    currentY += rowSpacing;
  }
  
  // Update exit rules Y position
  layout.exitRules.y = currentY + 100;
  currentY = layout.exitRules.y;
  
  // 3. Create exit rule blocks
  for (let i = 0; i < ast.rules.exit.length; i++) {
    const exitRule = ast.rules.exit[i];
    const conditionBlocks = createConditionBlocks(
      exitRule.condition,
      layout.exitRules.x,
      currentY,
      blockIdMap
    );
    
    blocks.push(...conditionBlocks.blocks);
    connections.push(...conditionBlocks.connections);
    
    // Create exit action block
    const exitAction = exitRule.action;
    const exitBlock: BlockInstance = {
      id: `block-exit-${Date.now()}-${i}`,
      blockId: 'exit_position',
      label: `Exit ${exitAction.direction}`,
      x: layout.exitRules.x + blockSpacing * 2,
      y: currentY,
      inputs: {
        direction: exitAction.direction,
      },
    };
    
    blocks.push(exitBlock);
    
    // Connect condition to exit action
    if (conditionBlocks.outputBlockId) {
      connections.push({
        id: `conn-exit-${Date.now()}-${i}`,
        fromBlockId: conditionBlocks.outputBlockId,
        fromPort: 'output',
        toBlockId: exitBlock.id,
        toPort: 'conditions',
      });
    }
    
    currentY += rowSpacing;
  }
  
  return { blocks, connections };
}

/**
 * Create condition blocks from a condition node
 */
function createConditionBlocks(
  conditionNode: ConditionNode,
  startX: number,
  startY: number,
  blockIdMap: Map<string, string>
): {
  blocks: BlockInstance[];
  connections: Connection[];
  outputBlockId: string | null;
} {
  const blocks: BlockInstance[] = [];
  const connections: Connection[] = [];
  const blockSpacing = 200;
  
  const cond = conditionNode.condition;
  let xPos = startX;
  let outputBlockId: string | null = null;
  
  if (cond.type === 'Comparison') {
    const comparison = cond as ComparisonNode;
    
    // Create left value block
    const leftBlock = createValueBlock(comparison.left, xPos, startY, blockIdMap);
    blocks.push(leftBlock);
    xPos += blockSpacing;
    
    // Create comparison block
    const compareBlock: BlockInstance = {
      id: `block-compare-${Date.now()}-${blocks.length}`,
      blockId: 'logic_compare',
      label: `Compare (${comparison.operator})`,
      x: xPos,
      y: startY,
      inputs: {
        left: getValueReference(comparison.left, blockIdMap),
        operator: comparison.operator,
        right: getValueReference(comparison.right, blockIdMap),
      },
    };
    blocks.push(compareBlock);
    outputBlockId = compareBlock.id;
    xPos += blockSpacing;
    
    // Create right value block
    const rightBlock = createValueBlock(comparison.right, xPos, startY, blockIdMap);
    blocks.push(rightBlock);
    
    // Connect left and right to comparison block
    connections.push({
      id: `conn-left-${Date.now()}`,
      fromBlockId: leftBlock.id,
      fromPort: 'output',
      toBlockId: compareBlock.id,
      toPort: 'left',
    });
    
    connections.push({
      id: `conn-right-${Date.now()}`,
      fromBlockId: rightBlock.id,
      fromPort: 'output',
      toBlockId: compareBlock.id,
      toPort: 'right',
    });
    
  } else if (cond.type === 'Cross') {
    const cross = cond as CrossNode;
    
    // Create left value block
    const leftBlock = createValueBlock(cross.left, xPos, startY, blockIdMap);
    blocks.push(leftBlock);
    xPos += blockSpacing;
    
    // Create cross block
    const crossBlock: BlockInstance = {
      id: `block-cross-${Date.now()}-${blocks.length}`,
      blockId: 'logic_cross',
      label: `Crosses ${cross.direction}`,
      x: xPos,
      y: startY,
      inputs: {
        left: getValueReference(cross.left, blockIdMap),
        direction: cross.direction,
        right: getValueReference(cross.right, blockIdMap),
      },
    };
    blocks.push(crossBlock);
    outputBlockId = crossBlock.id;
    xPos += blockSpacing;
    
    // Create right value block
    const rightBlock = createValueBlock(cross.right, xPos, startY, blockIdMap);
    blocks.push(rightBlock);
    
    // Connect left and right to cross block
    connections.push({
      id: `conn-cross-left-${Date.now()}`,
      fromBlockId: leftBlock.id,
      fromPort: 'output',
      toBlockId: crossBlock.id,
      toPort: 'left',
    });
    
    connections.push({
      id: `conn-cross-right-${Date.now()}`,
      fromBlockId: rightBlock.id,
      fromPort: 'output',
      toBlockId: crossBlock.id,
      toPort: 'right',
    });
  }
  
  return { blocks, connections, outputBlockId };
}

/**
 * Create a value block from a value node
 */
function createValueBlock(
  valueNode: ValueNode,
  x: number,
  y: number,
  blockIdMap: Map<string, string>
): BlockInstance {
  if (valueNode.valueType === 'indicator') {
    // Reference to an indicator
    const indicatorRef = valueNode.value as any;
    const indicatorId = indicatorRef.indicator;
    const blockId = `indicator_${indicatorId}`;
    const blockSpec = getBlockSpec(blockId) || getBlockSpec('indicator_generic');
    
    return {
      id: `block-value-${Date.now()}-${Math.random()}`,
      blockId: blockSpec?.id || 'indicator_generic',
      label: indicatorId,
      x,
      y,
      inputs: {
        indicator_id: indicatorId,
        params: indicatorRef.params || {},
      },
    };
  } else if (valueNode.valueType === 'identifier') {
    // Check if it's a price field or indicator reference
    const priceFields = ['open', 'high', 'low', 'close', 'volume'];
    if (priceFields.includes(valueNode.value as string)) {
      const priceBlockSpec = getBlockSpec('value_price');
      return {
        id: `block-value-${Date.now()}-${Math.random()}`,
        blockId: priceBlockSpec ? 'value_price' : 'value_string',
        label: valueNode.value as string,
        x,
        y,
        inputs: {
          field: valueNode.value,
        },
      };
    } else {
      // Indicator reference - try to find the referenced indicator block
      const referencedBlockId = blockIdMap.get(valueNode.value as string);
      if (referencedBlockId) {
        const refBlockSpec = getBlockSpec('value_reference');
        return {
          id: `block-ref-${Date.now()}-${Math.random()}`,
          blockId: refBlockSpec ? 'value_reference' : 'value_string',
          label: valueNode.value as string,
          x,
          y,
          inputs: {
            reference_id: referencedBlockId,
            value: valueNode.value, // Fallback
          },
        };
      } else {
        // Unknown identifier - treat as string
        return {
          id: `block-value-${Date.now()}-${Math.random()}`,
          blockId: 'value_string',
          label: valueNode.value as string,
          x,
          y,
          inputs: {
            value: valueNode.value,
          },
        };
      }
    }
  }
  
  // Default: create a number/boolean/string value block
  const valueType = typeof valueNode.value === 'number' ? 'number' : 
                    typeof valueNode.value === 'boolean' ? 'boolean' : 'string';
  
  const blockId = `value_${valueType}`;
  const blockSpec = getBlockSpec(blockId);
  
  return {
    id: `block-value-${Date.now()}-${Math.random()}`,
    blockId: blockSpec ? blockId : 'value_string',
    label: String(valueNode.value),
    x,
    y,
    inputs: {
      value: valueNode.value,
    },
  };
}

/**
 * Get value reference for connection
 */
function getValueReference(valueNode: ValueNode, blockIdMap: Map<string, string>): any {
  if (valueNode.valueType === 'indicator') {
    return { source_type: 'indicator', id: (valueNode.value as any).indicator };
  } else if (valueNode.valueType === 'identifier') {
    const priceFields = ['open', 'high', 'low', 'close', 'volume'];
    if (priceFields.includes(valueNode.value as string)) {
      return { source_type: 'price', field: valueNode.value };
    } else {
      return { source_type: 'indicator', id: valueNode.value };
    }
  } else {
    return { source_type: 'value', value: valueNode.value };
  }
}

