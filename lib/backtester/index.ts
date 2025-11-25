// =====================================================================
// CHAPTER 7: Backtester - Main Exports
// =====================================================================

export * from './types';
export * from './candleLoader';
export * from './indicatorEngine';
export * from './executionEngine';
export * from './riskEngine';
export * from './pnlEngine';
export * from './runner';
export * from './logStream';

// Main entry point
export { runBacktest } from './runner';

