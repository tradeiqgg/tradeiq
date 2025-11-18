'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';

interface BacktestPanelProps {
  strategy: Strategy;
}

export function BacktestPanel({ strategy }: BacktestPanelProps) {
  const [symbol, setSymbol] = useState('BTC/USD');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    // Simulate backtest progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Mock backtest completion
    setTimeout(() => {
      clearInterval(interval);
      setIsRunning(false);
      setProgress(100);
      setResults({
        pnl: 1250.50,
        totalTrades: 45,
        winRate: 62.5,
        maxDrawdown: -8.2,
        sharpeRatio: 1.85,
        trades: [
          { entry: 45000, exit: 46500, pnl: 1500, type: 'long' },
          { entry: 47000, exit: 45500, pnl: -1500, type: 'long' },
        ],
      });
    }, 5000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Controls */}
      <div className="border-b border-[#1e1f22] bg-[#111214] p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
              SYMBOL
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F]"
              placeholder="BTC/USD"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F]"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
              END DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F]"
            />
          </div>
        </div>
        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="w-full px-4 py-2 text-sm font-mono bg-[#7CFF4F] text-[#0B0B0C] hover:bg-[#70e84b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          {isRunning ? `RUNNING BACKTEST... ${progress}%` : 'RUN BACKTEST'}
        </button>
        {isRunning && (
          <div className="w-full bg-[#0B0B0C] rounded h-2 overflow-hidden">
            <div
              className="h-full bg-[#7CFF4F] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-4">
        {results ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#111214] border border-[#1e1f22] p-4 rounded">
                <div className="text-xs font-mono text-[#6f7177] mb-1">Total PnL</div>
                <div className={`text-xl font-mono font-semibold ${results.pnl >= 0 ? 'text-[#7CFF4F]' : 'text-[#FF617D]'}`}>
                  ${results.pnl.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#111214] border border-[#1e1f22] p-4 rounded">
                <div className="text-xs font-mono text-[#6f7177] mb-1">Total Trades</div>
                <div className="text-xl font-mono font-semibold text-white">{results.totalTrades}</div>
              </div>
              <div className="bg-[#111214] border border-[#1e1f22] p-4 rounded">
                <div className="text-xs font-mono text-[#6f7177] mb-1">Win Rate</div>
                <div className="text-xl font-mono font-semibold text-[#7CFF4F]">{results.winRate}%</div>
              </div>
              <div className="bg-[#111214] border border-[#1e1f22] p-4 rounded">
                <div className="text-xs font-mono text-[#6f7177] mb-1">Sharpe Ratio</div>
                <div className="text-xl font-mono font-semibold text-white">{results.sharpeRatio}</div>
              </div>
            </div>

            {/* Trades Table */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2">
                TRADES
              </div>
              <div className="bg-[#111214] border border-[#1e1f22] rounded overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-[#151618] border-b border-[#1e1f22]">
                    <tr>
                      <th className="text-left p-2 text-[#7CFF4F]">Entry</th>
                      <th className="text-left p-2 text-[#7CFF4F]">Exit</th>
                      <th className="text-left p-2 text-[#7CFF4F]">Type</th>
                      <th className="text-left p-2 text-[#7CFF4F]">PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.trades.map((trade: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#1e1f22]">
                        <td className="p-2 text-white">${trade.entry.toLocaleString()}</td>
                        <td className="p-2 text-white">${trade.exit.toLocaleString()}</td>
                        <td className="p-2 text-[#A9A9B3]">{trade.type}</td>
                        <td className={`p-2 ${trade.pnl >= 0 ? 'text-[#7CFF4F]' : 'text-[#FF617D]'}`}>
                          ${trade.pnl.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-4">📊</div>
              <div className="text-sm font-mono text-[#A9A9B3]">
                Configure backtest parameters and click "RUN BACKTEST"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

