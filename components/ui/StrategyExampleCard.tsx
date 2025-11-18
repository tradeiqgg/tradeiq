'use client';

import { NeonCard } from './NeonCard';
import { CodeBlock } from './CodeBlock';
import { AnimatedTerminal } from './AnimatedTerminal';
import { ScratchBlockBuilder } from './ScratchBlockBuilder';

interface StrategyExampleCardProps {
  title: string;
  description: string;
  example: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

export function StrategyExampleCard({
  title,
  description,
  example,
  level,
  className = '',
}: StrategyExampleCardProps) {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-[#5CFF8C] border-[#5CFF8C]/30 bg-[#5CFF8C]/10';
      case 'intermediate':
        return 'text-[#7CFF4F] border-[#7CFF4F]/30 bg-[#7CFF4F]/10';
      case 'advanced':
        return 'text-[#E7FF5C] border-[#E7FF5C]/30 bg-[#E7FF5C]/10';
      default:
        return 'text-[#7CFF4F] border-[#7CFF4F]/30 bg-[#7CFF4F]/10';
    }
  };

  const getLanguage = (level: string): 'pseudocode' | 'blocks' | 'json' => {
    if (level === 'beginner') return 'pseudocode';
    if (level === 'intermediate') return 'blocks';
    return 'json';
  };

  return (
    <div className={className}>
      <NeonCard>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-display font-semibold text-white">
              {title}
            </h3>
            <span className={`text-xs font-sans font-semibold uppercase px-3 py-1 border rounded-md ${getLevelStyles(level)}`}>
              {level}
            </span>
          </div>
          <p className="text-sm text-[#A9A9B3] font-sans mb-6 leading-relaxed">{description}</p>
        </div>
        {level === 'intermediate' ? (
          <div className="mb-6 h-[400px]">
            <ScratchBlockBuilder />
          </div>
        ) : (
          <CodeBlock code={example} language={getLanguage(level)} className="mb-6" />
        )}
        <div className="h-[200px]">
          <AnimatedTerminal level={level} />
        </div>
      </NeonCard>
    </div>
  );
}

