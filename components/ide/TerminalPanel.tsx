'use client';

import { useState, useEffect, useRef } from 'react';

interface TerminalPanelProps {
  strategyId: string;
}

export function TerminalPanel({ strategyId }: TerminalPanelProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock logs for demonstration
    const mockLogs = [
      '[INFO] Strategy loaded successfully',
      '[INFO] Auto-save enabled',
      '[INFO] Connected to Supabase',
    ];
    setLogs(mockLogs);

    // Scroll to bottom when logs update
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="h-8 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
        <div className="text-xs font-mono text-[#7CFF4F]">TERMINAL</div>
        <button className="text-xs font-mono text-[#A9A9B3] hover:text-white">
          CLEAR
        </button>
      </div>

      {/* Logs */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-xs"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {logs.map((log, idx) => (
          <div key={idx} className="mb-1 text-[#A9A9B3]">
            <span className="text-[#6f7177]">{new Date().toLocaleTimeString()}</span>
            {' '}
            <span>{log}</span>
          </div>
        ))}
        <div className="text-[#7CFF4F] flex items-center">
          <span className="mr-2">$</span>
          <span className="terminal-cursor">_</span>
        </div>
      </div>
    </div>
  );
}

