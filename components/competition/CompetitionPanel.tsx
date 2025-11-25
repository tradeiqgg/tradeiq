// =====================================================================
// CHAPTER 9: Competition Panel - Main Container
// =====================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { CompetitionOverview } from './CompetitionOverview';
import { CompetitionLeaderboard } from './CompetitionLeaderboard';
import { CompetitionSubmitModal } from './CompetitionSubmitModal';
import { CompetitionReplayViewer } from './CompetitionReplayViewer';
import { CompetitionRules } from './CompetitionRules';
import { CompetitionTimer } from './CompetitionTimer';
import { CompetitionTabs } from './CompetitionTabs';
import type { Competition } from '@/lib/competition/types';

export function CompetitionPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'submit' | 'replay' | 'rules'>('overview');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load active competitions
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      // const active = await getActiveCompetitions();
      // setCompetitions(active);
      // Mock data for now
      setCompetitions([]);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="competition-panel flex items-center justify-center h-full">
        <div className="text-gray-400">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="competition-panel h-full flex flex-col">
      {/* Timer */}
      {selectedCompetition && (
        <div className="competition-timer-section border-b border-gray-700 p-4">
          <CompetitionTimer competition={selectedCompetition} />
        </div>
      )}

      {/* Tabs */}
      <CompetitionTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="competition-content flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <CompetitionOverview
            competitions={competitions}
            onSelectCompetition={setSelectedCompetition}
          />
        )}
        {activeTab === 'leaderboard' && selectedCompetition && (
          <CompetitionLeaderboard competitionId={selectedCompetition.id} />
        )}
        {activeTab === 'submit' && selectedCompetition && (
          <CompetitionSubmitModal
            competition={selectedCompetition}
            onClose={() => setActiveTab('overview')}
          />
        )}
        {activeTab === 'replay' && selectedCompetition && (
          <CompetitionReplayViewer competitionId={selectedCompetition.id} />
        )}
        {activeTab === 'rules' && (
          <CompetitionRules />
        )}
      </div>
    </div>
  );
}

