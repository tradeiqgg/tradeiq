'use client';

import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  type: 'stocks' | 'crypto';
  interval?: 'D' | 'W' | 'M';
}

export function TradingViewWidget({ symbol, type, interval = 'D' }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Determine the exchange and symbol format for TradingView
    let tvSymbol = '';
    if (type === 'stocks') {
      // For stocks, try NASDAQ first, fallback to symbol only
      // TradingView will auto-detect the exchange
      tvSymbol = symbol;
    } else {
      // For crypto, use BINANCE format (most common)
      // Format: BINANCE:SYMBOLUSDT
      tvSymbol = `BINANCE:${symbol}USDT`;
    }

    // Create TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval === 'D' ? 'D' : interval === 'W' ? 'W' : 'M',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#080A0C',
      hide_side_toolbar: true,
      allow_symbol_change: false,
      calendar: false,
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default',
        'header_compare',
        'header_symbol_search',
        'header_resolutions',
        'header_saveload',
        'header_screenshot',
        'header_chart_type',
        'header_settings',
        'header_indicators',
        'header_undo_redo',
        'header_interval_dialog_button',
        'show_interval_dialog_on_key_press',
        'header_widget',
        'edit_buttons_in_legend',
        'context_menus',
        'control_bar',
        'timeframes_toolbar',
      ],
      enabled_features: [
        'study_templates',
      ],
      support_host: 'https://www.tradingview.com',
      studies: [
        'Volume@tv-basicstudies',
      ],
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, type, interval]);

  return (
    <div className="tradingview-widget-container w-full h-full min-h-[600px]">
      <div ref={containerRef} className="tradingview-widget-container__widget w-full h-full min-h-[600px]" />
    </div>
  );
}

