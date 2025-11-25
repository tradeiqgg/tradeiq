// =====================================================================
// CHAPTER 11: useLiveIndicators Hook
// =====================================================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { getLiveIndicatorEngine } from '../indicators/liveIndicatorEngine';
import type { IndicatorValue } from '../indicators/liveIndicatorEngine';
import type { TQIndicatorId } from '@/lib/tql/indicators';

export interface UseLiveIndicatorsResult {
  indicators: Map<string, IndicatorValue>;
  isLoading: boolean;
  error: Error | null;
}

export interface IndicatorConfig {
  id: string;
  indicatorId: TQIndicatorId;
  params: Record<string, any>;
}

export function useLiveIndicators(
  symbol: string,
  interval: string,
  indicatorConfigs: IndicatorConfig[],
  enabled = true
): UseLiveIndicatorsResult {
  const [indicators, setIndicators] = useState<Map<string, IndicatorValue>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // Memoize indicator configs to avoid unnecessary re-renders
  const memoizedConfigs = useMemo(() => indicatorConfigs, [indicatorConfigs]);

  useEffect(() => {
    if (!enabled || !symbol || !interval || memoizedConfigs.length === 0) {
      return;
    }

    const indicatorEngine = getLiveIndicatorEngine();
    const unsubscribes: Array<() => void> = [];

    // Register and subscribe to each indicator
    memoizedConfigs.forEach(config => {
      try {
        indicatorEngine.registerIndicator(
          symbol,
          interval,
          config.indicatorId,
          config.params
        );

        const unsubscribe = indicatorEngine.subscribe(
          symbol,
          interval,
          config.indicatorId,
          config.params,
          (value) => {
            setIndicators(prev => {
              const updated = new Map(prev);
              updated.set(config.id, value);
              return updated;
            });
            setIsLoading(false);
          }
        );

        unsubscribes.push(unsubscribe);

        // Get initial value
        const initialValue = indicatorEngine.getIndicatorValue(
          symbol,
          interval,
          config.indicatorId,
          config.params
        );

        if (initialValue) {
          setIndicators(prev => {
            const updated = new Map(prev);
            updated.set(config.id, initialValue);
            return updated;
          });
          setIsLoading(false);
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    });

    unsubscribeRefs.current = unsubscribes;

    return () => {
      unsubscribes.forEach(unsub => unsub());
      unsubscribeRefs.current = [];
    };
  }, [symbol, interval, enabled, memoizedConfigs]);

  return {
    indicators,
    isLoading,
    error,
  };
}

