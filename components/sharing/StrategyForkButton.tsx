'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StrategyForkButtonProps {
  strategyId: string;
  userId: string | null;
  onFork?: (newStrategyId: string) => void;
}

export function StrategyForkButton({
  strategyId,
  userId,
  onFork,
}: StrategyForkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFork = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/strategy/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalStrategyId: strategyId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fork strategy');
      }

      const { strategy } = await response.json();
      onFork?.(strategy.id);
      router.push(`/strategy/${strategy.id}`);
    } catch (error) {
      console.error('Failed to fork strategy:', error);
      alert('Failed to fork strategy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFork}
      disabled={!userId || isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all
        bg-[#1e1f22] text-[#A9A9B3] border border-[#1e1f22] hover:border-[#7CFF4F]/40
        ${!userId || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
      <span>{isLoading ? 'Forking...' : 'Fork Strategy'}</span>
    </button>
  );
}

