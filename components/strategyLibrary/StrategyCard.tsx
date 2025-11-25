'use client';

import Link from 'next/link';
import { NeonCard } from '@/components/ui/NeonCard';
import type { Strategy, User } from '@/types';

interface StrategyCardProps {
  strategy: Strategy & { user?: User };
  showAuthor?: boolean;
}

export function StrategyCard({ strategy, showAuthor = true }: StrategyCardProps) {
  const authorName = strategy.user?.username || strategy.user?.wallet_address?.slice(0, 8) || 'Anonymous';
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Link href={`/strategy/${strategy.id}`}>
      <NeonCard className="flex flex-col h-full">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-display font-semibold text-white line-clamp-2 flex-1">
              {strategy.title || 'Untitled Strategy'}
            </h3>
            {strategy.is_featured && (
              <span className="ml-2 px-2 py-1 bg-[#7CFF4F]/20 text-[#7CFF4F] text-xs font-sans rounded">
                Featured
              </span>
            )}
          </div>

          {/* Description */}
          {strategy.description && (
            <p className="text-sm text-[#A9A9B3] font-sans line-clamp-2 mb-3">
              {strategy.description}
            </p>
          )}

          {/* Tags */}
          {strategy.tags && strategy.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {strategy.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-[#1e1f22] text-xs text-[#A9A9B3] font-sans rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          {showAuthor && strategy.user && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#1e1f22] flex items-center justify-center text-xs text-[#7CFF4F]">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-[#A9A9B3] font-sans">
                {authorName}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-[#A9A9B3] font-sans mb-3">
            {strategy.likes_count !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {strategy.likes_count}
              </span>
            )}
            {strategy.comments_count !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {strategy.comments_count}
              </span>
            )}
            {strategy.forked_from && (
              <span className="flex items-center gap-1 text-[#7CFF4F]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Fork
              </span>
            )}
          </div>

          {/* Date */}
          <div className="text-xs text-[#A9A9B3]/70 font-mono">
            {formatDate(strategy.created_at)}
          </div>
        </div>
      </NeonCard>
    </Link>
  );
}

