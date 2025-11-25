// =====================================================================
// CHAPTER 7: Indicator Computation Engine
// =====================================================================

import type { Candle, IndicatorSeries, IndicatorBand } from './types';
import {
  getIndicatorSpec,
  validateIndicatorParams,
  type TQIndicatorId,
} from '@/lib/tql/indicators';

/**
 * Compute indicator series for a given indicator
 */
export function computeIndicatorSeries(
  candles: Candle[],
  indicatorId: TQIndicatorId,
  params: Record<string, any>
): number[] | boolean[] | IndicatorBand[] {
  const spec = getIndicatorSpec(indicatorId);
  if (!spec) {
    throw new Error(`Unknown indicator: ${indicatorId}`);
  }

  // Validate parameters
  const validation = validateIndicatorParams(indicatorId, params);
  if (!validation.valid) {
    throw new Error(
      `Invalid parameters for ${indicatorId}: ${validation.errors.map((e) => e.message).join(', ')}`
    );
  }

  const normalizedParams = validation.normalizedParams;

  // Route to specific indicator calculator
  switch (indicatorId) {
    case 'rsi':
      return computeRSI(candles, normalizedParams.length || 14);
    case 'sma':
      return computeSMA(candles, normalizedParams.length || 14, normalizedParams.source || 'close');
    case 'ema':
      return computeEMA(candles, normalizedParams.length || 14, normalizedParams.source || 'close');
    case 'macd':
      return computeMACD(
        candles,
        normalizedParams.fast || 12,
        normalizedParams.slow || 26,
        normalizedParams.signal || 9
      );
    case 'bollinger':
      return computeBollingerBands(
        candles,
        normalizedParams.length || 20,
        normalizedParams.stddev || 2
      );
    case 'atr':
      return computeATR(candles, normalizedParams.length || 14);
    // Add more indicators as needed
    default:
      throw new Error(`Indicator ${indicatorId} not yet implemented`);
  }
}

/**
 * Compute RSI (Relative Strength Index)
 */
function computeRSI(candles: Candle[], length: number): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  for (let i = 0; i < candles.length; i++) {
    if (i < length) {
      rsi.push(NaN);
      continue;
    }

    const avgGain =
      gains.slice(i - length, i).reduce((sum, g) => sum + g, 0) / length;
    const avgLoss =
      losses.slice(i - length, i).reduce((sum, l) => sum + l, 0) / length;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

/**
 * Compute SMA (Simple Moving Average)
 */
function computeSMA(
  candles: Candle[],
  length: number,
  source: 'open' | 'high' | 'low' | 'close'
): number[] {
  const sma: number[] = [];
  const sourceValues = candles.map((c) => c[source]);

  for (let i = 0; i < candles.length; i++) {
    if (i < length - 1) {
      sma.push(NaN);
      continue;
    }

    const sum = sourceValues.slice(i - length + 1, i + 1).reduce((s, v) => s + v, 0);
    sma.push(sum / length);
  }

  return sma;
}

/**
 * Compute EMA (Exponential Moving Average)
 */
function computeEMA(
  candles: Candle[],
  length: number,
  source: 'open' | 'high' | 'low' | 'close'
): number[] {
  const ema: number[] = [];
  const sourceValues = candles.map((c) => c[source]);
  const multiplier = 2 / (length + 1);

  // First EMA value is SMA
  let currentEMA = sourceValues.slice(0, length).reduce((s, v) => s + v, 0) / length;
  ema.push(...Array(length - 1).fill(NaN));
  ema.push(currentEMA);

  for (let i = length; i < candles.length; i++) {
    currentEMA = (sourceValues[i] - currentEMA) * multiplier + currentEMA;
    ema.push(currentEMA);
  }

  return ema;
}

/**
 * Compute MACD
 */
function computeMACD(
  candles: Candle[],
  fast: number,
  slow: number,
  signal: number
): number[] {
  const emaFast = computeEMA(candles, fast, 'close');
  const emaSlow = computeEMA(candles, slow, 'close');
  const macdLine: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(emaFast[i] - emaSlow[i]);
    }
  }

  // Signal line is EMA of MACD line
  const signalLine = computeEMAFromArray(macdLine, signal);

  // For now, return MACD line (full MACD would return an object)
  return macdLine;
}

/**
 * Compute Bollinger Bands
 */
function computeBollingerBands(
  candles: Candle[],
  length: number,
  stddev: number
): IndicatorBand[] {
  const sma = computeSMA(candles, length, 'close');
  const bands: IndicatorBand[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < length - 1) {
      bands.push({ upper: NaN, middle: NaN, lower: NaN });
      continue;
    }

    const slice = candles.slice(i - length + 1, i + 1);
    const mean = sma[i];
    const variance =
      slice.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / length;
    const std = Math.sqrt(variance);

    bands.push({
      upper: mean + stddev * std,
      middle: mean,
      lower: mean - stddev * std,
    });
  }

  return bands;
}

/**
 * Compute ATR (Average True Range)
 */
function computeATR(candles: Candle[], length: number): number[] {
  const tr: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const highLow = candles[i].high - candles[i].low;
    const highClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowClose = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(highLow, highClose, lowClose));
  }

  const atr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < length) {
      atr.push(NaN);
      continue;
    }

    const sum = tr.slice(i - length, i).reduce((s, v) => s + v, 0);
    atr.push(sum / length);
  }

  return atr;
}

/**
 * Helper: Compute EMA from array
 */
function computeEMAFromArray(values: number[], length: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (length + 1);

  // Find first valid value
  let firstValidIndex = 0;
  while (firstValidIndex < values.length && isNaN(values[firstValidIndex])) {
    firstValidIndex++;
  }

  if (firstValidIndex >= values.length) {
    return values.map(() => NaN);
  }

  // First EMA value is SMA
  let currentEMA =
    values.slice(firstValidIndex, firstValidIndex + length).reduce((s, v) => s + (isNaN(v) ? 0 : v), 0) /
    length;

  for (let i = 0; i < firstValidIndex + length - 1; i++) {
    ema.push(NaN);
  }
  ema.push(currentEMA);

  for (let i = firstValidIndex + length; i < values.length; i++) {
    if (isNaN(values[i])) {
      ema.push(NaN);
    } else {
      currentEMA = (values[i] - currentEMA) * multiplier + currentEMA;
      ema.push(currentEMA);
    }
  }

  return ema;
}

/**
 * Precompute all indicators for a strategy
 */
export function precomputeIndicators(
  candles: Candle[],
  strategy: any // TQJSSchema
): Record<string, IndicatorSeries> {
  const indicatorCache: Record<string, IndicatorSeries> = {};

  for (const indicator of strategy.indicators || []) {
    try {
      const series = computeIndicatorSeries(
        candles,
        indicator.indicator as TQIndicatorId,
        indicator.params
      );

      indicatorCache[indicator.id] = series as any;
    } catch (error: any) {
      console.error(`Error computing indicator ${indicator.id}:`, error);
    }
  }

  return indicatorCache;
}

