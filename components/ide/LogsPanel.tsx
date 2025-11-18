'use client';

import { useState } from 'react';

interface LogsPanelProps {
  strategyId: string;
}

export function LogsPanel({ strategyId }: LogsPanelProps) {
  const [logs] = useState([
    { level: 'info', message: 'Strategy initialized', timestamp: new Date() },
    { level: 'info', message: 'Auto-save enabled', timestamp: new Date() },
    { level: 'success', message: 'Block added successfully', timestamp: new Date() },
    { level: 'warning', message: 'JSON validation warning', timestamp: new Date() },
  ]);

  const levelColors = {
    info: 'text-[#3498DB]',
    success: 'text-[#7CFF4F]',
    warning: 'text-[#E7FF5C]',
    error: 'text-[#FF617D]',
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
        <div className="text-xs font-mono text-[#7CFF4F]">LOGS & OUTPUT</div>
        <button className="text-xs font-mono text-[#A9A9B3] hover:text-white">
          CLEAR
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {logs.map((log, idx) => (
          <div key={idx} className="mb-2 flex items-start gap-2">
            <span className="text-[#6f7177]">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className={levelColors[log.level as keyof typeof levelColors]}>
              [{log.level.toUpperCase()}]
            </span>
            <span className="text-[#A9A9B3]">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

