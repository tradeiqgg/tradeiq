// =====================================================================
// CHAPTER 9: Competition Timer
// =====================================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { Competition } from '@/lib/competition/types';

interface CompetitionTimerProps {
  competition: Competition;
}

export function CompetitionTimer({ competition }: CompetitionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, competition.endTime.getTime() - now.getTime());
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [competition.endTime]);

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  if (competition.status !== 'active') {
    return (
      <div className="competition-timer text-center">
        <span className="text-gray-400">
          {competition.status === 'upcoming' ? 'Competition starts soon' : 'Competition ended'}
        </span>
      </div>
    );
  }

  return (
    <div className="competition-timer text-center">
      <div className="text-sm text-gray-400 mb-2">Competition ends in</div>
      <div className="flex items-center justify-center gap-4 text-2xl font-bold">
        {days > 0 && (
          <span className="bg-gray-700 px-3 py-2 rounded">
            {String(days).padStart(2, '0')}d
          </span>
        )}
        <span className="bg-gray-700 px-3 py-2 rounded">
          {String(hours).padStart(2, '0')}h
        </span>
        <span className="bg-gray-700 px-3 py-2 rounded">
          {String(minutes).padStart(2, '0')}m
        </span>
        <span className="bg-gray-700 px-3 py-2 rounded">
          {String(seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
}

