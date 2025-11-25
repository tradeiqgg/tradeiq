// =====================================================================
// CHAPTER 5: TQL Debugger - Deep Semantic Analysis
// =====================================================================

import type { TQJSSchema, Condition, Rule, Indicator } from './schema';
import { DiagnosticsBuilder, TQDiagnostic } from './diagnostics';
import { TQErrorCode } from './errors';
import { getIndicatorSpec } from './indicators';

/**
 * Run deep semantic analysis on a strategy
 */
export function runDebugger(strategy: Partial<TQJSSchema>): TQDiagnostic[] {
  const builder = new DiagnosticsBuilder();

  // 1. Check for logical conflicts
  checkLogicalConflicts(strategy, builder);

  // 2. Check for unreachable conditions
  checkUnreachableConditions(strategy, builder);

  // 3. Check for undefined indicators
  checkUndefinedIndicators(strategy, builder);

  // 4. Check for unused indicators
  checkUnusedIndicators(strategy, builder);

  // 5. Check for type incompatibilities
  checkTypeIncompatibilities(strategy, builder);

  // 6. Check for risk safety
  checkRiskSafety(strategy, builder);

  // 7. Check for contradictory rules
  checkContradictoryRules(strategy, builder);

  return builder.getDiagnostics();
}

function checkLogicalConflicts(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  // Check entry rules for impossible conditions
  for (const rule of strategy.rules.entry || []) {
    for (const condition of rule.conditions || []) {
      if (condition.type === 'condition') {
        const cond = condition as Condition;
        if (isImpossibleCondition(cond)) {
          builder.error(
            TQErrorCode.LOGICAL_CONFLICT,
            `Impossible condition detected: ${formatCondition(cond)}`,
            {
              snippet: formatCondition(cond),
            }
          );
        }
      }
    }
  }
}

function isImpossibleCondition(condition: Condition): boolean {
  const left = condition.left;
  const right = condition.right;
  const operator = condition.operator;

  // Check if comparing same indicator with contradictory operators
  if (
    left.source_type === 'indicator' &&
    right.source_type === 'indicator' &&
    left.id === right.id
  ) {
    // Same indicator compared to itself - this is always true or always false
    // which is a logical issue
    return true;
  }

  // Check for numeric contradictions
  if (
    left.source_type === 'value' &&
    right.source_type === 'value' &&
    typeof left.value === 'number' &&
    typeof right.value === 'number'
  ) {
    const leftVal = left.value;
    const rightVal = right.value;

    if (operator === 'lt' && leftVal >= rightVal) return true;
    if (operator === 'gt' && leftVal <= rightVal) return true;
    if (operator === 'eq' && leftVal !== rightVal) return true;
    if (operator === 'neq' && leftVal === rightVal) return true;
  }

  return false;
}

function checkUnreachableConditions(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  // Check for conditions that can never be true
  for (const rule of [...(strategy.rules.entry || []), ...(strategy.rules.exit || [])]) {
    for (const condition of rule.conditions || []) {
      if (condition.type === 'condition') {
        const cond = condition as Condition;
        if (isUnreachableCondition(cond)) {
          builder.warning(
            TQErrorCode.UNREACHABLE_CODE,
            `Unreachable condition: ${formatCondition(cond)}`,
            {
              snippet: formatCondition(cond),
            }
          );
        }
      }
    }
  }
}

function isUnreachableCondition(condition: Condition): boolean {
  // Check for conditions that are always false
  const left = condition.left;
  const right = condition.right;
  const operator = condition.operator;

  // Example: comparing a boolean indicator with a number
  if (left.source_type === 'indicator' && right.source_type === 'value') {
    const spec = getIndicatorSpec(left.id || '');
    if (spec && spec.output === 'boolean' && typeof right.value === 'number') {
      return true;
    }
  }

  return false;
}

function checkUndefinedIndicators(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules || !strategy.indicators) return;

  const definedIndicatorIds = new Set(strategy.indicators.map((ind) => ind.id));

  // Check all conditions for undefined indicators
  const allRules = [
    ...(strategy.rules.entry || []),
    ...(strategy.rules.exit || []),
    ...(strategy.rules.filters || []),
  ];

  for (const rule of allRules) {
    for (const condition of rule.conditions || []) {
      if (condition.type === 'condition') {
        const cond = condition as Condition;
        if (cond.left.source_type === 'indicator' && cond.left.id) {
          if (!definedIndicatorIds.has(cond.left.id)) {
            builder.error(
              TQErrorCode.INDICATOR_UNDEFINED,
              `Indicator '${cond.left.id}' is used but not defined`,
              {
                snippet: formatCondition(cond),
                relatedCode: cond.left.id,
              }
            );
          }
        }
        if (cond.right.source_type === 'indicator' && cond.right.id) {
          if (!definedIndicatorIds.has(cond.right.id)) {
            builder.error(
              TQErrorCode.INDICATOR_UNDEFINED,
              `Indicator '${cond.right.id}' is used but not defined`,
              {
                snippet: formatCondition(cond),
                relatedCode: cond.right.id,
              }
            );
          }
        }
      }
    }
  }
}

function checkUnusedIndicators(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules || !strategy.indicators) return;

  const usedIndicatorIds = new Set<string>();

  // Collect all used indicators
  const allRules = [
    ...(strategy.rules.entry || []),
    ...(strategy.rules.exit || []),
    ...(strategy.rules.filters || []),
  ];

  for (const rule of allRules) {
    for (const condition of rule.conditions || []) {
      if (condition.type === 'condition') {
        const cond = condition as Condition;
        if (cond.left.source_type === 'indicator' && cond.left.id) {
          usedIndicatorIds.add(cond.left.id);
        }
        if (cond.right.source_type === 'indicator' && cond.right.id) {
          usedIndicatorIds.add(cond.right.id);
        }
      }
    }
  }

  // Check for unused indicators
  for (const indicator of strategy.indicators) {
    if (!usedIndicatorIds.has(indicator.id)) {
      builder.warning(
        TQErrorCode.INDICATOR_NOT_USED,
        `Indicator '${indicator.id}' is defined but never used`,
        {
          relatedCode: indicator.id,
        }
      );
    }
  }
}

function checkTypeIncompatibilities(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  const allRules = [
    ...(strategy.rules.entry || []),
    ...(strategy.rules.exit || []),
    ...(strategy.rules.filters || []),
  ];

  for (const rule of allRules) {
    for (const condition of rule.conditions || []) {
      if (condition.type === 'condition') {
        const cond = condition as Condition;
        const leftType = getValueType(cond.left, strategy);
        const rightType = getValueType(cond.right, strategy);

        if (leftType && rightType && leftType !== rightType) {
          // Allow comparisons between compatible types
          if (
            !areCompatibleTypes(leftType, rightType, cond.operator)
          ) {
            builder.error(
              TQErrorCode.INCOMPATIBLE_TYPES,
              `Cannot compare ${leftType} with ${rightType}`,
              {
                snippet: formatCondition(cond),
              }
            );
          }
        }
      }
    }
  }
}

function getValueType(
  ref: any,
  strategy: Partial<TQJSSchema>
): 'numeric' | 'boolean' | 'band' | 'series' | null {
  if (ref.source_type === 'indicator' && ref.id) {
    const indicator = strategy.indicators?.find((ind) => ind.id === ref.id);
    if (indicator) {
      const spec = getIndicatorSpec(indicator.indicator);
      return spec?.output || null;
    }
  } else if (ref.source_type === 'value') {
    if (typeof ref.value === 'number') return 'numeric';
    if (typeof ref.value === 'boolean') return 'boolean';
  } else if (ref.source_type === 'price') {
    return 'numeric';
  }

  return null;
}

function areCompatibleTypes(
  leftType: string,
  rightType: string,
  operator: string
): boolean {
  // Numeric comparisons are always compatible
  if (leftType === 'numeric' && rightType === 'numeric') return true;
  if (leftType === 'boolean' && rightType === 'boolean') return true;

  // Cross operators work with numeric types
  if (operator === 'crosses_above' || operator === 'crosses_below') {
    return leftType === 'numeric' && rightType === 'numeric';
  }

  return false;
}

function checkRiskSafety(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.risk) {
    builder.error(
      TQErrorCode.MISSING_RISK,
      "Risk management section is required",
    );
    return;
  }

  // Check for missing stop loss
  if (
    (!strategy.risk.stop_loss_percent || strategy.risk.stop_loss_percent === null) &&
    (!strategy.risk.trailing_stop_percent || strategy.risk.trailing_stop_percent === null)
  ) {
    builder.error(
      TQErrorCode.MISSING_STOP_LOSS,
      "Either stop_loss or trailing_stop must be defined",
    );
  }

  // Check position size
  if (strategy.risk.position_size_percent > 100) {
    builder.error(
      TQErrorCode.POSITION_SIZE_TOO_LARGE,
      `Position size ${strategy.risk.position_size_percent}% exceeds 100%`,
    );
  }

  // Check for unbounded risk
  if (strategy.risk.stop_loss_percent && strategy.risk.stop_loss_percent > 50) {
    builder.warning(
      TQErrorCode.UNBOUNDED_RISK,
      `Stop loss ${strategy.risk.stop_loss_percent}% is unusually high`,
    );
  }
}

function checkContradictoryRules(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  // Check for entry and exit rules that contradict each other
  const entryRules = strategy.rules.entry || [];
  const exitRules = strategy.rules.exit || [];

  // Simple check: if entry and exit have identical conditions but opposite actions
  for (const entryRule of entryRules) {
    for (const exitRule of exitRules) {
      if (haveContradictoryConditions(entryRule, exitRule)) {
        builder.warning(
          TQErrorCode.CONTRADICTORY_RULES,
          "Entry and exit rules may conflict",
        );
      }
    }
  }
}

function haveContradictoryConditions(rule1: Rule, rule2: Rule): boolean {
  // Simplified check - in a real implementation, this would be more sophisticated
  return false;
}

function formatCondition(condition: Condition): string {
  const left = formatValueRef(condition.left);
  const right = formatValueRef(condition.right);
  const op = condition.operator;
  return `${left} ${op} ${right}`;
}

function formatValueRef(ref: any): string {
  if (ref.source_type === 'indicator' && ref.id) {
    return ref.id;
  } else if (ref.source_type === 'value') {
    return String(ref.value);
  } else if (ref.source_type === 'price' && ref.field) {
    return ref.field;
  }
  return '?';
}

