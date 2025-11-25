/**
 * TQ-JSS (TradeIQ JSON Strategy Schema) - Main Entry Point
 * 
 * This module exports the complete TQ-JSS schema specification,
 * validation functions, indicator registry, and utilities.
 * 
 * @example
 * ```ts
 * import { validateTQJSSchema, EXAMPLE_VALID_STRATEGY, type TQJSSchema } from '@/lib/tql';
 * import { TQIndicatorRegistry, getIndicatorSpec } from '@/lib/tql';
 * 
 * const result = validateTQJSSchema(myStrategy);
 * if (result.valid) {
 *   console.log('Strategy is valid!');
 * }
 * 
 * const rsiSpec = getIndicatorSpec('rsi');
 * console.log('RSI description:', rsiSpec?.description);
 * ```
 */

// Re-export everything from schema
export * from './schema';

// Re-export everything from indicators
export * from './indicators';

// Re-export everything from blocks
export * from './blocks';

// Re-export everything from TQL (lexer, parser, compiler)
export * from './lexer';
export * from './parser';
export * from './compiler';

// Re-export everything from validator system (Chapter 5)
export * from './errors';
export * from './diagnostics';
export * from './fixes';
export * from './debugger';
export * from './simulator';
export * from './validator';

// Default export (schema utilities)
export { default } from './schema';

