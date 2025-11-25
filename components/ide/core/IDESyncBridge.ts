// =====================================================================
// CHAPTER 6: IDE Synchronization Bridge
// =====================================================================

import { compileTQLToJSON, compileJSONToTQL } from '@/lib/tql/compiler';
import { TQLLexer } from '@/lib/tql/lexer';
import { TQLParser } from '@/lib/tql/parser';
import { blockToJSON } from '@/lib/tql/blocks';
import { tqlASTToBlocks } from '@/lib/tql/tqlToBlocks';
import type { TQJSSchema } from '@/lib/tql';
import { useIDEEngine } from './IDEEngine';

/**
 * Synchronize from TQL to JSON and Blocks
 */
export function syncFromTQL(tqlText: string): {
  json: Partial<TQJSSchema> | null;
  blocks: any | null;
  errors: string[];
} {
  const errors: string[] = [];
  let json: Partial<TQJSSchema> | null = null;
  let blocks: any | null = null;

  try {
    // Parse TQL
    const lexer = new TQLLexer(tqlText);
    const tokens = lexer.tokenize();

    if (tokens.errors.length > 0) {
      errors.push(...tokens.errors.map((e) => e.message));
      return { json: null, blocks: null, errors };
    }

    const parser = new TQLParser(tokens.tokens);
    const ast = parser.parse();

    if (!ast.ast) {
      errors.push(...ast.errors.map((e) => e.message));
      return { json: null, blocks: null, errors };
    }

    // Compile to JSON
    const compileResult = compileTQLToJSON(ast.ast);
    if (compileResult.json) {
      json = compileResult.json;
      // Convert AST to blocks with auto-layout
      try {
        const blockResult = tqlASTToBlocks(ast.ast);
        blocks = {
          blocks: blockResult.blocks,
          connections: blockResult.connections,
        };
      } catch (blockError: any) {
        console.warn('Failed to generate blocks from TQL:', blockError);
        // Don't fail the whole sync if block generation fails
      }
    } else {
      errors.push(...compileResult.errors.map((e) => e.message));
    }
  } catch (error: any) {
    errors.push(error.message);
  }

  return { json, blocks, errors };
}

/**
 * Synchronize from JSON to TQL and Blocks
 */
export function syncFromJSON(json: Partial<TQJSSchema>): {
  tql: string | null;
  blocks: any | null;
  errors: string[];
} {
  const errors: string[] = [];
  let tql: string | null = null;
  let blocks: any | null = null;

  try {
    // Convert JSON to TQL
    tql = compileJSONToTQL(json as TQJSSchema);

    // Convert JSON to TQL AST, then to blocks
    try {
      const lexer = new TQLLexer(tql);
      const tokens = lexer.tokenize();
      if (tokens.errors.length === 0) {
        const parser = new TQLParser(tokens.tokens);
        const ast = parser.parse();
        if (ast.ast) {
          const blockResult = tqlASTToBlocks(ast.ast);
          blocks = {
            blocks: blockResult.blocks,
            connections: blockResult.connections,
          };
        }
      }
    } catch (blockError: any) {
      console.warn('Failed to generate blocks from JSON:', blockError);
      // Don't fail the whole sync if block generation fails
    }
  } catch (error: any) {
    errors.push(error.message);
  }

  return { tql, blocks, errors };
}

/**
 * Synchronize from Blocks to JSON and TQL
 */
export function syncFromBlocks(blockTree: any): {
  json: Partial<TQJSSchema> | null;
  tql: string | null;
  errors: string[];
} {
  const errors: string[] = [];
  let json: Partial<TQJSSchema> | null = null;
  let tql: string | null = null;

  try {
    // Convert blocks to JSON
    json = blocksToJSON(blockTree);

    // Convert JSON to TQL
    if (json) {
      tql = compileJSONToTQL(json as TQJSSchema);
    }
  } catch (error: any) {
    errors.push(error.message);
  }

  return { json, tql, errors };
}

/**
 * Convert block tree to TQ-JSS JSON schema
 */
function blocksToJSON(blockTree: { blocks: any[]; connections: any[] }): Partial<TQJSSchema> {
  const { blocks, connections } = blockTree;
  
  // Initialize schema structure
  const schema: Partial<TQJSSchema> = {
    meta: {
      name: 'Block Strategy',
      description: 'Strategy created with blocks',
      author: '',
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
    indicators: [],
    rules: {
      entry: [],
      exit: [],
      filters: [],
    },
    risk: {
      position_size_percent: 10,
      max_risk_per_trade_percent: 2,
      stop_loss_percent: null,
      take_profit_percent: null,
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

  // Group blocks by type
  const indicatorBlocks = blocks.filter(b => b.blockId === 'indicator_generic');
  const conditionBlocks = blocks.filter(b => b.blockId === 'logic_compare' || b.blockId === 'logic_cross');
  const entryBlocks = blocks.filter(b => b.blockId === 'entry_market');
  const exitBlocks = blocks.filter(b => b.blockId === 'exit_position');

  // Convert indicator blocks
  for (const block of indicatorBlocks) {
    const indicatorId = block.inputs.indicator_id || 'sma';
    const params = block.inputs.params || { period: 14 };
    
    schema.indicators!.push({
      id: block.id,
      indicator: indicatorId,
      params,
      output: 'numeric',
    });
  }

  // Convert condition blocks to rules
  for (const condBlock of conditionBlocks) {
    const left = condBlock.inputs.left || { source_type: 'price', field: 'close' };
    const operator = condBlock.inputs.operator || 'gt';
    const right = condBlock.inputs.right || { source_type: 'value', value: 0 };

    const condition = {
      type: 'condition' as const,
      left,
      operator,
      right,
    };

    // Find connected entry or exit action
    const connectedTo = connections.find(c => c.fromBlockId === condBlock.id);
    if (connectedTo) {
      const actionBlock = blocks.find(b => b.id === connectedTo.toBlockId);
      
      if (actionBlock?.blockId === 'entry_market') {
        schema.rules!.entry.push({
          conditions: [condition],
          action: {
            type: 'enter_position',
            direction: actionBlock.inputs.direction || 'long',
            size_mode: actionBlock.inputs.size_mode || 'percent',
            size: actionBlock.inputs.size || 10,
          },
        });
      } else if (actionBlock?.blockId === 'exit_position') {
        schema.rules!.exit.push({
          conditions: [condition],
          action: {
            type: 'exit_position',
            direction: actionBlock.inputs.direction || 'any',
          },
        });
      }
    }
  }

  return schema;
}

/**
 * Auto-sync when mode changes or content updates
 */
export function autoSync(mode: 'tql' | 'json' | 'blocks'): void {
  const engine = useIDEEngine.getState();

  if (mode === 'tql' && engine.tqlText) {
    const result = syncFromTQL(engine.tqlText);
    if (result.json) {
      engine.compiledJSON = result.json;
      engine.jsonText = JSON.stringify(result.json, null, 2);
    }
    if (result.blocks) {
      engine.blockTree = result.blocks;
    }
  } else if (mode === 'json' && engine.jsonText) {
    try {
      const json = JSON.parse(engine.jsonText);
      const result = syncFromJSON(json);
      if (result.tql) {
        engine.tqlText = result.tql;
      }
      if (result.blocks) {
        engine.blockTree = result.blocks;
      }
    } catch (e) {
      // Invalid JSON, skip sync
    }
  } else if (mode === 'blocks' && engine.blockTree) {
    const result = syncFromBlocks(engine.blockTree);
    if (result.json) {
      engine.compiledJSON = result.json;
      engine.jsonText = JSON.stringify(result.json, null, 2);
    }
    if (result.tql) {
      engine.tqlText = result.tql;
    }
  }
}

