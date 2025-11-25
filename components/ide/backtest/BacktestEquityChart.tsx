// =====================================================================
// CHAPTER 8: Equity Curve Chart
// =====================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import type { BacktestResult } from '@/lib/backtester/types';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface BacktestEquityChartProps {
  result: BacktestResult;
}

export function BacktestEquityChart({ result }: BacktestEquityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

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

    // Add equity line series
    const equitySeries = chart.addLineSeries({
      color: '#4ec9b0',
      lineWidth: 2,
      title: 'Equity',
    });

    seriesRef.current = equitySeries;

    // Set data
    const equityData = result.equityCurve.map((point) => ({
      time: point.time / 1000 as any, // Convert to seconds
      value: point.equity,
    }));

    equitySeries.setData(equityData);

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
    <div className="backtest-equity-chart p-4">
      <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
      <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }} />
    </div>
  );
}

