// =====================================================================
// CHAPTER 11: Live Indicator Overlay Component
// =====================================================================

'use client';

import { useLiveIndicators } from '../hooks/useLiveIndicators';
import type { IndicatorConfig } from '../hooks/useLiveIndicators';
import { NeonCard } from '@/components/ui/NeonCard';

interface LiveIndicatorOverlayProps {
  symbol: string;
  interval: string;
  indicators: IndicatorConfig[];
  className?: string;
}

export function LiveIndicatorOverlay({
  symbol,
  interval,
  indicators,
  className = '',
}: LiveIndicatorOverlayProps) {
  const { indicators: indicatorValues, isLoading } = useLiveIndicators(
    symbol,
    interval,
    indicators,
    true
  );

  if (isLoading) {
    return (
      <NeonCard className={className}>
        <div className="text-sm text-[#A9A9B3] font-sans">Loading indicators...</div>
      </NeonCard>
    );
  }

  return (
    <NeonCard className={className}>
      <h3 className="text-sm font-display font-semibold text-white mb-3">
        Live Indicators
      </h3>
      <div className="space-y-2">
        {indicators.map(config => {
          const value = indicatorValues.get(config.id);
          const prevValue = Array.from(indicatorValues.values())
            .find(v => v.indicatorId === config.indicatorId && v.timestamp < (value?.timestamp || 0));

          let displayValue: string = 'N/A';
          let trend: 'up' | 'down' | 'neutral' = 'neutral';

          if (value?.value !== null && value?.value !== undefined) {
            if (typeof value.value === 'number') {
              displayValue = value.value.toFixed(2);
              if (prevValue && typeof prevValue.value === 'number') {
                trend = value.value > prevValue.value ? 'up' : value.value < prevValue.value ? 'down' : 'neutral';
              }
            } else if (typeof value.value === 'boolean') {
              displayValue = value.value ? 'TRUE' : 'FALSE';
            } else if (typeof value.value === 'object') {
              displayValue = `U:${value.value.upper.toFixed(2)} M:${value.value.middle.toFixed(2)} L:${value.value.lower.toFixed(2)}`;
            }
          }

          return (
            <div
              key={config.id}
              className="flex items-center justify-between text-sm font-sans"
            >
              <span className="text-[#A9A9B3]">{config.id}</span>
              <div className="flex items-center gap-2">
                {trend !== 'neutral' && (
                  <span className={trend === 'up' ? 'text-[#7CFF4F]' : 'text-red-400'}>
                    {trend === 'up' ? '↑' : '↓'}
                  </span>
                )}
                <span className="text-white font-mono">{displayValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </NeonCard>
  );
}

