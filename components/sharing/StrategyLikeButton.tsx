'use client';

import { useState, useEffect } from 'react';

interface StrategyLikeButtonProps {
  strategyId: string;
  userId: string | null;
  initialLiked?: boolean;
  initialCount?: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export function StrategyLikeButton({
  strategyId,
  userId,
  initialLiked = false,
  initialCount = 0,
  onLikeChange,
}: StrategyLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleClick = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;

    // Optimistic update
    setLiked(newLiked);
    setCount(newCount);
    onLikeChange?.(newLiked, newCount);

    try {
      if (newLiked) {
        await fetch('/api/strategy/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strategyId, userId }),
        });
      } else {
        await fetch(`/api/strategy/like?strategyId=${strategyId}&userId=${userId}`, {
          method: 'DELETE',
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setLiked(!newLiked);
      setCount(count);
      onLikeChange?.(!newLiked, count);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!userId || isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all
        ${liked
          ? 'bg-[#7CFF4F]/20 text-[#7CFF4F] border border-[#7CFF4F]/30'
          : 'bg-[#1e1f22] text-[#A9A9B3] border border-[#1e1f22] hover:border-[#7CFF4F]/40'
        }
        ${!userId ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <svg
        className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}

