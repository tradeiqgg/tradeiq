// =====================================================================
// CHAPTER 9: Competition Overview
// =====================================================================

'use client';

import React from 'react';
import { CompetitionEntryCard } from './CompetitionEntryCard';
import type { Competition } from '@/lib/competition/types';

interface CompetitionOverviewProps {
  competitions: Competition[];
  onSelectCompetition: (competition: Competition) => void;
}

export function CompetitionOverview({
  competitions,
  onSelectCompetition,
}: CompetitionOverviewProps) {
  const dailyCompetitions = competitions.filter((c) => c.type === 'daily');
  const weeklyCompetitions = competitions.filter((c) => c.type === 'weekly');
  const monthlyCompetitions = competitions.filter((c) => c.type === 'monthly');

  return (
    <div className="competition-overview p-6">
      <h2 className="text-2xl font-bold mb-6">Active Competitions</h2>

      {/* Daily Competitions */}
      {dailyCompetitions.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Daily Competitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyCompetitions.map((competition) => (
              <CompetitionEntryCard
                key={competition.id}
                competition={competition}
                onClick={() => onSelectCompetition(competition)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Weekly Competitions */}
      {weeklyCompetitions.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Weekly Competitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyCompetitions.map((competition) => (
              <CompetitionEntryCard
                key={competition.id}
                competition={competition}
                onClick={() => onSelectCompetition(competition)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Monthly Competitions */}
      {monthlyCompetitions.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Monthly Competitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyCompetitions.map((competition) => (
              <CompetitionEntryCard
                key={competition.id}
                competition={competition}
                onClick={() => onSelectCompetition(competition)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {competitions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No active competitions</p>
          <p className="text-sm">Check back soon for new competitions!</p>
        </div>
      )}
    </div>
  );
}

