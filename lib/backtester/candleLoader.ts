// =====================================================================
// CHAPTER 7: Candle Loader
// =====================================================================

import type { Candle } from './types';

/**
 * Load candles from various sources
 */
export interface CandleLoadOptions {
  symbol: string;
  timeframe: string;
  start: Date;
  end: Date;
  source?: 'binance' | 'finnhub' | 'local' | 'supabase';
}

/**
 * Load candles from Binance public API
 */
export async function loadCandlesFromBinance(
  symbol: string,
  interval: string,
  startTime: Date,
  endTime: Date
): Promise<Candle[]> {
  const intervalMap: Record<string, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
  };

  const binanceInterval = intervalMap[interval] || interval;
  const start = startTime.getTime();
  const end = endTime.getTime();

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&startTime=${start}&endTime=${end}&limit=1000`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((kline: any[]) => ({
      time: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error: any) {
    console.error('Error loading candles from Binance:', error);
    throw error;
  }
}

/**
 * Load candles from local cache
 */
export async function loadCandlesFromLocal(
  symbol: string,
  timeframe: string
): Promise<Candle[] | null> {
  try {
    const response = await fetch(`/candles/${symbol}/${timeframe}.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Main candle loader - tries multiple sources
 */
export async function loadCandles(
  options: CandleLoadOptions
): Promise<Candle[]> {
  const { symbol, timeframe, start, end, source = 'binance' } = options;

  // Try local cache first
  const cached = await loadCandlesFromLocal(symbol, timeframe);
  if (cached) {
    // Filter by date range
    return cached.filter(
      (candle) => candle.time >= start.getTime() && candle.time <= end.getTime()
    );
  }

  // Load from API
  if (source === 'binance') {
    return loadCandlesFromBinance(symbol, timeframe, start, end);
  }

  throw new Error(`Unsupported candle source: ${source}`);
}

/**
 * Downsample candles to a different timeframe
 */
export function downsample(
  candles: Candle[],
  targetFrame: string
): Candle[] {
  if (candles.length === 0) return [];

  const targetMs = timeframeToMs(targetFrame);
  const sourceMs = estimateTimeframe(candles);

  if (targetMs <= sourceMs) {
    return candles; // Can't downsample to smaller timeframe
  }

  const ratio = Math.floor(targetMs / sourceMs);
  const downsampled: Candle[] = [];

  for (let i = 0; i < candles.length; i += ratio) {
    const group = candles.slice(i, i + ratio);
    if (group.length === 0) continue;

    const candle: Candle = {
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map((c) => c.high)),
      low: Math.min(...group.map((c) => c.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((sum, c) => sum + c.volume, 0),
    };

    downsampled.push(candle);
  }

  return downsampled;
}

/**
 * Merge candles from multiple timeframes
 */
export function mergeCandles(
  baseCandles: Candle[],
  otherCandles: Array<{ timeframe: string; candles: Candle[] }>
): Record<string, Candle[]> {
  const merged: Record<string, Candle[]> = {
    base: baseCandles,
  };

  for (const { timeframe, candles } of otherCandles) {
    merged[timeframe] = alignCandlesToBase(baseCandles, candles);
  }

  return merged;
}

/**
 * Align candles from one timeframe to base timeframe
 */
function alignCandlesToBase(
  baseCandles: Candle[],
  otherCandles: Candle[]
): Candle[] {
  const aligned: Candle[] = [];
  let otherIndex = 0;

  for (const baseCandle of baseCandles) {
    // Find the most recent candle from other timeframe that's <= base candle time
    while (
      otherIndex < otherCandles.length - 1 &&
      otherCandles[otherIndex + 1].time <= baseCandle.time
    ) {
      otherIndex++;
    }

    if (otherIndex < otherCandles.length) {
      aligned.push(otherCandles[otherIndex]);
    } else {
      // Use last available candle
      aligned.push(otherCandles[otherCandles.length - 1]);
    }
  }

  return aligned;
}

/**
 * Convert timeframe string to milliseconds
 */
function timeframeToMs(timeframe: string): number {
  const match = timeframe.match(/^(\d+)([mhd])$/);
  if (!match) return 60000; // Default to 1 minute

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60000;
  }
}

/**
 * Estimate timeframe from candle data
 */
function estimateTimeframe(candles: Candle[]): number {
  if (candles.length < 2) return 60000; // Default 1 minute

  const diffs = [];
  for (let i = 1; i < Math.min(candles.length, 100); i++) {
    diffs.push(candles[i].time - candles[i - 1].time);
  }

  // Use median to avoid outliers
  diffs.sort((a, b) => a - b);
  return diffs[Math.floor(diffs.length / 2)];
}

