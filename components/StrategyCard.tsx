'use client';

import Link from 'next/link';
import type { Strategy } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <Link href={`/strategy/${strategy.id}`}>
      <div className="terminal-panel p-4 cursor-pointer neon-hover transition-all">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-mono font-semibold text-sm uppercase tracking-wider text-primary">
            {strategy.title || 'UNTITLED STRATEGY'}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {formatDistanceToNow(new Date(strategy.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 font-mono">
          {strategy.raw_prompt}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono pt-2 border-t border-border/50">
          <span className="text-primary">BLOCKS:</span>
          <span>{Object.keys(strategy.block_schema || {}).length}</span>
          <span className="text-primary">|</span>
          <span className="text-primary">NODES:</span>
          <span>{Object.keys(strategy.json_logic || {}).length}</span>
        </div>
      </div>
    </Link>
  );
}

