'use client';

import { ReactNode } from 'react';
import { NeonCard } from './NeonCard';

interface TokenUtilityCardProps {
  number: string;
  title: string;
  description: string;
  className?: string;
}

export function TokenUtilityCard({ number, title, description, className = '' }: TokenUtilityCardProps) {
  return (
    <NeonCard className={className}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 border border-primary/50 bg-primary/5 flex items-center justify-center font-mono text-primary font-bold">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-mono uppercase tracking-wider text-primary mb-2 glow-lime">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground font-mono leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </NeonCard>
  );
}

