// =====================================================================
// CHAPTER 8: Drawdown Chart
// =====================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import type { BacktestResult } from '@/lib/backtester/types';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface BacktestDrawdownChartProps {
  result: BacktestResult;
}

export function BacktestDrawdownChart({ result }: BacktestDrawdownChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1e1e1e' },
        textColor: '#d4d4d4',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
    });

    chartRef.current = chart;

    // Add drawdown area series
    const drawdownSeries = chart.addAreaSeries({
      lineColor: '#f44336',
      topColor: '#f4433640',
      bottomColor: '#f4433600',
      lineWidth: 2,
      title: 'Drawdown',
    });

    seriesRef.current = drawdownSeries;

    // Calculate drawdown percentages
    const drawdownData = result.drawdownCurve.map((point) => ({
      time: point.time / 1000 as any,
      value: (point.drawdown / result.options.initialBalance) * 100, // Convert to percentage
    }));

    drawdownSeries.setData(drawdownData);

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
    <div className="backtest-drawdown-chart p-4">
      <h3 className="text-lg font-semibold mb-4">Drawdown</h3>
      <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }} />
    </div>
  );
}

