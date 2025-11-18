'use client';

import { useState, useEffect } from 'react';
import type { Strategy } from '@/types';

interface JSONEditorProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function JSONEditor({ strategy, onAutoSave }: JSONEditorProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setJsonText(JSON.stringify(strategy.json_logic || {}, null, 2));
      setError(null);
    } catch (err) {
      setError('Invalid JSON in strategy');
    }
  }, [strategy.json_logic]);

  const handleChange = (value: string) => {
    setJsonText(value);
    setError(null);

    try {
      const parsed = JSON.parse(value);
      // Update json_logic
      onAutoSave({ json_logic: parsed });
      
      // TODO: When AI backend is ready, convert JSON to blocks here
      // For now, blocks will sync when user switches to block mode
    } catch (err) {
      setError('Invalid JSON syntax');
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
      onAutoSave({ json_logic: parsed });
    } catch (err) {
      setError('Cannot format invalid JSON');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Toolbar */}
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
        <div className="text-xs font-mono text-[#A9A9B3]">
          JSON / Advanced Mode
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs font-mono text-[#FF617D]">{error}</span>
          )}
          <button
            onClick={handleFormat}
            className="px-3 py-1 text-xs font-mono bg-[#111214] border border-[#1e1f22] text-[#7CFF4F] hover:bg-[#151618] rounded"
          >
            FORMAT
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-4">
        <textarea
          value={jsonText}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-full bg-[#111214] border border-[#1e1f22] text-white font-mono text-sm p-4 rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F] resize-none"
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 border-t border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between text-xs font-mono text-[#6f7177]">
        <span>JSON Logic Schema</span>
        <span>{error ? '❌ Invalid' : '✓ Valid JSON'}</span>
      </div>
    </div>
  );
}

