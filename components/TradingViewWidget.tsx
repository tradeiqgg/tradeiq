'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView?: any;
  }
}

interface TradingViewWidgetProps {
  symbol: string;
  type: 'stocks' | 'crypto';
  interval?: 'D' | 'W' | 'M' | '1' | '5' | '15' | '30' | '60' | '240' | '1D' | '1W' | '1M';
}

export function TradingViewWidget({ symbol, type, interval = 'D' }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous widget
    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        // Format symbol for TradingView
        let tvSymbol = symbol;
        if (type === 'crypto') {
          // For crypto, try to format as exchange:pair
          // Default to BINANCE if no exchange specified
          if (!symbol.includes(':')) {
            tvSymbol = `BINANCE:${symbol}USDT`;
          }
        } else {
          // For stocks, use as-is or add exchange prefix
          if (!symbol.includes(':')) {
            tvSymbol = symbol;
          }
        }

        // Map interval
        let tvInterval: string = interval;
        if (interval === 'D') tvInterval = '1D';
        if (interval === 'W') tvInterval = '1W';
        if (interval === 'M') tvInterval = '1M';

        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0B0B0C',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: containerRef.current.id,
          height: '100%',
          width: '100%',
          hide_side_toolbar: false,
          studies: [
            'MASimple@tv-basicstudies',
          ],
        });
      }
    };

    document.head.appendChild(script);

    const currentContainer = containerRef.current;
    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, type, interval]);

  return (
    <div 
      ref={containerRef}
      id={`tradingview_${symbol}_${Date.now()}`}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  );
}

