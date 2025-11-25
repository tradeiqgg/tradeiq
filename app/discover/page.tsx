'use client';

import { useEffect, useState, useRef } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { StrategyGallery } from '@/components/strategyLibrary';
import { browserClient as supabase } from '@/lib/supabase/browserClient';
import type { Strategy } from '@/types';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [trending, setTrending] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'new' | 'popular'>('trending');
  
  // FIXED: Use ref to prevent infinite loops from re-fetching
  const hasLoadedRef = useRef(false);

  // FIXED: Fetch public strategies directly from browser client
  // This works for both authenticated and unauthenticated users
  const fetchDiscoverStrategies = async (filter: typeof activeFilter = 'trending', query?: string) => {
    try {
      setIsLoading(true);
      
      let supabaseQuery = supabase
        .from('strategies')
        .select('id, title, tags, description, user_id, created_at, likes_count, comments_count, visibility')
        .eq('visibility', 'public'); // CRITICAL: Only fetch public strategies

      // Apply search query if provided
      if (query && query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      // Apply sorting based on filter
      if (filter === 'trending') {
        // Trending: Most liked in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        supabaseQuery = supabaseQuery
          .gte('created_at', weekAgo.toISOString())
          .order('likes_count', { ascending: false })
          .order('comments_count', { ascending: false });
      } else if (filter === 'new') {
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      } else if (filter === 'popular') {
        supabaseQuery = supabaseQuery.order('likes_count', { ascending: false });
      } else {
        // 'all' - just order by created_at
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      }

      const { data, error } = await supabaseQuery.limit(20);

      if (error) {
        console.error('Failed to fetch strategies:', error);
        throw error;
      }

      // CRITICAL FIX: Normalize JSON to prevent infinite re-renders
      // This deep clones the data and ensures stable object references
      const normalized = data ? JSON.parse(JSON.stringify(data)) : [];
      
      if (filter === 'trending') {
        setTrending(normalized);
        setStrategies(normalized);
      } else {
        setStrategies(normalized);
      }
    } catch (error) {
      console.error('Failed to load strategies:', error);
      setStrategies([]);
      setTrending([]);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Load strategies on mount only (empty dependency array)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchDiscoverStrategies('trending');
    }
  }, []); // Empty dependency array - only run once on mount

  // FIXED: Load strategies when filter changes (but prevent infinite loops)
  const previousFilterRef = useRef(activeFilter);
  
  useEffect(() => {
    // Only fetch if filter actually changed and initial load is complete
    if (previousFilterRef.current !== activeFilter && hasLoadedRef.current) {
      previousFilterRef.current = activeFilter;
      // When filter changes, clear search query and fetch fresh
      fetchDiscoverStrategies(activeFilter);
    }
  }, [activeFilter]); // Only depend on activeFilter

  const loadStrategies = async () => {
    await fetchDiscoverStrategies(activeFilter, searchQuery);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      await fetchDiscoverStrategies(activeFilter);
      return;
    }

    // Use the same fetch function with search query
    await fetchDiscoverStrategies(activeFilter, searchQuery);
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

