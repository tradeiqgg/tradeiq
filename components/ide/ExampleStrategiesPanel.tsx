'use client';

import { useState } from 'react';
import { exampleStrategies, type ExampleStrategy } from '@/lib/tql/exampleStrategies';
import type { Strategy } from '@/types';

interface ExampleStrategiesPanelProps {
  onLoadStrategy: (example: ExampleStrategy) => void;
}

export function ExampleStrategiesPanel({ onLoadStrategy }: ExampleStrategiesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredStrategies = selectedCategory === 'all' 
    ? exampleStrategies
    : exampleStrategies.filter(s => s.category === selectedCategory);

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="border-b border-[#1e1f22] bg-[#111214] p-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-3">
          Example Strategies
        </h3>
        
        {/* Category Filter */}
        <div className="flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                selectedCategory === category
                  ? 'bg-[#7CFF4F] text-[#0B0B0C]'
                  : 'bg-[#0B0B0C] text-[#A9A9B3] hover:text-white border border-[#1e1f22]'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredStrategies.map((example) => (
          <div
            key={example.id}
            className="bg-[#111214] border border-[#1e1f22] rounded p-3 hover:border-[#7CFF4F] transition-colors cursor-pointer"
            onClick={() => onLoadStrategy(example)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-mono text-white font-semibold">
                {example.name}
              </h4>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{
                  backgroundColor: getCategoryColor(example.category) + '20',
                  color: getCategoryColor(example.category),
                }}
              >
                {example.category}
              </span>
            </div>
            <p className="text-xs font-mono text-[#A9A9B3] leading-relaxed">
              {example.description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLoadStrategy(example);
              }}
              className="mt-3 w-full px-3 py-1.5 text-xs font-mono bg-[#7CFF4F]/20 border border-[#7CFF4F]/40 text-[#7CFF4F] hover:bg-[#7CFF4F]/30 rounded transition-colors"
            >
              Load Strategy
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStrategies.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <div className="text-sm font-mono text-[#A9A9B3]">
              No strategies in this category
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'beginner':
      return '#7CFF4F';
    case 'intermediate':
      return '#FFD84F';
    case 'advanced':
      return '#FF617D';
    default:
      return '#A9A9B3';
  }
}

