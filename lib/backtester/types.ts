// =====================================================================
// CHAPTER 7: Backtesting Engine Types
// =====================================================================

import type { TQJSSchema } from '@/lib/tql/schema';

/**
 * Core Candle Type
 */
export interface Candle {
  time: number; // ms timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Indicator Output Types
 */
export interface IndicatorBand {
  upper: number;
  middle: number;
  lower: number;
}

export interface IndicatorSeries {
  [indicatorName: string]: number | boolean | IndicatorBand | number[];
}

/**
 * Position State
 */
export interface Position {
  id: string;
  direction: 'long' | 'short';
  entryPrice: number;
  entryTime: number;
  size: number; // in base currency
  sizePercent: number; // percentage of balance
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: number;
}

/**
 * Strategy Runtime State
 */
export interface StrategyRuntimeState {
  position: Position | null;
  balance: number;
  equity: number;
  openTrades: TradeRecord[];
  closedTrades: TradeRecord[];
  indicatorCache: Record<string, IndicatorSeries>;
  lastCandle: Candle | null;
  currentCandleIndex: number;
  maxDrawdown: number;
  peakEquity: number;
  consecutiveLosses: number;
  dailyTrades: number;
  dailyPnL: number;
  logs: string[];
}

/**
 * Order Types
 */
export interface Order {
  id: string;
  direction: 'long' | 'short';
  type: 'market' | 'limit';
  size: number; // in percent or fixed
  sizeMode: 'percent' | 'fixed';
  price?: number; // limit only
  timestamp: number;
}

export interface FilledOrder extends Order {
  filledPrice: number;
  filledTime: number;
  slippage: number;
}

/**
 * Trade Record
 */
export interface TradeRecord {
  id: string;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  size: number;
  direction: 'long' | 'short';
  profit: number;
  returnPct: number;
  reason: string;
  stopLoss?: number;
  takeProfit?: number;
}

/**
 * Execution Result
 */
export interface ExecutionResult {
  newState: StrategyRuntimeState;
  executedOrders: FilledOrder[];
  logs: string[];
  riskActions: RiskAction[];
}

/**
 * Risk Actions
 */
export interface RiskAction {
  type: 'stop_loss' | 'take_profit' | 'trailing_stop' | 'max_drawdown' | 'max_trades';
  message: string;
  closePosition?: boolean;
}

/**
 * Backtest Options
 */
export interface BacktestOptions {
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  slippage?: number; // in bps (basis points)
  commission?: number; // in bps
  enableSlippage?: boolean;
  enableCommission?: boolean;
}

/**
 * Backtest Summary
 */
export interface BacktestSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPct: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpeRatio?: number;
  profitFactor?: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageHoldTime: number; // in ms
}

/**
 * Backtest Result
 */
export interface BacktestResult {
  strategy: TQJSSchema;
  options: BacktestOptions;
  trades: TradeRecord[];
  pnl: number;
  pnlPct: number;
  winRate: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  equityCurve: Array<{ time: number; equity: number }>;
  drawdownCurve: Array<{ time: number; drawdown: number }>;
  logs: string[];
  summary: BacktestSummary;
  executionTime: number; // in ms
  candlesProcessed: number;
  indicatorsComputed: number;
}

/**
 * Competition Entry Result
 */
export interface CompetitionEntryResult {
  strategyId: string;
  userId: string;
  competitionId: string;
  startTime: Date;
  endTime: Date;
  pnlPct: number;
  winRate: number;
  drawdown: number;
  rank: number;
  trades: TradeRecord[];
  equityCurve: Array<{ time: number; equity: number }>;
}

/**
 * Worker Message Types
 */
export interface WorkerMessage {
  type: 'RUN_BACKTEST' | 'CANCEL_BACKTEST' | 'PROGRESS';
  payload?: any;
}

export interface WorkerResponse {
  type: 'DONE' | 'ERROR' | 'PROGRESS' | 'CANCELLED';
  payload?: any;
}

