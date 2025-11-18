'use client';

import { ReactNode } from 'react';
import { NeonCard } from './NeonCard';

interface AIPersonalityCardProps {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  description: string;
  riskLevel: string;
  controlLevel: string;
  profitFocus: string;
  overrideBehavior: string;
  className?: string;
}

export function AIPersonalityCard({
  name,
  icon,
  color,
  bgColor,
  borderColor,
  title,
  description,
  riskLevel,
  controlLevel,
  profitFocus,
  overrideBehavior,
  className = '',
}: AIPersonalityCardProps) {
  return (
    <NeonCard className={`${className} border-2`} style={{ borderColor: borderColor }}>
      <div className="flex items-start gap-4">
        <div 
          className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: bgColor }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-display font-semibold text-white">{name}</h3>
            <span 
              className="text-xs font-sans font-semibold px-2 py-1 rounded-md"
              style={{ backgroundColor: bgColor, color: color }}
            >
              {title}
            </span>
          </div>
          <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4">
            {description}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#6f7177] font-sans">Risk Level:</span>
              <span className="text-white ml-2 font-sans font-medium">{riskLevel}</span>
            </div>
            <div>
              <span className="text-[#6f7177] font-sans">Control:</span>
              <span className="text-white ml-2 font-sans font-medium">{controlLevel}</span>
            </div>
            <div>
              <span className="text-[#6f7177] font-sans">Profit Focus:</span>
              <span className="text-white ml-2 font-sans font-medium">{profitFocus}</span>
            </div>
            <div>
              <span className="text-[#6f7177] font-sans">Override:</span>
              <span className="text-white ml-2 font-sans font-medium">{overrideBehavior}</span>
            </div>
          </div>
        </div>
      </div>
    </NeonCard>
  );
}

