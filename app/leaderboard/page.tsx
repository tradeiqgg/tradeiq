'use client';

import { useEffect, useState } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { useBacktestStore } from '@/stores/backtestStore';
import { useAuthStore } from '@/stores/authStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  const { connected, connecting } = useWalletSafe();
  const router = useRouter();
  const { user } = useAuthStore();
  const { backtests, fetchBacktests, isLoading } = useBacktestStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!connected && !connecting) {
      router.replace('/');
      return;
    }
    // TODO: Fetch global leaderboard from all users, not just current user
    if (user?.id) {
      fetchBacktests(user.id);
    }
  }, [connected, connecting, mounted, router, user?.id, fetchBacktests]);

  if (!mounted || !connected || !user) {
    return null;
  }

  // Sort by PnL descending
  const sortedBacktests = [...backtests].sort((a, b) => b.pnl - a.pnl);

  return (
    <LayoutShell>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="terminal-section-header">== LEADERBOARD ==</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Top performers ranked by profit and loss from backtests.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-mono">
            <span className="terminal-spinner" /> Loading leaderboard...
          </div>
        ) : sortedBacktests.length === 0 ? (
          <div className="text-center py-12 terminal-panel">
            <p className="text-muted-foreground font-mono">NO BACKTEST RESULTS YET.</p>
          </div>
        ) : (
          <div className="terminal-panel overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-primary">RANK</th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-primary">STRATEGY</th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-primary">ASSET</th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-primary">TRADES</th>
                  <th className="px-6 py-3 text-right text-xs font-mono uppercase tracking-wider text-primary">PNL</th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-primary">DATE</th>
                </tr>
              </thead>
              <tbody>
                {sortedBacktests.map((backtest, idx) => (
                  <tr
                    key={backtest.id}
                    className={`border-t border-border transition-all ${
                      idx < 3 ? 'bg-primary/5' : ''
                    } hover:bg-primary/10 hover:border-primary/30`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`font-mono font-bold ${
                          idx === 0
                            ? 'text-primary glow-lime text-lg'
                            : idx === 1
                            ? 'text-accent text-base'
                            : idx === 2
                            ? 'text-primary/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{backtest.strategy_id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-mono">{backtest.chart_asset}</td>
                    <td className="px-6 py-4 text-sm font-mono">{backtest.trades.length}</td>
                    <td
                      className={`px-6 py-4 text-right font-mono font-semibold ${
                        backtest.pnl >= 0 ? 'text-primary glow-lime' : 'text-destructive'
                      }`}
                    >
                      ${backtest.pnl.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {new Date(backtest.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

