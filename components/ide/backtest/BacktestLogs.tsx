// =====================================================================
// CHAPTER 8: Backtest Logs Viewer
// =====================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import type { BacktestResult } from '@/lib/backtester/types';

interface BacktestLogsProps {
  result: BacktestResult;
}

export function BacktestLogs({ result }: BacktestLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [result.logs]);

  const getLogLevel = (log: string): 'info' | 'warn' | 'error' => {
    if (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed')) {
      return 'error';
    }
    if (log.toLowerCase().includes('warning') || log.toLowerCase().includes('risk')) {
      return 'warn';
    }
    return 'info';
  };

  return (
    <div className="backtest-logs h-full flex flex-col p-4">
      <h3 className="text-lg font-semibold mb-4">Execution Logs</h3>
      <div className="logs-container flex-1 overflow-auto bg-gray-900 rounded p-4 font-mono text-sm">
        {result.logs.length === 0 ? (
          <div className="text-gray-500">No logs available</div>
        ) : (
          result.logs.map((log, index) => {
            const level = getLogLevel(log);
            return (
              <div
                key={index}
                className={`log-line mb-1 ${
                  level === 'error'
                    ? 'text-red-400'
                    : level === 'warn'
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                <span className="text-gray-500 mr-2">[{index + 1}]</span>
                {log}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

