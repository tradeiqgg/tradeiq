'use client';

import { useState } from 'react';
import { NeonCard } from './NeonCard';

interface ExpandableTokenCardProps {
  number: string;
  title: string;
  description: string;
  expandedContent: string;
  className?: string;
}

export function ExpandableTokenCard({
  number,
  title,
  description,
  expandedContent,
  className = '',
}: ExpandableTokenCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <NeonCard
        className={`cursor-pointer transition-all duration-300 ${isExpanded ? 'border-[#7CFF4F]/60' : ''} ${className}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 border border-[#7CFF4F]/40 bg-[#7CFF4F]/10 rounded-md flex items-center justify-center font-display font-bold text-[#7CFF4F]">
            {number}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-display font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
              {description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#7CFF4F] font-sans font-medium">
              <span>{isExpanded ? '▼' : '▶'}</span>
              <span>{isExpanded ? 'Hide Details' : 'Learn More'}</span>
            </div>
          </div>
        </div>
      </NeonCard>

      {isExpanded && (
        <div className="mt-4 p-6 bg-[#111214] border border-[#7CFF4F]/30 rounded-lg animate-fade-in shadow-[0_0_20px_rgba(124,255,79,0.1)]">
          <div className="space-y-6">
            <h4 className="text-lg font-display font-semibold text-white mb-2">
              Detailed Mechanics
            </h4>
            <div className="text-sm text-[#A9A9B3] font-sans leading-relaxed space-y-4">
              {expandedContent.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <div className="pt-4 border-t border-[#1e1f22]">
              <div className="flex flex-wrap gap-4 text-sm font-sans">
                <a 
                  href="/docs/token" 
                  className="text-[#7CFF4F] hover:text-[#5CFF8C] transition-colors underline"
                >
                  📖 Read Documentation →
                </a>
                <a 
                  href="/tokenomics" 
                  className="text-[#7CFF4F] hover:text-[#5CFF8C] transition-colors underline"
                >
                  📊 View Tokenomics →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

