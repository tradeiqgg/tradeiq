'use client';

import { NeonCard } from '@/components/ui/NeonCard';

interface UserStatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function UserStatsCard({ title, value, subtitle, trend }: UserStatsCardProps) {
  return (
    <NeonCard className="text-center">
      <div className="text-3xl font-display font-bold text-[#7CFF4F] mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm font-display font-semibold text-white mb-1">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-[#A9A9B3] font-sans">
          {subtitle}
        </div>
      )}
      {trend && trend !== 'neutral' && (
        <div className={`text-xs mt-2 ${trend === 'up' ? 'text-[#7CFF4F]' : 'text-red-400'}`}>
          {trend === 'up' ? '↑' : '↓'}
        </div>
      )}
    </NeonCard>
  );
}

