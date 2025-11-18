'use client';

import { useEffect } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useCompetitionStore } from '@/stores/competitionStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CompetitionsPage() {
  const [mounted, setMounted] = useState(false);
  const { connected, connecting } = useWalletSafe();
  const router = useRouter();
  const { user } = useAuthStore();
  const { competitions, entries, fetchCompetitions, fetchEntries, joinCompetition, isLoading } =
    useCompetitionStore();
  const { strategies, fetchStrategies } = useStrategyStore();
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!connected && !connecting) {
      router.replace('/');
      return;
    }
    fetchCompetitions();
    if (user?.id) {
      fetchStrategies(user.id);
    }
  }, [connected, router, fetchCompetitions, user?.id, fetchStrategies]);

  useEffect(() => {
    if (selectedCompetition) {
      fetchEntries(selectedCompetition);
    }
  }, [selectedCompetition, fetchEntries]);

  const handleJoin = async () => {
    if (!selectedCompetition || !selectedStrategy || !user) return;

    try {
      await joinCompetition(selectedCompetition, selectedStrategy, user.id);
      alert('Successfully joined competition!');
      fetchEntries(selectedCompetition);
    } catch (error) {
      console.error('Failed to join competition:', error);
      alert('Failed to join competition');
    }
  };

  if (!connected || !user) {
    return null;
  }

  const activeCompetitions = competitions.filter((c) => c.status === 'active');
  const upcomingCompetitions = competitions.filter((c) => c.status === 'upcoming');

  return (
    <LayoutShell>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="terminal-section-header">== COMPETITIONS ==</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Join weekly competitions and compete for real SOL prizes.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-mono">
            <span className="terminal-spinner" /> Loading competitions...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Competitions */}
            {activeCompetitions.length > 0 && (
              <div>
                <h2 className="terminal-section-header">ACTIVE COMPETITIONS</h2>
                <div className="space-y-4">
                  {activeCompetitions.map((competition) => (
                    <div
                      key={competition.id}
                      className="terminal-panel p-6 neon-hover"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-mono uppercase tracking-wider mb-2 text-primary">{competition.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            PRIZE POOL: <span className="text-primary glow-lime">{competition.prize_pool} SOL</span>
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            ENDS: {new Date(competition.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 border border-primary bg-primary/10 text-primary text-xs font-mono uppercase">
                          ACTIVE
                        </span>
                      </div>

                      {selectedCompetition === competition.id && (
                        <div className="mt-4 p-4 terminal-panel border-accent/30">
                          <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                                SELECT STRATEGY
                              </label>
                              <select
                                value={selectedStrategy}
                                onChange={(e) => setSelectedStrategy(e.target.value)}
                                className="terminal-input w-full"
                              >
                                <option value="">Choose a strategy...</option>
                                {strategies.map((strategy) => (
                                  <option key={strategy.id} value={strategy.id}>
                                    {strategy.title || 'Untitled Strategy'}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={handleJoin}
                                disabled={!selectedStrategy || isLoading}
                                className="terminal-button"
                              >
                                {isLoading ? <span className="terminal-spinner" /> : 'JOIN COMPETITION'}
                              </button>
                            </div>
                          </div>

                          {entries.length > 0 && (
                            <div>
                              <h4 className="text-xs font-mono uppercase tracking-wider text-primary mb-2">LEADERBOARD</h4>
                              <div className="space-y-2">
                                {entries.slice(0, 10).map((entry, idx) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-2 terminal-panel border-border/50 hover:border-primary/30 transition-all"
                                  >
                                    <span className="text-xs font-mono">
                                      #{idx + 1} USER {entry.user_id.slice(0, 8)}...
                                    </span>
                                    <span
                                      className={`font-mono font-semibold ${
                                        entry.pnl >= 0 ? 'text-primary glow-lime' : 'text-destructive'
                                      }`}
                                    >
                                      ${entry.pnl.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setSelectedCompetition(
                            selectedCompetition === competition.id ? '' : competition.id
                          )
                        }
                        className="mt-4 terminal-button"
                      >
                        {selectedCompetition === competition.id ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Competitions */}
            {upcomingCompetitions.length > 0 && (
              <div>
                <h2 className="terminal-section-header">UPCOMING</h2>
                <div className="space-y-4">
                  {upcomingCompetitions.map((competition) => (
                    <div
                      key={competition.id}
                      className="terminal-panel p-6 opacity-75"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-mono uppercase tracking-wider mb-2 text-muted-foreground">{competition.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            STARTS: {new Date(competition.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            PRIZE POOL: {competition.prize_pool} SOL
                          </p>
                        </div>
                        <span className="px-3 py-1 border border-border text-muted-foreground text-xs font-mono uppercase">
                          UPCOMING
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {competitions.length === 0 && (
              <div className="text-center py-12 terminal-panel">
                <p className="text-muted-foreground font-mono">NO COMPETITIONS AVAILABLE AT THE MOMENT.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

