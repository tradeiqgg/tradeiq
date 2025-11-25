// =====================================================================
// CHAPTER 11: Live Chart Component (Simplified)
// =====================================================================

'use client';

import { useEffect, useRef } from 'react';
import { useLivePrice } from '../hooks/useLivePrice';
import { LiveStatusBadge, type ConnectionStatus } from './LiveStatusBadge';

interface LiveChartProps {
  symbol: string;
  interval: string;
  type?: 'crypto' | 'stock';
  height?: number;
  className?: string;
}

export function LiveChart({
  symbol,
  interval,
  type = 'crypto',
  height = 400,
  className = '',
}: LiveChartProps) {
  const { candle, candles, connected, error } = useLivePrice(symbol, interval, type, true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple candle chart rendering
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0B0B0C';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1e1f22';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw candles
    const visibleCandles = candles.slice(-50); // Last 50 candles
    const candleWidth = chartWidth / visibleCandles.length;
    const prices = visibleCandles.map(c => [c.high, c.low, c.open, c.close]).flat();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    visibleCandles.forEach((candle, idx) => {
      const x = padding + idx * candleWidth;
      const openY = padding + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
      const closeY = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
      const highY = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
      const lowY = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;

      const isGreen = candle.close >= candle.open;
      ctx.strokeStyle = isGreen ? '#7CFF4F' : '#ff4444';
      ctx.fillStyle = isGreen ? '#7CFF4F' : '#ff4444';

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x + candleWidth * 0.2, bodyTop, candleWidth * 0.6, bodyHeight);
    });

    // Draw current price line
    if (candle) {
      const currentY = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#7CFF4F';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(width - padding, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, candle]);

  const status: ConnectionStatus = error ? 'disconnected' : connected ? 'live' : 'delayed';

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <LiveStatusBadge status={status} />
      </div>
      <div className="bg-[#111214] border border-[#1e1f22] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-display font-semibold text-white">
            {symbol} - {interval}
          </h3>
          {candle && (
            <div className="text-sm font-mono text-[#7CFF4F]">
              ${candle.close.toFixed(2)}
            </div>
          )}
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={height}
          className="w-full"
        />
      </div>
    </div>
  );
}

