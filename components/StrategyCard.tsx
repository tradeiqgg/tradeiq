'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Strategy } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useStrategyStore } from '@/stores/strategyStore';

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteStrategy } = useStrategyStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    
    setIsDeleting(true);
    try {
      await deleteStrategy(strategy.id);
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      setIsDeleting(false);
    }
  };

  const blocksCount = strategy.block_schema?.blocks?.length || Object.keys(strategy.block_schema || {}).length || 0;
  const nodesCount = Object.keys(strategy.json_logic || {}).length;

  return (
    <Link href={`/strategy/${strategy.id}`}>
      <div className="terminal-panel p-4 cursor-pointer neon-hover transition-all group relative">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-mono font-semibold text-sm uppercase tracking-wider text-primary flex-1 pr-2">
            {strategy.title || 'UNTITLED STRATEGY'}
          </h3>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#FF617D] hover:text-[#FF617D]/80 text-xs font-mono px-2 py-1"
            title="Delete strategy"
          >
            {isDeleting ? '...' : '✕'}
          </button>
        </div>
        {strategy.raw_prompt && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 font-mono">
            {strategy.raw_prompt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono pt-2 border-t border-border/50">
          <span className="text-primary">BLOCKS:</span>
          <span>{blocksCount}</span>
          <span className="text-primary">|</span>
          <span className="text-primary">NODES:</span>
          <span>{nodesCount}</span>
          <span className="text-primary ml-auto">
            {formatDistanceToNow(new Date(strategy.updated_at || strategy.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}

