// =====================================================================
// CHAPTER 9: Competition Scoring Engine
// =====================================================================

import type { ScoreBreakdown } from './types';
import type { BacktestResult } from '@/lib/backtester/types';

/**
 * Calculate competition score from backtest result
 */
export function calculateCompetitionScore(result: BacktestResult): ScoreBreakdown {
  const summary = result.summary;

  // PnL Score (40% weight)
  const pnlScore = Math.max(0, result.pnlPct * 0.4);

  // Win Rate Score (20% weight)
  const winRateScore = (summary.winRate / 100) * 20;

  // Profit Factor Score (10% weight)
  const profitFactor = calculateProfitFactor(summary);
  const profitFactorScore = Math.min(profitFactor * 10, 10);

  // Drawdown Penalty (-15% weight)
  const drawdownPenalty = Math.max(0, result.maxDrawdownPct * -0.15);

  // Stability Score (20% weight)
  const stabilityScore = calculateStabilityScore(result.equityCurve) * 20;

  // Consistency Bonus
  const consistencyBonus = calculateConsistencyBonus(result);

  const totalScore =
    pnlScore +
    winRateScore +
    profitFactorScore +
    drawdownPenalty +
    stabilityScore +
    consistencyBonus;

  return {
    totalScore: Math.max(0, totalScore), // Never negative
    pnlScore,
    winRateScore,
    profitFactorScore,
    drawdownPenalty,
    stabilityScore,
    consistencyBonus,
  };
}

/**
 * Calculate profit factor
 */
function calculateProfitFactor(summary: any): number {
  if (summary.averageLoss === 0) {
    return summary.averageWin > 0 ? 10 : 0; // Infinite profit factor capped at 10
  }
  return Math.abs(summary.averageWin / summary.averageLoss);
}

/**
 * Calculate stability score based on equity curve volatility
 */
function calculateStabilityScore(equityCurve: Array<{ time: number; equity: number }>): number {
  if (equityCurve.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prevEquity = equityCurve[i - 1].equity;
    const currEquity = equityCurve[i].equity;
    if (prevEquity > 0) {
      returns.push((currEquity - prevEquity) / prevEquity);
    }
  }

  if (returns.length === 0) return 0;

  // Calculate coefficient of variation (lower is better)
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (mean === 0) return 0;

  const coefficientOfVariation = Math.abs(stdDev / mean);
  // Lower CV = higher stability score (inverse relationship)
  return Math.max(0, 1 - coefficientOfVariation);
}

/**
 * Calculate consistency bonus
 */
function calculateConsistencyBonus(result: BacktestResult): number {
  // Bonus for consistent profitability
  const profitableTrades = result.trades.filter((t) => t.profit > 0).length;
  const totalTrades = result.trades.length;

  if (totalTrades === 0) return 0;

  const profitableRatio = profitableTrades / totalTrades;

  // Bonus increases with consistency
  if (profitableRatio >= 0.7) return 5; // 70%+ win rate bonus
  if (profitableRatio >= 0.6) return 3; // 60%+ win rate bonus
  if (profitableRatio >= 0.5) return 1; // 50%+ win rate bonus

  return 0;
}

/**
 * Compare two scores for leaderboard ranking
 */
export function compareScores(
  a: ScoreBreakdown,
  b: ScoreBreakdown,
  aPnl: number,
  bPnl: number,
  aDrawdown: number,
  bDrawdown: number,
  aSubmittedAt: Date,
  bSubmittedAt: Date
): number {
  // Primary: Total score
  if (a.totalScore !== b.totalScore) {
    return b.totalScore - a.totalScore; // Higher is better
  }

  // Secondary: PnL
  if (aPnl !== bPnl) {
    return bPnl - aPnl; // Higher is better
  }

  // Tertiary: Lower drawdown
  if (aDrawdown !== bDrawdown) {
    return aDrawdown - bDrawdown; // Lower is better
  }

  // Quaternary: Earlier submission wins
  return aSubmittedAt.getTime() - bSubmittedAt.getTime();
}

