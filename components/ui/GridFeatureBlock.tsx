'use client';

import { ReactNode } from 'react';
import { NeonCard } from './NeonCard';

interface GridFeatureBlockProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function GridFeatureBlock({ icon, title, description, className = '' }: GridFeatureBlockProps) {
  return (
    <NeonCard className={`text-center ${className}`}>
      <div className="text-4xl mb-6 flex justify-center text-white/80">{icon}</div>
      <h3 className="text-lg font-display font-semibold text-white mb-3">
        {title}
      </h3>
      <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
        {description}
      </p>
    </NeonCard>
  );
}

