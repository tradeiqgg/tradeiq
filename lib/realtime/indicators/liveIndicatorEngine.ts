// =====================================================================
// CHAPTER 11: Live Indicator Engine
// =====================================================================

import type { Candle } from '../feeds/binanceFeed';
import { computeIndicatorSeries } from '@/lib/backtester/indicatorEngine';
import type { TQIndicatorId } from '@/lib/tql/indicators';

export interface IndicatorValue {
  indicatorId: string;
  value: number | boolean | { upper: number; middle: number; lower: number } | null;
  timestamp: number;
}

export interface IndicatorCache {
  candles: Candle[];
  indicators: Map<string, IndicatorValue[]>;
  maxCandles: number;
}

export class LiveIndicatorEngine {
  private caches = new Map<string, IndicatorCache>();
  private subscribers = new Map<string, Set<(values: IndicatorValue[]) => void>>();
  private maxCandles = 500; // Keep last 500 candles

  /**
   * Initialize cache for a symbol/timeframe pair
   */
  initializeCache(symbol: string, interval: string): string {
    const cacheKey = `${symbol}-${interval}`;
    
    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, {
        candles: [],
        indicators: new Map(),
        maxCandles: this.maxCandles,
      });
    }

    return cacheKey;
  }

  /**
   * Add a new candle and update all indicators
   */
  onNewCandle(symbol: string, interval: string, candle: Candle): void {
    const cacheKey = this.initializeCache(symbol, interval);
    const cache = this.caches.get(cacheKey)!;

    // Add candle to buffer
    cache.candles.push(candle);

    // Trim to max candles
    if (cache.candles.length > cache.maxCandles) {
      cache.candles.shift();
    }

    // Update all registered indicators
    this.updateIndicators(cacheKey, cache);
  }

  /**
   * Register an indicator to compute
   */
  registerIndicator(
    symbol: string,
    interval: string,
    indicatorId: TQIndicatorId,
    params: Record<string, any>
  ): void {
    const cacheKey = this.initializeCache(symbol, interval);
    const cache = this.caches.get(cacheKey)!;

    const indicatorKey = `${indicatorId}-${JSON.stringify(params)}`;
    
    if (!cache.indicators.has(indicatorKey)) {
      cache.indicators.set(indicatorKey, []);
    }

    // Compute initial values if we have candles
    if (cache.candles.length > 0) {
      this.computeIndicator(cacheKey, indicatorId, params);
    }
  }

  /**
   * Subscribe to indicator updates
   */
  subscribe(
    symbol: string,
    interval: string,
    indicatorId: TQIndicatorId,
    params: Record<string, any>,
    callback: (value: IndicatorValue) => void
  ): () => void {
    const cacheKey = this.initializeCache(symbol, interval);
    const indicatorKey = `${indicatorId}-${JSON.stringify(params)}`;
    const subscriptionKey = `${cacheKey}-${indicatorKey}`;

    if (!this.subscribers.has(subscriptionKey)) {
      this.subscribers.set(subscriptionKey, new Set());
    }

    this.subscribers.get(subscriptionKey)!.add(callback);

    // Register indicator if not already registered
    this.registerIndicator(symbol, interval, indicatorId, params);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(subscriptionKey);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(subscriptionKey);
        }
      }
    };
  }

  /**
   * Get current indicator value
   */
  getIndicatorValue(
    symbol: string,
    interval: string,
    indicatorId: TQIndicatorId,
    params: Record<string, any>
  ): IndicatorValue | null {
    const cacheKey = `${symbol}-${interval}`;
    const cache = this.caches.get(cacheKey);
    
    if (!cache) {
      return null;
    }

    const indicatorKey = `${indicatorId}-${JSON.stringify(params)}`;
    const values = cache.indicators.get(indicatorKey);
    
    if (!values || values.length === 0) {
      return null;
    }

    return values[values.length - 1]; // Return latest value
  }

  /**
   * Get all indicator values for a symbol/interval
   */
  getAllIndicators(symbol: string, interval: string): IndicatorValue[] {
    const cacheKey = `${symbol}-${interval}`;
    const cache = this.caches.get(cacheKey);
    
    if (!cache) {
      return [];
    }

    const allValues: IndicatorValue[] = [];
    for (const values of cache.indicators.values()) {
      if (values.length > 0) {
        allValues.push(values[values.length - 1]);
      }
    }

    return allValues;
  }

  /**
   * Update all indicators for a cache
   */
  private updateIndicators(cacheKey: string, cache: IndicatorCache): void {
    for (const [indicatorKey, _] of cache.indicators.entries()) {
      const [indicatorId, paramsStr] = indicatorKey.split('-');
      const params = JSON.parse(paramsStr);
      
      this.computeIndicator(cacheKey, indicatorId as TQIndicatorId, params);
    }
  }

  /**
   * Compute indicator values
   */
  private computeIndicator(
    cacheKey: string,
    indicatorId: TQIndicatorId,
    params: Record<string, any>
  ): void {
    const cache = this.caches.get(cacheKey);
    if (!cache || cache.candles.length === 0) {
      return;
    }

    try {
      // Convert candles to backtester format
      const candles = cache.candles.map(c => ({
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        timestamp: c.timestamp,
      }));

      // Compute indicator series
      const series = computeIndicatorSeries(candles, indicatorId, params);
      
      // Get latest value
      let value: number | boolean | { upper: number; middle: number; lower: number } | null = null;
      
      if (Array.isArray(series) && series.length > 0) {
        const lastValue = series[series.length - 1];
        
        if (typeof lastValue === 'number' && !isNaN(lastValue)) {
          value = lastValue;
        } else if (typeof lastValue === 'boolean') {
          value = lastValue;
        } else if (typeof lastValue === 'object' && lastValue !== null) {
          // Band indicator
          value = lastValue as { upper: number; middle: number; lower: number };
        }
      }

      // Store indicator value
      const indicatorKey = `${indicatorId}-${JSON.stringify(params)}`;
      const values = cache.indicators.get(indicatorKey) || [];
      
      const indicatorValue: IndicatorValue = {
        indicatorId,
        value,
        timestamp: cache.candles[cache.candles.length - 1]?.timestamp || Date.now(),
      };

      values.push(indicatorValue);
      
      // Trim to max candles
      if (values.length > cache.maxCandles) {
        values.shift();
      }

      cache.indicators.set(indicatorKey, values);

      // Notify subscribers
      const subscriptionKey = `${cacheKey}-${indicatorKey}`;
      const subs = this.subscribers.get(subscriptionKey);
      if (subs) {
        subs.forEach(callback => callback(indicatorValue));
      }
    } catch (error) {
      console.error(`Failed to compute indicator ${indicatorId}:`, error);
    }
  }

  /**
   * Clear cache for a symbol/interval
   */
  clearCache(symbol: string, interval: string): void {
    const cacheKey = `${symbol}-${interval}`;
    this.caches.delete(cacheKey);
    
    // Remove all subscriptions for this cache
    for (const key of this.subscribers.keys()) {
      if (key.startsWith(cacheKey)) {
        this.subscribers.delete(key);
      }
    }
  }
}

// Singleton instance
let liveIndicatorEngineInstance: LiveIndicatorEngine | null = null;

export function getLiveIndicatorEngine(): LiveIndicatorEngine {
  if (!liveIndicatorEngineInstance) {
    liveIndicatorEngineInstance = new LiveIndicatorEngine();
  }
  return liveIndicatorEngineInstance;
}

