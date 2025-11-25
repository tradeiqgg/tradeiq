// =====================================================================
// CHAPTER 11: useLivePrice Hook
// =====================================================================

import { useState, useEffect, useRef } from 'react';
import { getFeedManager } from '../feeds/feedManager';
import type { Candle } from '../feeds/binanceFeed';

export interface UseLivePriceResult {
  candle: Candle | null;
  candles: Candle[];
  isLoading: boolean;
  error: Error | null;
  connected: boolean;
}

export function useLivePrice(
  symbol: string,
  interval: string,
  type: 'crypto' | 'stock' = 'crypto',
  enabled = true
): UseLivePriceResult {
  const [candle, setCandle] = useState<Candle | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);
  const subscriptionIdRef = useRef<string | null>(null);
  const maxCandles = 100; // Keep last 100 candles

  useEffect(() => {
    if (!enabled || !symbol || !interval) {
      return;
    }

    const feedManager = getFeedManager();

    const handleCandle = (newCandle: Candle) => {
      setCandle(newCandle);
      setCandles(prev => {
        const updated = [...prev, newCandle];
        return updated.slice(-maxCandles);
      });
      setIsLoading(false);
      setConnected(true);
    };

    const handleError = (err: Error) => {
      setError(err);
      setConnected(false);
      setIsLoading(false);
    };

    // Subscribe to feed
    const subId = feedManager.subscribe(
      symbol,
      interval,
      type,
      handleCandle,
      handleError
    );

    subscriptionIdRef.current = subId;

    // Check connection status
    const checkStatus = setInterval(() => {
      if (subId) {
        const status = feedManager.getStatus(subId);
        if (status) {
          setConnected(status.connected);
        }
      }
    }, 1000);

    return () => {
      if (subscriptionIdRef.current) {
        feedManager.unsubscribe(subscriptionIdRef.current);
      }
      clearInterval(checkStatus);
      setCandle(null);
      setCandles([]);
      setConnected(false);
    };
  }, [symbol, interval, type, enabled]);

  return {
    candle,
    candles,
    isLoading,
    error,
    connected,
  };
}

