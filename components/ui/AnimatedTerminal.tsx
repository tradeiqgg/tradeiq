'use client';

import { useState, useEffect, useRef } from 'react';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command' | 'ai';
  delay: number;
}

interface AnimatedTerminalProps {
  onComplete?: () => void;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export function AnimatedTerminal({ onComplete, level }: AnimatedTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getTerminalScript = (level: string): TerminalLine[] => {
    if (level === 'beginner') {
      return [
        { text: '[BACKTEST] Running backtest on 30 days of historical data...', type: 'command', delay: 300 },
        { text: '[BACKTEST] Analyzing 2,160 candles across SOL/USD pair', type: 'info', delay: 600 },
        { text: '[BACKTEST] Executing strategy: 47 trades detected', type: 'info', delay: 900 },
        { text: '[BACKTEST] Win rate: 68.1% | Avg win: +2.4% | Avg loss: -1.1%', type: 'info', delay: 1200 },
        { text: '[BACKTEST] ✓ Final PnL: +$1,250.00 (+12.5% ROI)', type: 'success', delay: 1500 },
        { text: '[BACKTEST] Max drawdown: 3.2% | Sharpe ratio: 1.42', type: 'info', delay: 1800 },
      ];
    } else if (level === 'intermediate') {
      return [
        { text: '[BACKTEST] Running optimized backtest with block strategy...', type: 'command', delay: 300 },
        { text: '[BACKTEST] Processing 4,320 candles with volume filter', type: 'info', delay: 600 },
        { text: '[BACKTEST] Strategy executed: 89 trades with risk management', type: 'info', delay: 900 },
        { text: '[BACKTEST] Performance: 72.3% win rate | Profit factor: 2.1', type: 'info', delay: 1200 },
        { text: '[BACKTEST] ✓ Optimized PnL: +$1,830.00 (+18.3% ROI)', type: 'success', delay: 1500 },
        { text: '[BACKTEST] Improvement: +5.8% vs baseline | Max DD: 4.1%', type: 'info', delay: 1800 },
      ];
    } else {
      return [
        { text: '[BACKTEST] Executing advanced backtest with Monte Carlo analysis...', type: 'command', delay: 300 },
        { text: '[BACKTEST] Running 1,000 iterations on 8,640 candles', type: 'info', delay: 600 },
        { text: '[BACKTEST] Strategy performance: 156 trades executed', type: 'info', delay: 900 },
        { text: '[BACKTEST] Metrics: 75.6% win rate | Sharpe: 1.85 | Sortino: 2.12', type: 'info', delay: 1200 },
        { text: '[BACKTEST] ✓ Final results: +$2,470.00 (+24.7% ROI)', type: 'success', delay: 1500 },
        { text: '[BACKTEST] Max drawdown: 8.2% | 95% confidence interval: +18.3% to +31.1%', type: 'info', delay: 1800 },
      ];
    }
  };

  useEffect(() => {
    // Cleanup function for when component unmounts
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollContainerRef.current && lines.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lines, currentIndex]);

  const startAnimation = () => {
    // Clean up any existing animation
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    setIsRunning(true);
    setLines([]);
    setCurrentIndex(0);
    const script = getTerminalScript(level);
    const timeoutIds: NodeJS.Timeout[] = [];
    let index = 0;
    let isCancelled = false;

    const addLine = () => {
      if (isCancelled) return;
      
      if (index < script.length && script[index]) {
        const currentLine = script[index];
        setLines((prev) => [...prev, currentLine]);
        setCurrentIndex(index);
        index++;
        
        if (index < script.length) {
          const delay = currentLine.delay || 500;
          const timeoutId = setTimeout(() => {
            if (!isCancelled) addLine();
          }, delay);
          timeoutIds.push(timeoutId);
        } else {
          const finalTimeout = setTimeout(() => {
            if (!isCancelled) {
              setIsRunning(false);
              onComplete?.();
            }
          }, 500);
          timeoutIds.push(finalTimeout);
        }
      }
    };

    // Start animation after a small delay
    const initialTimeout = setTimeout(() => {
      if (!isCancelled) addLine();
    }, 100);
    timeoutIds.push(initialTimeout);

    // Store cleanup function
    const cleanup = () => {
      isCancelled = true;
      timeoutIds.forEach((id) => clearTimeout(id));
      setIsRunning(false);
    };

    cleanupRef.current = cleanup;
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-[#7CFF4F]';
      case 'warning':
        return 'text-[#E7FF5C]';
      case 'error':
        return 'text-[#FF617D]';
      case 'command':
        return 'text-[#5CFF8C]';
      case 'ai':
        return 'text-[#A9A9B3]';
      default:
        return 'text-[#A9A9B3]';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#111214] border border-[#1e1f22] rounded-lg p-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#7CFF4F] font-sans font-medium">[TERMINAL]</span>
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#7CFF4F] animate-pulse' : 'bg-[#6f7177]'}`} />
        </div>
        <button
          onClick={startAnimation}
          disabled={isRunning}
          className="px-3 py-1.5 border border-[#1e1f22] text-white text-xs font-sans font-semibold hover:border-[#7CFF4F]/40 hover:bg-[#151618] transition-all disabled:opacity-50 rounded-md"
        >
          {isRunning ? 'Running...' : '▶ Backtest'}
        </button>
      </div>
      <div ref={scrollContainerRef} className="flex-1 space-y-1 overflow-y-auto">
        {lines.length === 0 && !isRunning && (
          <div className="text-[#6f7177] italic font-sans">Click Backtest to run strategy analysis...</div>
        )}
        {lines.map((line, idx) => {
          if (!line || !line.type || !line.text) return null;
          return (
            <div
              key={idx}
              className={`${getLineColor(line.type)} transition-opacity duration-300 font-mono ${
                idx === currentIndex ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <span className="text-[#6f7177]">$ </span>
              {line.text}
              {idx === currentIndex && <span className="terminal-cursor" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

