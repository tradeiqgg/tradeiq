// =====================================================================
// CHAPTER 8: Candle Chart with Indicators
// =====================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import type { BacktestResult } from '@/lib/backtester/types';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode } from 'lightweight-charts';

interface BacktestChartProps {
  result: BacktestResult;
}

export function BacktestChart({ result }: BacktestChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1e1e1e' },
        textColor: '#d4d4d4',
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Convert equity curve to candles (simplified - would need actual candle data)
    // For now, we'll create synthetic candles from equity curve
    const candles = result.equityCurve.map((point, index) => ({
      time: (point.time / 1000) as any,
      open: index === 0 ? point.equity : result.equityCurve[index - 1].equity,
      high: point.equity * 1.01,
      low: point.equity * 0.99,
      close: point.equity,
    }));

    candlestickSeries.setData(candles);

    // Add trade markers
    const markers = result.trades.map((trade) => ({
      time: (trade.entryTime / 1000) as any,
      position: trade.direction === 'long' ? 'belowBar' : 'aboveBar',
      color: trade.direction === 'long' ? '#26a69a' : '#ef5350',
      shape: trade.direction === 'long' ? 'arrowUp' : 'arrowDown',
      text: `${trade.direction === 'long' ? 'LONG' : 'SHORT'} @ ${trade.entryPrice.toFixed(2)}`,
    }));

    candlestickSeries.setMarkers(markers);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [result]);

  return (
    <div className="backtest-chart p-4">
      <h3 className="text-lg font-semibold mb-4">Price Chart with Trades</h3>
      <div ref={chartContainerRef} className="w-full" style={{ height: '600px' }} />
    </div>
  );
}

