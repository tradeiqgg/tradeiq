// =====================================================================
// CHAPTER 9: Competition Engine Types
// =====================================================================

import type { TQJSSchema } from '@/lib/tql/schema';
import type { BacktestResult } from '@/lib/backtester/types';

/**
 * Competition Types
 */
export type CompetitionType = 'daily' | 'weekly' | 'monthly';

export type CompetitionStatus = 'upcoming' | 'active' | 'ended' | 'cancelled';

/**
 * Competition Definition
 */
export interface Competition {
  id: string;
  type: CompetitionType;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  seed: string; // Deterministic seed for this competition
  candleId: string; // Reference to preloaded candle dataset
  symbol: string;
  timeframe: string;
  entryFee: number; // In SOL or TradeIQ tokens
  prizePool: number;
  status: CompetitionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Competition Submission
 */
export interface CompetitionSubmission {
  id: string;
  competitionId: string;
  userId: string;
  strategyJson: TQJSSchema;
  strategyHash: string; // SHA256 hash of normalized JSON
  resultJson: BacktestResult | null;
  score: number;
  pnlPct: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  rank: number;
  submittedAt: Date;
  validatedAt: Date | null;
  replayHash: string | null; // Hash of replay for verification
}

/**
 * Competition Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName?: string;
  score: number;
  pnlPct: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  trades: number;
  submittedAt: Date;
  strategyHash: string;
  isCurrentUser?: boolean;
}

/**
 * Competition Score Breakdown
 */
export interface ScoreBreakdown {
  totalScore: number;
  pnlScore: number; // 40% weight
  winRateScore: number; // 20% weight
  profitFactorScore: number; // 10% weight
  drawdownPenalty: number; // -15% weight
  stabilityScore: number; // 20% weight
  consistencyBonus: number;
}

/**
 * Deterministic Run Options
 */
export interface DeterministicRunOptions {
  seed: string;
  slippage: number; // Fixed slippage in bps
  commission: number; // Fixed commission in bps
  executionDelay: number; // Fixed delay in ms
  priceRounding: number; // Decimal places
  candles: any[]; // Preloaded candles
}

/**
 * Replay Validation Result
 */
export interface ReplayValidationResult {
  valid: boolean;
  originalScore: number;
  replayedScore: number;
  deviation: number;
  tolerance: number;
  errors: string[];
}

/**
 * Prize Distribution
 */
export interface PrizeDistribution {
  first: number; // 60%
  second: number; // 25%
  third: number; // 10%
  house: number; // 5%
}

