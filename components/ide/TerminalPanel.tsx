'use client';

import { useState, useEffect, useRef } from 'react';
import { backtestLogStream, type LogEntry } from '@/lib/backtester/logStream';

interface TerminalPanelProps {
  strategyId: string;
}

export function TerminalPanel({ strategyId }: TerminalPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to log stream
    const unsubscribe = backtestLogStream.subscribe((logEntry) => {
      setLogs((prev) => [...prev, logEntry]);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 10);
    });

    // Load existing logs
    const existingLogs = backtestLogStream.getLogs();
    setLogs(existingLogs);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleClear = () => {
    backtestLogStream.clear();
    setLogs([]);
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-[#FF617D]';
      case 'warn':
        return 'text-[#E7FF5C]';
      case 'trade':
        return 'text-[#7CFF4F]';
      case 'reasoning':
        return 'text-[#4FD0FF]';
      default:
        return 'text-[#A9A9B3]';
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'trade':
        return '💰';
      case 'reasoning':
        return '🧠';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="h-8 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
        <div className="text-xs font-mono text-[#7CFF4F]">TERMINAL</div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[#6f7177]">
            {logs.length} logs
          </span>
          <button
            onClick={handleClear}
            className="text-xs font-mono text-[#A9A9B3] hover:text-white transition-colors"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Logs */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-xs"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {logs.length === 0 ? (
          <div className="text-[#6f7177] italic">
            No logs yet. Start a backtest to see real-time output...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className={`mb-1 ${getLogColor(log.level)}`}>
              <span className="text-[#6f7177] mr-2">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="mr-2">{getLogIcon(log.level)}</span>
              <span>{log.message}</span>
              {log.data && process.env.NODE_ENV === 'development' && (
                <details className="ml-4 mt-1 text-[#6f7177]">
                  <summary className="cursor-pointer text-xs">Details</summary>
                  <pre className="mt-1 text-[10px] overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
        <div className="text-[#7CFF4F] flex items-center mt-2">
          <span className="mr-2">$</span>
          <span className="terminal-cursor animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}

