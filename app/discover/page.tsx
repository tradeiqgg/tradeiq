'use client';

import { useEffect, useState } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { StrategyGallery } from '@/components/strategyLibrary';
import { NeonCard } from '@/components/ui/NeonCard';
import type { Strategy } from '@/types';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [trending, setTrending] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'new' | 'popular'>('trending');

  useEffect(() => {
    loadStrategies();
  }, [activeFilter]);

  const loadStrategies = async () => {
    setIsLoading(true);
    try {
      if (activeFilter === 'trending') {
        const response = await fetch('/api/discover/trending?limit=20');
        if (response.ok) {
          const { strategies: data } = await response.json();
          setTrending(data || []);
          setStrategies(data || []);
        }
      } else {
        const sort = activeFilter === 'new' ? 'created_at' : 'likes_count';
        const response = await fetch(`/api/discover/search?sort=${sort}&limit=20`);
        if (response.ok) {
          const { strategies: data } = await response.json();
          setStrategies(data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadStrategies();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/discover/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      if (response.ok) {
        const { strategies: data } = await response.json();
        setStrategies(data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-white">
            Discover Strategies
          </h1>
          <p className="text-[#A9A9B3] font-sans">
            Explore trading strategies created by the community
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search strategies..."
            className="flex-1 bg-[#111214] border border-[#1e1f22] rounded-lg px-4 py-3 text-white font-sans placeholder-[#A9A9B3] focus:outline-none focus:border-[#7CFF4F]/40"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans font-medium hover:bg-[#70e84b] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'trending', label: 'Trending' },
            { id: 'new', label: 'New' },
            { id: 'popular', label: 'Most Liked' },
            { id: 'all', label: 'All' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`
                px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors whitespace-nowrap
                ${activeFilter === filter.id
                  ? 'bg-[#7CFF4F] text-[#0B0B0C]'
                  : 'bg-[#1e1f22] text-[#A9A9B3] hover:bg-[#252628]'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Trending Section */}
        {activeFilter === 'trending' && trending.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-white">
              Trending This Week
            </h2>
            <StrategyGallery strategies={trending} isLoading={isLoading} />
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-semibold text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Strategies'}
          </h2>
          <StrategyGallery strategies={strategies} isLoading={isLoading} />
        </div>
      </div>
    </LayoutShell>
  );
}

