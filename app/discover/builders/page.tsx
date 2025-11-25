'use client';

import { useEffect, useState, useCallback } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { NeonCard } from '@/components/ui/NeonCard';
import Link from 'next/link';
import type { User } from '@/types';

interface Builder extends User {
  total_likes?: number;
  strategy_count?: number;
}

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'xp' | 'strategies' | 'likes'>('xp');

  const loadBuilders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discover/builders?sort=${sortBy}&limit=50`);
      if (response.ok) {
        const { builders: data } = await response.json();
        setBuilders(data || []);
      }
    } catch (error) {
      console.error('Failed to load builders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadBuilders();
  }, [loadBuilders]);

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-white">
            Top Builders
          </h1>
          <p className="text-[#A9A9B3] font-sans">
            Discover the most active strategy creators
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          {[
            { id: 'xp', label: 'Builder XP' },
            { id: 'strategies', label: 'Strategies' },
            { id: 'likes', label: 'Total Likes' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as any)}
              className={`
                px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors
                ${sortBy === option.id
                  ? 'bg-[#7CFF4F] text-[#0B0B0C]'
                  : 'bg-[#1e1f22] text-[#A9A9B3] hover:bg-[#252628]'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Builders List */}
        {isLoading ? (
          <div className="text-center py-12 text-[#A9A9B3] font-sans">Loading builders...</div>
        ) : builders.length === 0 ? (
          <div className="text-center py-12 text-[#A9A9B3] font-sans">No builders found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builders.map((builder, index) => (
              <Link key={builder.id} href={`/u/${builder.username || builder.wallet_address}`}>
                <NeonCard className="flex items-center gap-4">
                  <div className="text-2xl font-display font-bold text-[#7CFF4F] w-12 text-center">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-white mb-1">
                      {builder.username || builder.wallet_address?.slice(0, 8)}
                    </h3>
                    <div className="flex gap-4 text-sm text-[#A9A9B3] font-sans">
                      <span>{builder.strategy_count || 0} strategies</span>
                      <span>{builder.total_likes || 0} likes</span>
                      <span>{builder.builder_xp || 0} XP</span>
                    </div>
                  </div>
                </NeonCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

