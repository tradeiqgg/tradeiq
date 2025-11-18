'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickData } from 'lightweight-charts';

interface ChartViewerProps {
  symbol: string;
  data?: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>;
}

export function ChartViewer({ symbol, data }: ChartViewerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#080A0C' },
        textColor: '#E6F2EF',
      },
      grid: {
        vertLines: { color: 'rgba(57, 255, 20, 0.1)' },
        horzLines: { color: 'rgba(57, 255, 20, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#39FF14',
      downColor: '#FF4444',
      borderVisible: false,
      wickUpColor: '#39FF14',
      wickDownColor: '#FF4444',
    });

    seriesRef.current = candlestickSeries;

    // Load sample data if provided, otherwise show placeholder
    if (data && data.length > 0) {
      // Convert data to proper CandlestickData format with Time type
      const formattedData: CandlestickData<Time>[] = data.map(item => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      candlestickSeries.setData(formattedData);
    } else {
      // Generate mock data for demonstration
      const mockData: CandlestickData<Time>[] = [];
      const now = Math.floor(Date.now() / 1000);
      let price = 100;
      for (let i = 0; i < 100; i++) {
        const change = (Math.random() - 0.5) * 5;
        price += change;
        mockData.push({
          time: (now - (100 - i) * 3600) as Time,
          open: price,
          high: price + Math.random() * 2,
          low: price - Math.random() * 2,
          close: price + change,
        });
      }
      candlestickSeries.setData(mockData);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.remove();
    };
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-mono uppercase tracking-wider text-primary">{symbol}</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-mono uppercase border border-border terminal-button">
            1D
          </button>
          <button className="px-3 py-1 text-xs font-mono uppercase border border-border terminal-button">
            1W
          </button>
          <button className="px-3 py-1 text-xs font-mono uppercase border border-border terminal-button">
            1M
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full flex-1" />
    </div>
  );
}
