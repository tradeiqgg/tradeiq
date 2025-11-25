// =====================================================================
// CHAPTER 5: TQL Master Validator
// =====================================================================

import type { TQJSSchema } from './schema';
import { TQLLexer } from './lexer';
import { TQLParser } from './parser';
import { compileTQLToJSON } from './compiler';
import { validateTQJSSchema } from './schema';
import { runDebugger } from './debugger';
import { runStaticSimulation } from './simulator';
import { DiagnosticsBuilder, TQDiagnostic } from './diagnostics';
import { TQErrorCode } from './errors';
import { validateIndicatorParams, isValidIndicatorId } from './indicators';
import { validateBlockInstance } from './blocks';

export interface TQValidationResult {
  valid: boolean;
  errors: TQDiagnostic[];
  warnings: TQDiagnostic[];
  info: TQDiagnostic[];
  normalizedJSON?: TQJSSchema;
  normalizedTQL?: string;
  normalizedBlocks?: any; // TQBlockInstanceTree - would be defined in blocks.ts
}

export interface ValidationInput {
  tql?: string;
  json?: Partial<TQJSSchema>;
  blocks?: any; // TQBlockInstanceTree
}

/**
 * Master validator - orchestrates the entire validation process
 */
export function validateStrategy(input: ValidationInput): TQValidationResult {
  const builder = new DiagnosticsBuilder();
  let jsonFromTql: TQJSSchema | null = null;
  let normalizedTQL: string | undefined = input.tql;

  // Step 1: Parse and compile TQL if provided
  if (input.tql) {
    try {
      const lexer = new TQLLexer(input.tql);
      const tokenResult = lexer.tokenize();

      if (tokenResult.errors.length > 0) {
        for (const error of tokenResult.errors) {
          builder.error(
            TQErrorCode.SYNTAX_ERROR,
            `Lexer error: ${error.message}`,
            {
              line: error.line,
              column: error.column,
            }
          );
        }
      }

      const parser = new TQLParser(tokenResult.tokens);
      const parseResult = parser.parse();

      if (!parseResult.ast) {
        for (const error of parseResult.errors) {
          builder.error(
            TQErrorCode.SYNTAX_ERROR,
            `Parse error: ${error.message}`,
            {
              line: error.line,
              column: error.column,
            }
          );
        }
      } else {
        // Compile TQL to JSON
        const compileResult = compileTQLToJSON(parseResult.ast);
        if (!compileResult.json) {
          for (const error of compileResult.errors) {
            builder.error(
              TQErrorCode.TQL_TO_JSON_FAILED,
              `Compilation error: ${error.message}`,
              {
                line: error.line,
                column: error.column,
              }
            );
          }
        } else {
          jsonFromTql = compileResult.json;
        }
      }
    } catch (error: any) {
      builder.error(
        TQErrorCode.TQL_TO_JSON_FAILED,
        `TQL parsing failed: ${error.message}`,
      );
    }
  }

  // Step 2: Determine source of truth (JSON)
  const json = jsonFromTql || input.json;
  if (!json) {
    return {
      valid: false,
      errors: builder.getDiagnostics().filter((d) => d.type === 'error'),
      warnings: builder.getDiagnostics().filter((d) => d.type === 'warning'),
      info: builder.getDiagnostics().filter((d) => d.type === 'info'),
    };
  }

  // Step 3: Validate JSON schema (Chapter 1)
  const schemaCheck = validateTQJSSchema(json);
  for (const error of schemaCheck.errors) {
    builder.error(
      error.code as TQErrorCode,
      error.message,
      {
        relatedCode: error.field,
      }
    );
  }
  for (const warning of schemaCheck.warnings) {
    builder.warning(
      warning.code as TQErrorCode,
      warning.message,
      {
        relatedCode: warning.field,
      }
    );
  }

  // Step 4: Validate indicators (Chapter 2)
  const indicatorDiagnostics = validateIndicators(json);
  builder.getDiagnostics().push(...indicatorDiagnostics);

  // Step 5: Validate rules
  const ruleDiagnostics = validateRules(json);
  builder.getDiagnostics().push(...ruleDiagnostics);

  // Step 6: Validate blocks if provided
  if (input.blocks) {
    const blockDiagnostics = validateBlockTree(input.blocks);
    builder.getDiagnostics().push(...blockDiagnostics);
  }

  // Step 7: Run debugger semantic checks (Chapter 5)
  const debuggerDiagnostics = runDebugger(json);
  builder.getDiagnostics().push(...debuggerDiagnostics);

  // Step 8: Run static simulation (Chapter 5)
  const simulationDiagnostics = runStaticSimulation(json);
  builder.getDiagnostics().push(...simulationDiagnostics);

  // Step 9: Separate diagnostics by type
  const allDiagnostics = builder.getDiagnostics();
  const errors = allDiagnostics.filter((d) => d.type === 'error');
  const warnings = allDiagnostics.filter((d) => d.type === 'warning');
  const info = allDiagnostics.filter((d) => d.type === 'info');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    normalizedJSON: json as TQJSSchema,
    normalizedTQL: normalizedTQL,
    normalizedBlocks: input.blocks,
  };
}

/**
 * Validate indicators in a strategy
 */
function validateIndicators(strategy: Partial<TQJSSchema>): TQDiagnostic[] {
  const diagnostics: TQDiagnostic[] = [];

  if (!strategy.indicators) return diagnostics;

  const indicatorIds = new Set<string>();

  for (const indicator of strategy.indicators) {
    // Check for duplicates
    if (indicatorIds.has(indicator.id)) {
      diagnostics.push({
        type: 'error',
        code: TQErrorCode.DUPLICATE_INDICATOR_NAME,
        message: `Duplicate indicator name: ${indicator.id}`,
        relatedCode: indicator.id,
      });
      continue;
    }
    indicatorIds.add(indicator.id);

    // Validate indicator exists in registry
    if (!isValidIndicatorId(indicator.indicator)) {
      diagnostics.push({
        type: 'error',
        code: TQErrorCode.UNKNOWN_INDICATOR,
        message: `Unknown indicator: ${indicator.indicator}`,
        relatedCode: indicator.indicator,
      });
      continue;
    }

    // Validate parameters
    const paramValidation = validateIndicatorParams(
      indicator.indicator,
      indicator.params
    );

    if (!paramValidation.valid) {
      for (const error of paramValidation.errors) {
        diagnostics.push({
          type: 'error',
          code: TQErrorCode.INVALID_INDICATOR_PARAMS,
          message: `Indicator '${indicator.indicator}': ${error.message}`,
          relatedCode: indicator.id,
        });
      }
    }
  }

  return diagnostics;
}

/**
 * Validate rules in a strategy
 */
function validateRules(strategy: Partial<TQJSSchema>): TQDiagnostic[] {
  const diagnostics: TQDiagnostic[] = [];

  if (!strategy.rules) {
    diagnostics.push({
      type: 'error',
      code: TQErrorCode.MISSING_SECTION,
      message: 'Rules section is missing',
    });
    return diagnostics;
  }

  // Check for entry rules
  if (!strategy.rules.entry || strategy.rules.entry.length === 0) {
    diagnostics.push({
      type: 'error',
      code: TQErrorCode.NO_ENTRY_RULES,
      message: 'At least one entry rule is required',
    });
  }

  // Check for exit rules
  if (!strategy.rules.exit || strategy.rules.exit.length === 0) {
    diagnostics.push({
      type: 'error',
      code: TQErrorCode.NO_EXIT_RULES,
      message: 'At least one exit rule is required',
    });
  }

  // Validate each rule
  const allRules = [
    ...(strategy.rules.entry || []),
    ...(strategy.rules.exit || []),
    ...(strategy.rules.filters || []),
  ];

  for (const rule of allRules) {
    // Check for empty rules
    if (!rule.conditions || rule.conditions.length === 0) {
      diagnostics.push({
        type: 'error',
        code: TQErrorCode.EMPTY_RULE,
        message: 'Rule has no conditions',
      });
    }

    if (!rule.action) {
      diagnostics.push({
        type: 'error',
        code: TQErrorCode.MISSING_ACTION,
        message: 'Rule has no action',
      });
    }

    // Validate conditions
    for (const condition of rule.conditions || []) {
      if (condition.type === 'condition') {
        // Validate condition structure
        if (!condition.left || !condition.right || !condition.operator) {
          diagnostics.push({
            type: 'error',
            code: TQErrorCode.INVALID_CONDITION,
            message: 'Invalid condition structure',
          });
        }
      }
    }
  }

  return diagnostics;
}

/**
 * Validate block tree structure
 */
function validateBlockTree(blocks: any): TQDiagnostic[] {
  const diagnostics: TQDiagnostic[] = [];

  // This would validate the block tree structure
  // For now, return empty array as block tree validation would be more complex
  // and depend on the actual block tree structure

  return diagnostics;
}

/**
 * Quick validation - just check if strategy is valid
 */
export function isValidStrategy(input: ValidationInput): boolean {
  const result = validateStrategy(input);
  return result.valid;
}

/**
 * Get validation errors only
 */
export function getValidationErrors(input: ValidationInput): TQDiagnostic[] {
  const result = validateStrategy(input);
  return result.errors;
}

/**
 * Get validation warnings only
 */
export function getValidationWarnings(input: ValidationInput): TQDiagnostic[] {
  const result = validateStrategy(input);
  return result.warnings;
}

