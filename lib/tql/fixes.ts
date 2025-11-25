// =====================================================================
// CHAPTER 5: TQL Auto-Fix Engine
// =====================================================================

import { TQFixSuggestion } from './diagnostics';
import { TQErrorCode } from './errors';
import type { TQJSSchema, Indicator, Rule, Condition } from './schema';
import { getIndicatorSpec, getDefaultParams } from './indicators';

/**
 * Generate fix suggestions for common errors
 */
export function generateFix(
  code: TQErrorCode,
  context: any
): TQFixSuggestion | null {
  switch (code) {
    case TQErrorCode.INVALID_INDICATOR_PARAMS:
      return fixInvalidIndicatorParams(context);
    case TQErrorCode.MISSING_STOP_LOSS:
      return fixMissingStopLoss(context);
    case TQErrorCode.NO_EXIT_RULES:
      return fixMissingExitRules(context);
    case TQErrorCode.INDICATOR_UNDEFINED:
      return fixUndefinedIndicator(context);
    case TQErrorCode.POSITION_SIZE_TOO_LARGE:
      return fixPositionSizeTooLarge(context);
    default:
      return null;
  }
}

function fixInvalidIndicatorParams(context: {
  indicatorId: string;
  invalidParams: string[];
  validParams: string[];
}): TQFixSuggestion {
  const spec = getIndicatorSpec(context.indicatorId);
  const defaults = getDefaultParams(context.indicatorId);
  
  const validParamsStr = context.validParams
    .map(p => `${p}:${defaults[p]}`)
    .join(', ');

  return {
    suggestion: `Remove invalid parameters. Valid parameters: ${context.validParams.join(', ')}`,
    apply: `${context.indicatorId}(${validParamsStr})`,
    description: `The indicator '${context.indicatorId}' does not accept: ${context.invalidParams.join(', ')}`,
  };
}

function fixMissingStopLoss(context: {
  risk?: any;
}): TQFixSuggestion {
  return {
    suggestion: "Add stop_loss or trailing_stop to risk section",
    apply: "risk { stop_loss: 3% }",
    description: "Every strategy must have either stop_loss or trailing_stop defined",
  };
}

function fixMissingExitRules(context: {
  strategy?: TQJSSchema;
}): TQFixSuggestion {
  return {
    suggestion: "Add at least one exit rule",
    apply: `exit {
  when rsi > 70 then exit long
}`,
    description: "Strategies must have at least one exit rule to close positions",
  };
}

function fixUndefinedIndicator(context: {
  indicatorId: string;
}): TQFixSuggestion {
  const spec = getIndicatorSpec(context.indicatorId);
  if (spec) {
    const defaults = getDefaultParams(context.indicatorId);
    const paramsStr = Object.entries(defaults)
      .map(([k, v]) => `${k}:${v}`)
      .join(', ');
    
    return {
      suggestion: `Define the indicator in the indicators section`,
      apply: `indicators {
  ${context.indicatorId} = ${context.indicatorId}(${paramsStr})
}`,
      description: `Add '${context.indicatorId}' to the indicators section`,
    };
  }
  
  return {
    suggestion: `Remove reference to unknown indicator '${context.indicatorId}'`,
    description: `The indicator '${context.indicatorId}' does not exist in the registry`,
  };
}

function fixPositionSizeTooLarge(context: {
  currentSize: number;
}): TQFixSuggestion {
  const suggestedSize = Math.min(context.currentSize, 100);
  return {
    suggestion: `Reduce position size to ${suggestedSize}% or less`,
    apply: `position_size: ${suggestedSize}%`,
    description: `Position size cannot exceed 100%`,
  };
}

/**
 * Apply auto-fixes to a strategy JSON
 */
export function applyFixes(
  strategy: Partial<TQJSSchema>,
  fixes: TQFixSuggestion[]
): Partial<TQJSSchema> {
  const fixed = { ...strategy };

  for (const fix of fixes) {
    // Apply fixes based on fix code or suggestion
    if (fix.apply) {
      // This would need more sophisticated parsing in a real implementation
      // For now, we'll just return the fixed strategy structure
    }
  }

  return fixed;
}

