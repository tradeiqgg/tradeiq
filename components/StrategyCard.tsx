'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeonCard } from './ui/NeonCard';
import { useStrategyStore } from '@/stores/strategyStore';
import { STAGING_MODE } from '@/lib/config';
import { LockdownButton } from './Lockdown';
import type { Strategy } from '@/types';

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const router = useRouter();
  const { deleteStrategy } = useStrategyStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this strategy?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStrategy(strategy.id);
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      alert('Failed to delete strategy. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/strategy/${strategy.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <NeonCard onClick={handleCardClick} className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-display font-semibold text-white line-clamp-2 flex-1">
            {strategy.title || 'Untitled Strategy'}
          </h3>
          {STAGING_MODE ? (
            <LockdownButton
              feature="Strategy deletion"
              onClick={() => {}}
              className="ml-2 p-1 text-red-400 hover:text-red-300 opacity-50 cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </LockdownButton>
          ) : (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-2 p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              aria-label="Delete strategy"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {strategy.raw_prompt && (
          <p className="text-sm text-[#A9A9B3] font-sans line-clamp-2 mb-3">
            {strategy.raw_prompt}
          </p>
        )}

        <div className="text-xs text-[#A9A9B3]/70 font-mono mt-4">
          Created {formatDate(strategy.created_at)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#1e1f22]">
        <Link
          href={`/strategy/${strategy.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-[#7CFF4F] hover:text-[#70e84b] font-sans transition-colors inline-flex items-center gap-1"
        >
          View Strategy →
        </Link>
      </div>
    </NeonCard>
  );
}

