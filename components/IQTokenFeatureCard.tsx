'use client';

import { NeonCard } from './ui/NeonCard';

interface IQTokenFeatureCardProps {
  number: string;
  title: string;
  description: string;
  className?: string;
}

export function IQTokenFeatureCard({
  number,
  title,
  description,
  className = '',
}: IQTokenFeatureCardProps) {
  return (
    <NeonCard className={`h-full flex flex-col ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 border border-[#7CFF4F]/40 bg-[#7CFF4F]/10 rounded-md flex items-center justify-center font-display font-bold text-[#7CFF4F]">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-display font-semibold text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4">
            {description}
          </p>
          <div className="mt-auto">
            <a
              href="#"
              className="text-xs text-[#7CFF4F] font-sans font-medium hover:text-[#5CFF8C] transition-colors flex items-center gap-1"
            >
              <span>▶</span>
              <span>Learn More</span>
            </a>
          </div>
        </div>
      </div>
    </NeonCard>
  );
}

