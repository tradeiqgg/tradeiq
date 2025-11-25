'use client';

import { StrategyCard } from './StrategyCard';
import type { Strategy } from '@/types';

interface StrategyGalleryProps {
  strategies: Strategy[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function StrategyGallery({
  strategies,
  isLoading = false,
  emptyMessage = 'No strategies found',
}: StrategyGalleryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#111214] border border-[#1e1f22] rounded-lg p-6 animate-pulse"
          >
            <div className="h-6 bg-[#1e1f22] rounded mb-3" />
            <div className="h-4 bg-[#1e1f22] rounded mb-2" />
            <div className="h-4 bg-[#1e1f22] rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A9A9B3] font-sans">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {strategies.map((strategy) => (
        <StrategyCard key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}

