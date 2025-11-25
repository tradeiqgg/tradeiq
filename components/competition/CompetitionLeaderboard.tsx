// =====================================================================
// CHAPTER 9: Competition Leaderboard
// =====================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { LeaderboardEntry } from '@/lib/competition/types';
import { getCompetitionLeaderboard } from '@/lib/competition';

interface CompetitionLeaderboardProps {
  competitionId: string;
}

export function CompetitionLeaderboard({ competitionId }: CompetitionLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await getCompetitionLeaderboard(competitionId);
      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  if (loading) {
    return (
      <div className="competition-leaderboard p-6">
        <div className="text-gray-400">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="competition-leaderboard p-6">
      <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-sm font-medium text-gray-400">Rank</th>
              <th className="text-left p-3 text-sm font-medium text-gray-400">User</th>
              <th className="text-right p-3 text-sm font-medium text-gray-400">Score</th>
              <th className="text-right p-3 text-sm font-medium text-gray-400">PnL %</th>
              <th className="text-right p-3 text-sm font-medium text-gray-400">Win Rate</th>
              <th className="text-right p-3 text-sm font-medium text-gray-400">PF</th>
              <th className="text-right p-3 text-sm font-medium text-gray-400">Drawdown</th>
              <th className="text-center p-3 text-sm font-medium text-gray-400">Replay</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={entry.userId}
                className={`border-b border-gray-800 hover:bg-gray-800 ${
                  entry.isCurrentUser ? 'bg-blue-900/20' : ''
                }`}
              >
                <td className="p-3">
                  <span className="font-bold">
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                    {!['🥇', '🥈', '🥉'].includes(String(entry.rank)) && `#${entry.rank}`}
                  </span>
                </td>
                <td className="p-3">
                  <span className={entry.isCurrentUser ? 'text-blue-400 font-medium' : 'text-white'}>
                    {entry.userName || `User ${entry.userId.slice(0, 8)}`}
                  </span>
                </td>
                <td className="p-3 text-right font-medium">{entry.score.toFixed(2)}</td>
                <td
                  className={`p-3 text-right ${
                    entry.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {entry.pnlPct >= 0 ? '+' : ''}
                  {entry.pnlPct.toFixed(2)}%
                </td>
                <td className="p-3 text-right">{entry.winRate.toFixed(1)}%</td>
                <td className="p-3 text-right">{entry.profitFactor.toFixed(2)}</td>
                <td className="p-3 text-right text-red-400">{entry.maxDrawdown.toFixed(2)}%</td>
                <td className="p-3 text-center">
                  <button
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => {
                      // Open replay viewer
                      console.log('Replay submission:', entry.strategyHash);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No submissions yet</p>
        </div>
      )}
    </div>
  );
}

