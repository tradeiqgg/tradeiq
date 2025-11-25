// =====================================================================
// CHAPTER 9: Leaderboard Engine
// =====================================================================

import type { LeaderboardEntry, CompetitionSubmission } from './types';
import { compareScores } from './scoring';

/**
 * Build leaderboard from submissions
 */
export function buildLeaderboard(
  submissions: CompetitionSubmission[],
  currentUserId?: string
): LeaderboardEntry[] {
  // Sort submissions using compareScores logic
  const sorted = [...submissions].sort((a, b) => {
    return compareScores(
      { totalScore: a.score } as any,
      { totalScore: b.score } as any,
      a.pnlPct,
      b.pnlPct,
      a.maxDrawdown,
      b.maxDrawdown,
      a.submittedAt,
      b.submittedAt
    );
  });

  // Convert to leaderboard entries
  return sorted.map((submission, index) => ({
    rank: index + 1,
    userId: submission.userId,
    score: submission.score,
    pnlPct: submission.pnlPct,
    winRate: submission.winRate,
    profitFactor: submission.profitFactor,
    maxDrawdown: submission.maxDrawdown,
    trades: submission.resultJson?.trades.length || 0,
    submittedAt: submission.submittedAt,
    strategyHash: submission.strategyHash,
    isCurrentUser: currentUserId === submission.userId,
  }));
}

/**
 * Get user's rank in leaderboard
 */
export function getUserRank(
  leaderboard: LeaderboardEntry[],
  userId: string
): number | null {
  const entry = leaderboard.find((e) => e.userId === userId);
  return entry ? entry.rank : null;
}

/**
 * Get entries around user (for pagination)
 */
export function getEntriesAroundUser(
  leaderboard: LeaderboardEntry[],
  userId: string,
  contextSize: number = 5
): LeaderboardEntry[] {
  const userIndex = leaderboard.findIndex((e) => e.userId === userId);
  if (userIndex === -1) return [];

  const start = Math.max(0, userIndex - contextSize);
  const end = Math.min(leaderboard.length, userIndex + contextSize + 1);

  return leaderboard.slice(start, end);
}

