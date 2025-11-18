'use client';

import { useEffect, useState, useRef } from 'react';
import { TradingViewWidget } from '@/components/TradingViewWidget';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
  delay: number;
}

export function AnimatedChartOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection Observer to trigger animation when section is visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observerRef.current.observe(sectionRef.current);
    }

    return () => {
      if (observerRef.current && sectionRef.current) {
        observerRef.current.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Reset state when starting new animation
    setTerminalLines([]);
    setCurrentLineIndex(0);

    const lines: TerminalLine[] = [
      { text: '[AI] Initializing strategy analysis...', type: 'info', delay: 500 },
      { text: '[AI] Loading SOL/USDT market data...', type: 'info', delay: 1000 },
      { text: '[AI] Analyzing 20-day moving average...', type: 'info', delay: 1500 },
      { text: '[AI] ✓ Price above MA(20) detected', type: 'success', delay: 2000 },
      { text: '[STRATEGY] Executing BUY signal...', type: 'command', delay: 2500 },
      { text: '[TRADE] BUY 100 SOL @ $98.50', type: 'success', delay: 3000 },
      { text: '[RISK] Stop loss set @ $93.58 (-5%)', type: 'warning', delay: 3500 },
      { text: '[AI] Monitoring position...', type: 'info', delay: 4000 },
      { text: '[AI] ✓ Strategy running successfully', type: 'success', delay: 4500 },
    ];

    const timeoutIds: NodeJS.Timeout[] = [];
    let lineIndex = 0;

    const addLine = () => {
      if (lineIndex < lines.length && lines[lineIndex]) {
        const currentLine = lines[lineIndex];
        setTerminalLines((prev) => [...prev, currentLine]);
        setCurrentLineIndex(lineIndex);
        lineIndex++;
        
        if (lineIndex < lines.length) {
          const delay = currentLine.delay || 500;
          const timeoutId = setTimeout(addLine, delay);
          timeoutIds.push(timeoutId);
        }
      }
    };

    // Start animation after a small delay
    const initialTimeout = setTimeout(() => {
      addLine();
    }, 300);
    timeoutIds.push(initialTimeout);

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [isVisible]);

  // Auto-scroll terminal to bottom when new lines are added
  useEffect(() => {
    if (terminalScrollRef.current && terminalLines.length > 0) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalLines, currentLineIndex]);

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
      default:
        return 'text-[#A9A9B3]';
    }
  };

  return (
    <div ref={sectionRef} className="relative">
      <div className="relative bg-[#0B0B0C] border border-[#1e1f22] rounded-lg overflow-hidden h-[600px]">
        {/* TradingView Chart - Non-interactive */}
        <div 
          className="pointer-events-none select-none h-full w-full" 
          style={{ 
            filter: 'brightness(0.7)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onMouseDown={(e) => e.preventDefault()}
          onMouseMove={(e) => e.preventDefault()}
          onClick={(e) => e.preventDefault()}
        >
          <div className="h-full w-full">
            <TradingViewWidget symbol="SOL" type="crypto" interval="D" />
          </div>
        </div>

        {/* Animated Overlay */}
        {isVisible && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#7CFF4F]/5 via-transparent to-[#0B0B0C]/95 pointer-events-none">
            {/* Strategy markers on chart */}
            <div className="absolute top-20 left-1/4 w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse shadow-[0_0_8px_rgba(124,255,79,0.4)]" />
            <div className="absolute top-32 left-1/3 w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse shadow-[0_0_8px_rgba(124,255,79,0.4)]" style={{ animationDelay: '1s' }} />
            <div className="absolute top-24 left-1/2 w-2 h-2 bg-[#5CFF8C] rounded-full animate-pulse shadow-[0_0_8px_rgba(92,255,140,0.4)]" style={{ animationDelay: '2s' }} />

            {/* Terminal Output Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#0B0B0C]/98 border-t border-[#1e1f22] p-4 font-mono text-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#7CFF4F] font-sans font-medium">[STRATEGY ENGINE]</span>
                <span className="w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse" />
              </div>
              <div ref={terminalScrollRef} className="space-y-1 max-h-32 overflow-y-auto">
                {terminalLines.map((line, idx) => {
                  if (!line || !line.type || !line.text) return null;
                  return (
                    <div
                      key={idx}
                      className={`${getLineColor(line.type)} transition-opacity duration-300 font-mono ${
                        idx === currentLineIndex ? 'opacity-100' : 'opacity-70'
                      }`}
                    >
                      <span className="text-[#6f7177]">$ </span>
                      {line.text}
                      {idx === currentLineIndex && <span className="terminal-cursor" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

