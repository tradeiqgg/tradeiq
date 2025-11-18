'use client';

import { NeonCard } from './NeonCard';
import { NeonButton } from './NeonButton';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  strategyName: string;
  creator: string;
  pnl24h: number;
}

const mockData: LeaderboardEntry[] = [
  { rank: 1, strategyName: 'Momentum MA Cross', creator: 'BavM...xBRE', pnl24h: 12450.32 },
  { rank: 2, strategyName: 'RSI Divergence', creator: '7xKp...mN9Q', pnl24h: 9876.54 },
  { rank: 3, strategyName: 'Volume Breakout', creator: '9wF2...hR4T', pnl24h: 8234.12 },
  { rank: 4, strategyName: 'Mean Reversion', creator: '3mL8...pX7Y', pnl24h: 6543.21 },
  { rank: 5, strategyName: 'Trend Following', creator: '5nQ9...kL2M', pnl24h: 5432.10 },
];

export function LeaderboardPreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-semibold text-white">
          Top Performers
        </h2>
        <Link href="/leaderboard">
          <NeonButton variant="outline" size="sm">
            View Full Leaderboard →
          </NeonButton>
        </Link>
      </div>
      <NeonCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1f22]">
                <th className="text-left py-4 px-4 text-xs font-sans font-semibold uppercase tracking-wider text-white">
                  Rank
                </th>
                <th className="text-left py-4 px-4 text-xs font-sans font-semibold uppercase tracking-wider text-white">
                  Strategy
                </th>
                <th className="text-left py-4 px-4 text-xs font-sans font-semibold uppercase tracking-wider text-white">
                  Creator
                </th>
                <th className="text-right py-4 px-4 text-xs font-sans font-semibold uppercase tracking-wider text-white">
                  24h PnL
                </th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((entry, idx) => (
                <tr
                  key={entry.rank}
                  className={`border-b border-[#1e1f22] transition-colors ${
                    idx % 2 === 0 ? 'bg-[#111214]' : 'bg-[#151618]'
                  } hover:bg-[#1e1f22]`}
                >
                  <td className="py-4 px-4 font-sans text-sm">
                    <span
                      className={
                        entry.rank === 1
                          ? 'text-[#7CFF4F] font-bold'
                          : entry.rank <= 3
                          ? 'text-[#5CFF8C]'
                          : 'text-[#A9A9B3]'
                      }
                    >
                      #{entry.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-sans text-sm text-white">
                    {entry.strategyName}
                  </td>
                  <td className="py-4 px-4 font-sans text-xs text-[#A9A9B3]">
                    {entry.creator}
                  </td>
                  <td className="py-4 px-4 font-sans text-sm text-right font-semibold">
                    <span className={entry.pnl24h >= 0 ? 'text-[#7CFF4F]' : 'text-[#FF617D]'}>
                      ${entry.pnl24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeonCard>
    </div>
  );
}

