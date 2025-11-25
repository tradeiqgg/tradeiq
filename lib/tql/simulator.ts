// =====================================================================
// CHAPTER 5: TQL Static Simulator
// =====================================================================

import type { TQJSSchema, Rule, Condition } from './schema';
import { DiagnosticsBuilder, TQDiagnostic } from './diagnostics';
import { TQErrorCode } from './errors';

/**
 * Run static simulation on a strategy to detect structural issues
 */
export function runStaticSimulation(strategy: Partial<TQJSSchema>): TQDiagnostic[] {
  const builder = new DiagnosticsBuilder();

  // 1. Check for rules that never fire
  checkRuleTriggerability(strategy, builder);

  // 2. Check for infinite loops
  checkInfiniteLoops(strategy, builder);

  // 3. Check for non-firing indicators
  checkNonFiringIndicators(strategy, builder);

  // 4. Check for rules that always fire
  checkAlwaysFiringRules(strategy, builder);

  return builder.getDiagnostics();
}

function checkRuleTriggerability(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  // Simulate with synthetic data
  const entryRules = strategy.rules.entry || [];
  const exitRules = strategy.rules.exit || [];

  // Check if exit rules can ever fire
  if (exitRules.length === 0) {
    builder.warning(
      TQErrorCode.NO_EXIT_RULES,
      "No exit rules defined - positions may never close",
    );
  }

  // Check if entry rules can ever fire
  if (entryRules.length === 0) {
    builder.error(
      TQErrorCode.NO_ENTRY_RULES,
      "No entry rules defined - strategy will never enter positions",
    );
  }

  // Check for exit rules that might never fire
  for (const exitRule of exitRules) {
    if (hasImpossibleCondition(exitRule)) {
      builder.warning(
        TQErrorCode.UNREACHABLE_CODE,
        "Exit rule may never fire due to impossible condition",
      );
    }
  }
}

function checkInfiniteLoops(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  // Check for rules that could create infinite loops
  // This is a simplified check - real implementation would be more sophisticated
  const entryRules = strategy.rules.entry || [];
  const exitRules = strategy.rules.exit || [];

  // Check if entry rules immediately trigger exit rules
  for (const entryRule of entryRules) {
    for (const exitRule of exitRules) {
      if (couldCreateLoop(entryRule, exitRule)) {
        builder.error(
          TQErrorCode.POTENTIAL_INFINITE_LOOP,
          "Entry and exit rules may create an infinite loop",
        );
      }
    }
  }
}

function checkNonFiringIndicators(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.indicators || !strategy.rules) return;

  // Check if indicators are actually used in conditions
  const usedIndicators = new Set<string>();

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
          usedIndicators.add(cond.left.id);
        }
        if (cond.right.source_type === 'indicator' && cond.right.id) {
          usedIndicators.add(cond.right.id);
        }
      }
    }
  }

  // This check is handled by debugger, but we can add simulation-specific info
  for (const indicator of strategy.indicators) {
    if (!usedIndicators.has(indicator.id)) {
      builder.info(
        TQErrorCode.INDICATOR_NOT_USED,
        `Indicator '${indicator.id}' is defined but never used in any rule`,
      );
    }
  }
}

function checkAlwaysFiringRules(
  strategy: Partial<TQJSSchema>,
  builder: DiagnosticsBuilder
): void {
  if (!strategy.rules) return;

  const entryRules = strategy.rules.entry || [];

  // Check for rules that would always fire
  for (const rule of entryRules) {
    if (hasAlwaysTrueCondition(rule)) {
      builder.warning(
        TQErrorCode.LOGICAL_CONFLICT,
        "Entry rule may fire on every candle due to always-true condition",
      );
    }
  }
}

function hasImpossibleCondition(rule: Rule): boolean {
  // Simplified check - real implementation would be more sophisticated
  for (const condition of rule.conditions || []) {
    if (condition.type === 'condition') {
      const cond = condition as Condition;
      // Check for conditions that are always false
      if (
        cond.left.source_type === 'value' &&
        cond.right.source_type === 'value' &&
        typeof cond.left.value === 'number' &&
        typeof cond.right.value === 'number'
      ) {
        const leftVal = cond.left.value;
        const rightVal = cond.right.value;

        if (cond.operator === 'lt' && leftVal >= rightVal) return true;
        if (cond.operator === 'gt' && leftVal <= rightVal) return true;
        if (cond.operator === 'eq' && leftVal !== rightVal) return true;
      }
    }
  }
  return false;
}

function hasAlwaysTrueCondition(rule: Rule): boolean {
  // Simplified check - real implementation would be more sophisticated
  for (const condition of rule.conditions || []) {
    if (condition.type === 'condition') {
      const cond = condition as Condition;
      // Check for conditions that are always true
      if (
        cond.left.source_type === 'value' &&
        cond.right.source_type === 'value' &&
        typeof cond.left.value === 'number' &&
        typeof cond.right.value === 'number'
      ) {
        const leftVal = cond.left.value;
        const rightVal = cond.right.value;

        if (cond.operator === 'lt' && leftVal < rightVal) return true;
        if (cond.operator === 'gt' && leftVal > rightVal) return true;
        if (cond.operator === 'eq' && leftVal === rightVal) return true;
      }
    }
  }
  return false;
}

function couldCreateLoop(entryRule: Rule, exitRule: Rule): boolean {
  // Simplified check - real implementation would analyze rule conditions
  // to detect if entry immediately triggers exit
  return false;
}

