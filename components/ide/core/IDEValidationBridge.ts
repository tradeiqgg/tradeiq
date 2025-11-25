// =====================================================================
// CHAPTER 6: IDE Validation Bridge
// =====================================================================

import { validateStrategy, type TQValidationResult } from '@/lib/tql';
import { TQLLexer } from '@/lib/tql/lexer';
import { TQLParser } from '@/lib/tql/parser';
import { compileTQLToJSON } from '@/lib/tql/compiler';
import { TQErrorCode } from '@/lib/tql/errors';
import type { IDEMode } from './IDEEngine';
import { useIDEEngine } from './IDEEngine';

let validationDebounceTimer: NodeJS.Timeout | null = null;
const VALIDATION_DEBOUNCE_MS = 250;

/**
 * Run validation based on current IDE mode
 */
export async function runIdeValidation(
  mode: IDEMode,
  tqlText?: string,
  jsonText?: string,
  blockTree?: any
): Promise<TQValidationResult | null> {
  // Clear existing debounce
  if (validationDebounceTimer) {
    clearTimeout(validationDebounceTimer);
  }

  return new Promise((resolve) => {
    validationDebounceTimer = setTimeout(async () => {
      const engine = useIDEEngine.getState();
      engine.setIsValidating(true);

      try {
        let result: TQValidationResult | null = null;

        // Determine input based on mode
        if (mode === 'tql' && tqlText) {
          // Parse and compile TQL
          const lexer = new TQLLexer(tqlText);
          const tokens = lexer.tokenize();

          if (tokens.errors.length > 0) {
            // Return early validation result for lexer errors
            result = {
              valid: false,
              errors: tokens.errors.map((e) => ({
                type: 'error' as const,
                code: 'SYNTAX_ERROR' as any,
                message: e.message,
                line: e.line,
                column: e.column,
              })),
              warnings: [],
              info: [],
            };
          } else {
            const parser = new TQLParser(tokens.tokens);
            const ast = parser.parse();

            if (!ast.ast) {
              result = {
                valid: false,
                errors: ast.errors.map((e) => ({
                  type: 'error' as const,
                  code: 'SYNTAX_ERROR' as any,
                  message: e.message,
                  line: e.line,
                  column: e.column,
                })),
                warnings: [],
                info: [],
              };
            } else {
              // Compile to JSON and validate
              const compileResult = compileTQLToJSON(ast.ast);
              if (compileResult.json) {
                result = validateStrategy({ json: compileResult.json });
                // Store compiled JSON
                engine.compiledJSON = compileResult.json;
              } else {
                result = {
                  valid: false,
                  errors: compileResult.errors.map((e) => {
                    // Map CompileError.type to TQErrorCode
                    let code: TQErrorCode;
                    if (e.type === 'syntax') {
                      code = TQErrorCode.SYNTAX_ERROR;
                    } else if (e.type === 'semantic') {
                      code = TQErrorCode.LOGICAL_CONFLICT;
                    } else {
                      code = TQErrorCode.INVALID_SECTION;
                    }
                    return {
                    type: 'error' as const,
                      code,
                    message: e.message,
                    line: e.line,
                    column: e.column,
                    };
                  }),
                  warnings: [],
                  info: [],
                };
              }
            }
          }
        } else if (mode === 'json' && jsonText) {
          try {
            const json = JSON.parse(jsonText);
            result = validateStrategy({ json });
            engine.compiledJSON = json;
          } catch (e: any) {
            result = {
              valid: false,
              errors: [
                {
                  type: 'error' as const,
                  code: 'SYNTAX_ERROR' as any,
                  message: `JSON parse error: ${e.message}`,
                  line: 1,
                  column: 1,
                },
              ],
              warnings: [],
              info: [],
            };
          }
        } else if (mode === 'blocks' && blockTree) {
          // Convert blocks to JSON first, then validate
          // This would use blockToJSON from blocks.ts
          result = validateStrategy({ blocks: blockTree });
        }

        // Update engine state
        if (result) {
          engine.setDiagnostics([
            ...result.errors,
            ...result.warnings,
            ...result.info,
          ]);
          engine.setCompileResult(result);

          // Create snapshot if valid
          if (result.valid) {
            engine.createSnapshot();
          }
        }

        engine.setIsValidating(false);
        resolve(result);
      } catch (error: any) {
        engine.setIsValidating(false);
        const errorResult: TQValidationResult = {
          valid: false,
          errors: [
            {
              type: 'error',
              code: 'SYNTAX_ERROR' as any,
              message: `Validation error: ${error.message}`,
            },
          ],
          warnings: [],
          info: [],
        };
        engine.setDiagnostics(errorResult.errors);
        resolve(errorResult);
      }
    }, VALIDATION_DEBOUNCE_MS);
  });
}

/**
 * Run immediate validation (no debounce)
 */
export async function runImmediateValidation(
  mode: IDEMode,
  tqlText?: string,
  jsonText?: string,
  blockTree?: any
): Promise<TQValidationResult | null> {
  if (validationDebounceTimer) {
    clearTimeout(validationDebounceTimer);
    validationDebounceTimer = null;
  }
  return runIdeValidation(mode, tqlText, jsonText, blockTree);
}

/**
 * Hook for components to trigger validation
 */
export function useIDEValidation() {
  const engine = useIDEEngine();

  const validate = async () => {
    return runIdeValidation(
      engine.mode,
      engine.tqlText,
      engine.jsonText,
      engine.blockTree
    );
  };

  return {
    validate,
    isValidating: engine.isValidating,
    diagnostics: engine.diagnostics,
    compileResult: engine.compileResult,
  };
}

