// =====================================================================
// CHAPTER 4: TQL COMPILER
// TradeIQ Query Language Compiler (TQL ↔ JSON ↔ Blocks)
// =====================================================================

import type {
  TQJSSchema,
  Indicator,
  Condition,
  Rule,
  EnterPositionAction,
  ExitPositionAction,
  Risk,
  SourceReference,
} from './schema';
import { getIndicatorSpec } from './indicators';
import type {
  ProgramNode,
  MetaNode,
  SettingsNode,
  IndicatorsNode,
  IndicatorDefNode,
  RulesNode,
  EntryRuleNode,
  ExitRuleNode,
  ConditionNode,
  ComparisonNode,
  CrossNode,
  ValueNode,
  EntryActionNode,
  ExitActionNode,
  RiskNode,
} from './parser';

export interface CompileError {
  type: 'syntax' | 'semantic' | 'validation';
  message: string;
  line: number;
  column: number;
  suggestion?: string;
}

// =====================================================================
// TQL → JSON COMPILER
// =====================================================================

export function compileTQLToJSON(ast: ProgramNode): {
  json: TQJSSchema | null;
  errors: CompileError[];
} {
  const errors: CompileError[] = [];
  const now = new Date().toISOString();

  try {
    // Compile meta
    const meta = {
      name: ast.meta.name || 'Untitled Strategy',
      description: ast.meta.description || '',
      author: ast.meta.author || '',
      created_at: now,
      updated_at: now,
    };

    // Compile settings
    const settings = {
      symbol: ast.settings.symbol || 'BTCUSDT',
      timeframe: ast.settings.timeframe || '1h',
      initial_balance: ast.settings.initial_balance || 1000,
      position_mode: (ast.settings.position_mode as any) || 'long_only',
      max_open_positions: ast.settings.max_open_positions || 1,
      allow_reentry: ast.settings.allow_reentry ?? true,
      execution_mode: (ast.settings.execution_mode as any) || 'candle_close',
    };

    // Compile indicators
    const indicators: Indicator[] = [];
    for (const indicatorDef of ast.indicators.indicators) {
      const indicatorSpec = getIndicatorSpec(indicatorDef.call.indicatorId);
      if (!indicatorSpec) {
        errors.push({
          type: 'semantic',
          message: `Unknown indicator: ${indicatorDef.call.indicatorId}`,
          line: indicatorDef.call.line || 1,
          column: indicatorDef.call.column || 1,
          suggestion: `Check if the indicator exists in the registry`,
        });
        continue;
      }

      // Convert params
      const params: Record<string, any> = {};
      for (const [paramName, paramValue] of Object.entries(indicatorDef.call.params)) {
        params[paramName] = paramValue.value;
      }

      indicators.push({
        id: indicatorDef.id,
        indicator: indicatorDef.call.indicatorId,
        params,
        output: indicatorSpec.output,
      });
    }

    // Compile rules
    const entryRules: Rule[] = [];
    for (const entryRule of ast.rules.entry) {
      const condition = compileCondition(entryRule.condition, errors);
      if (condition) {
        entryRules.push({
          conditions: [condition],
          action: compileEntryAction(entryRule.action),
        });
      }
    }

    const exitRules: Rule[] = [];
    for (const exitRule of ast.rules.exit) {
      const condition = compileCondition(exitRule.condition, errors);
      if (condition) {
        exitRules.push({
          conditions: [condition],
          action: compileExitAction(exitRule.action),
        });
      }
    }

    const filterRules: Rule[] = [];
    for (const filterCondition of ast.rules.filters) {
      const condition = compileCondition(filterCondition, errors);
      if (condition) {
        filterRules.push({
          conditions: [condition],
          action: compileExitAction({ type: 'ExitAction', direction: 'any', start: 0, end: 0 }),
        });
      }
    }

    // Compile risk
    const risk: Risk = {
      position_size_percent: ast.risk.position_size || 10,
      max_risk_per_trade_percent: ast.risk.max_risk_per_trade || 2,
      stop_loss_percent: ast.risk.stop_loss || null,
      take_profit_percent: ast.risk.take_profit || null,
      trailing_stop_percent: ast.risk.trailing_stop || null,
      max_daily_loss_percent: ast.risk.max_daily_loss || 10,
      max_daily_trades: ast.risk.max_daily_trades || 15,
    };

    const json: TQJSSchema = {
      meta,
      settings,
      indicators,
      rules: {
        entry: entryRules,
        exit: exitRules,
        filters: filterRules,
      },
      risk,
      runtime: {
        logs: [],
        last_signals: [],
        state: {},
      },
      version: '1.0',
    };

    return { json, errors };
  } catch (error: any) {
    errors.push({
      type: 'semantic',
      message: error.message || 'Compilation error',
      line: 1,
      column: 1,
    });
    return { json: null, errors };
  }
}

function compileCondition(
  conditionNode: ConditionNode,
  errors: CompileError[]
): Condition | null {
  const cond = conditionNode.condition;

  if (cond.type === 'Comparison') {
    const comparison = cond as ComparisonNode;
    return {
      type: 'condition',
      left: compileValueReference(comparison.left),
      operator: comparison.operator as any,
      right: compileValueReference(comparison.right),
    };
  } else if (cond.type === 'Cross') {
    const cross = cond as CrossNode;
    return {
      type: 'condition',
      left: compileValueReference(cross.left),
      operator: cross.direction as any,
      right: compileValueReference(cross.right),
    };
  }

  return null;
}

function compileValueReference(valueNode: ValueNode): SourceReference {
  if (valueNode.valueType === 'identifier') {
    // Check if it's a price field
    const priceFields = ['open', 'high', 'low', 'close', 'volume'];
    if (priceFields.includes(valueNode.value as string)) {
      return {
        source_type: 'price',
        field: valueNode.value as any,
      };
    }
    // Otherwise it's an indicator reference
    return {
      source_type: 'indicator',
      id: valueNode.value as string,
    };
  } else if (valueNode.valueType === 'number' || valueNode.valueType === 'boolean' || valueNode.valueType === 'string') {
    return {
      source_type: 'value',
      value: valueNode.value,
    };
  } else if (valueNode.valueType === 'indicator') {
    // Inline indicator call - this would need special handling
    return {
      source_type: 'indicator',
      id: (valueNode.value as any).indicator,
    };
  }

  return {
    source_type: 'value',
    value: valueNode.value,
  };
}

function compileEntryAction(actionNode: EntryActionNode): EnterPositionAction {
  return {
    type: 'enter_position',
    direction: actionNode.direction,
    size_mode: actionNode.sizeMode || 'percent',
    size: actionNode.size || 10,
  };
}

function compileExitAction(actionNode: ExitActionNode): ExitPositionAction {
  return {
    type: 'exit_position',
    direction: actionNode.direction,
  };
}

// =====================================================================
// JSON → TQL COMPILER
// =====================================================================

export function compileJSONToTQL(json: TQJSSchema): string {
  const lines: string[] = [];

  // Meta section
  lines.push('meta {');
  if (json.meta.name) lines.push(`  name: "${json.meta.name}"`);
  if (json.meta.description) lines.push(`  description: "${json.meta.description}"`);
  if (json.meta.author) lines.push(`  author: "${json.meta.author}"`);
  lines.push('}');
  lines.push('');

  // Settings section
  lines.push('settings {');
  lines.push(`  symbol: ${json.settings.symbol}`);
  lines.push(`  timeframe: ${json.settings.timeframe}`);
  if (json.settings.initial_balance) lines.push(`  initial_balance: ${json.settings.initial_balance}`);
  if (json.settings.position_mode) lines.push(`  position_mode: ${json.settings.position_mode}`);
  if (json.settings.allow_reentry !== undefined) lines.push(`  allow_reentry: ${json.settings.allow_reentry}`);
  if (json.settings.max_open_positions) lines.push(`  max_open_positions: ${json.settings.max_open_positions}`);
  lines.push('}');
  lines.push('');

  // Indicators section
  lines.push('indicators {');
  for (const indicator of json.indicators) {
    const params: string[] = [];
    for (const [key, value] of Object.entries(indicator.params)) {
      if (typeof value === 'string') {
        params.push(`${key}: ${value}`);
      } else {
        params.push(`${key}: ${value}`);
      }
    }
    lines.push(`  ${indicator.id} = ${indicator.indicator}(${params.join(', ')})`);
  }
  lines.push('}');
  lines.push('');

  // Rules section
  lines.push('rules {');
  
  // Entry rules
  if (json.rules.entry.length > 0) {
    lines.push('  entry {');
    for (const rule of json.rules.entry) {
      const condition = rule.conditions[0];
      if (condition && condition.type === 'condition') {
        const conditionStr = compileConditionToTQL(condition);
        const actionStr = compileEntryActionToTQL(rule.action as EnterPositionAction);
        lines.push(`    when ${conditionStr} then ${actionStr}`);
      }
    }
    lines.push('  }');
  }

  // Exit rules
  if (json.rules.exit.length > 0) {
    lines.push('  exit {');
    for (const rule of json.rules.exit) {
      const condition = rule.conditions[0];
      if (condition && condition.type === 'condition') {
        const conditionStr = compileConditionToTQL(condition);
        const actionStr = compileExitActionToTQL(rule.action as ExitPositionAction);
        lines.push(`    when ${conditionStr} then ${actionStr}`);
      }
    }
    lines.push('  }');
  }

  // Filters
  if (json.rules.filters.length > 0) {
    lines.push('  filters {');
    for (const rule of json.rules.filters) {
      const condition = rule.conditions[0];
      if (condition && condition.type === 'condition') {
        lines.push(`    ${compileConditionToTQL(condition)}`);
      }
    }
    lines.push('  }');
  }

  lines.push('}');
  lines.push('');

  // Risk section
  lines.push('risk {');
  if (json.risk.stop_loss_percent) lines.push(`  stop_loss: ${json.risk.stop_loss_percent}%`);
  if (json.risk.take_profit_percent) lines.push(`  take_profit: ${json.risk.take_profit_percent}%`);
  if (json.risk.position_size_percent) lines.push(`  position_size: ${json.risk.position_size_percent}%`);
  if (json.risk.max_risk_per_trade_percent) lines.push(`  max_risk_per_trade: ${json.risk.max_risk_per_trade_percent}%`);
  if (json.risk.trailing_stop_percent) lines.push(`  trailing_stop: ${json.risk.trailing_stop_percent}%`);
  if (json.risk.max_daily_loss_percent) lines.push(`  max_daily_loss: ${json.risk.max_daily_loss_percent}%`);
  if (json.risk.max_daily_trades) lines.push(`  max_daily_trades: ${json.risk.max_daily_trades}`);
  lines.push('}');

  return lines.join('\n');
}

function compileConditionToTQL(condition: Condition): string {
  const operatorMap: Record<string, string> = {
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    eq: '==',
    neq: '!=',
    crosses_above: 'crosses_above',
    crosses_below: 'crosses_below',
  };

  const left = compileSourceReferenceToTQL(condition.left);
  const operator = operatorMap[condition.operator] || condition.operator;
  const right = compileSourceReferenceToTQL(condition.right);

  if (operator === 'crosses_above' || operator === 'crosses_below') {
    return `${left} ${operator} ${right}`;
  }

  return `${left} ${operator} ${right}`;
}

function compileSourceReferenceToTQL(ref: SourceReference): string {
  if (ref.source_type === 'indicator' && ref.id) {
    return ref.id;
  } else if (ref.source_type === 'price' && ref.field) {
    return ref.field;
  } else if (ref.source_type === 'value') {
    if (typeof ref.value === 'string') {
      return `"${ref.value}"`;
    }
    return String(ref.value);
  }
  return String(ref.value);
}

function compileEntryActionToTQL(action: EnterPositionAction): string {
  const sizeMode = action.size_mode === 'percent' ? '%' : '';
  return `enter ${action.direction} size:${action.size}${sizeMode}`;
}

function compileExitActionToTQL(action: ExitPositionAction): string {
  return `exit ${action.direction}`;
}

