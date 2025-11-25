// =====================================================================
// CHAPTER 9: Competition Entry Card
// =====================================================================

'use client';

import React from 'react';
import type { Competition } from '@/lib/competition/types';

interface CompetitionEntryCardProps {
  competition: Competition;
  onClick: () => void;
}

export function CompetitionEntryCard({ competition, onClick }: CompetitionEntryCardProps) {
  const now = new Date();
  const isActive = competition.status === 'active';
  const timeRemaining = isActive
    ? Math.max(0, competition.endTime.getTime() - now.getTime())
    : 0;

  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const progress = isActive
    ? ((now.getTime() - competition.startTime.getTime()) /
        (competition.endTime.getTime() - competition.startTime.getTime())) *
      100
    : 0;

  return (
    <div
      className="competition-card bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{competition.name}</h3>
          <p className="text-sm text-gray-400">{competition.description}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            competition.status === 'active'
              ? 'bg-green-900 text-green-300'
              : competition.status === 'upcoming'
              ? 'bg-blue-900 text-blue-300'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {competition.status.toUpperCase()}
        </span>
      </div>

      {/* Prize Pool */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Prize Pool</div>
        <div className="text-2xl font-bold text-yellow-400">
          {competition.prizePool.toFixed(2)} SOL
        </div>
      </div>

      {/* Competition Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Symbol:</span>
          <span className="text-white">{competition.symbol}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Timeframe:</span>
          <span className="text-white">{competition.timeframe}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Entry Fee:</span>
          <span className="text-white">{competition.entryFee} SOL</span>
        </div>
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Time Remaining</span>
            <span>
              {hoursRemaining}h {minutesRemaining}m
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Enter Button */}
      <button
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        disabled={!isActive}
      >
        {isActive ? 'Enter Competition' : 'View Details'}
      </button>
    </div>
  );
}

