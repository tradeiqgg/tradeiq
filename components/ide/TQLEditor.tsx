'use client';

import { useState, useEffect } from 'react';
import type { Strategy } from '@/types';
import { syncFromTQL } from './core/IDESyncBridge';
import { useIDEEngine } from './core/IDEEngine';
import { TQLLexer } from '@/lib/tql/lexer';
import { TQLParser } from '@/lib/tql/parser';
import { compileTQLToJSON, compileJSONToTQL } from '@/lib/tql/compiler';

interface TQLEditorProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function TQLEditor({ strategy, onAutoSave }: TQLEditorProps) {
  const [tqlText, setTqlText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const ideEngine = useIDEEngine();

  useEffect(() => {
    // Load TQL from strategy when component mounts or strategy changes
    if (strategy.strategy_tql) {
      setTqlText(strategy.strategy_tql);
      ideEngine.updateTQL(strategy.strategy_tql);
    } else if (strategy.strategy_json) {
      // Generate TQL from JSON
      try {
        const tql = compileJSONToTQL(strategy.strategy_json as any);
        if (tql) {
          setTqlText(tql);
          ideEngine.updateTQL(tql);
        } else {
          setTqlText(getDefaultTQL());
        }
      } catch (e) {
        console.error('Failed to generate TQL from JSON:', e);
        setTqlText(getDefaultTQL());
      }
    } else {
      const defaultTql = getDefaultTQL();
      setTqlText(defaultTql);
      ideEngine.updateTQL(defaultTql);
    }
  }, [strategy.id, strategy.strategy_tql, strategy.strategy_json, ideEngine]);

  const handleChange = (value: string) => {
    setTqlText(value);
    setErrors([]);
    setWarnings([]);

    // Update IDE engine immediately for UI responsiveness
    ideEngine.updateTQL(value);

    // Debounce the compilation and save
    if (handleChange.timeout) {
      clearTimeout(handleChange.timeout);
    }

    handleChange.timeout = setTimeout(() => {
      // Validate and compile
      try {
        const lexer = new TQLLexer(value);
        const tokens = lexer.tokenize();

        if (tokens.errors.length > 0) {
          setErrors(tokens.errors.map(e => e.message));
          // Still save the TQL text even if there are errors
          onAutoSave({
            strategy_tql: value,
          });
          return;
        }

        const parser = new TQLParser(tokens.tokens);
        const ast = parser.parse();

        if (!ast.ast) {
          setErrors(ast.errors.map(e => e.message));
          onAutoSave({
            strategy_tql: value,
          });
          return;
        }

        // Compile to JSON
        const compileResult = compileTQLToJSON(ast.ast);
        
        if (compileResult.errors.length > 0) {
          setErrors(compileResult.errors.map(e => e.message));
        }

        if (compileResult.json) {
          // Update IDE engine
          ideEngine.updateJSON(JSON.stringify(compileResult.json, null, 2));

          // Sync to blocks - auto-generate blocks from TQL
          const syncResult = syncFromTQL(value);
          if (syncResult.blocks) {
            ideEngine.updateBlocks(syncResult.blocks);
            // Also update the strategy's block_schema
            onAutoSave({
              block_schema: syncResult.blocks,
            });
          }

          // Save to strategy
          onAutoSave({
            strategy_tql: value,
            strategy_json: compileResult.json,
            json_logic: compileResult.json,
          });
        } else {
          // Save TQL even if JSON compilation failed
          onAutoSave({
            strategy_tql: value,
          });
        }
      } catch (err: any) {
        setErrors([err.message || 'Compilation error']);
        // Still save the TQL text
        onAutoSave({
          strategy_tql: value,
        });
      }
    }, 500); // 500ms debounce
  };

  // Add timeout property to function
  handleChange.timeout = null as any;

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Toolbar */}
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
        <div className="text-xs font-mono text-[#A9A9B3]">
          TQL Code Editor
        </div>
        <div className="flex items-center gap-2">
          {errors.length === 0 && warnings.length === 0 ? (
            <span className="text-xs font-mono text-[#7CFF4F]">✓ Valid</span>
          ) : errors.length > 0 ? (
            <span className="text-xs font-mono text-[#FF617D]">✗ {errors.length} Error(s)</span>
          ) : (
            <span className="text-xs font-mono text-[#E7FF5C]">⚠ {warnings.length} Warning(s)</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-4">
        <textarea
          data-tutorial="tql-editor"
          value={tqlText}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-full bg-[#111214] border border-[#1e1f22] text-white font-mono text-sm p-4 rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F] resize-none"
          spellCheck={false}
          style={{
            tabSize: 2,
            lineHeight: '1.5',
          }}
        />
      </div>

      {/* Error Panel */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="border-t border-[#1e1f22] bg-[#111214] p-4 max-h-48 overflow-auto">
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div key={`error-${idx}`} className="text-xs font-mono text-[#FF617D] flex items-start gap-2">
                <span className="opacity-70">✗</span>
                <span>{error}</span>
              </div>
            ))}
            {warnings.map((warning, idx) => (
              <div key={`warning-${idx}`} className="text-xs font-mono text-[#E7FF5C] flex items-start gap-2">
                <span className="opacity-70">⚠</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 border-t border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between text-xs font-mono text-[#6f7177]">
        <span>TradeIQ Query Language (TQL)</span>
        <span>{tqlText.split('\n').length} lines</span>
      </div>
    </div>
  );
}

function getDefaultTQL(): string {
  return `meta {
  name: "My Trading Strategy"
  description: "Enter your strategy description"
}

settings {
  symbol: BTCUSDT
  timeframe: 1h
  initial_balance: 1000
  position_mode: long_only
}

indicators {
  rsi = rsi(period: 14)
  ma20 = sma(period: 20)
}

rules {
  entry {
    when rsi < 30 and close > ma20 then enter long size:10%
  }
  
  exit {
    when rsi > 70 then exit any
  }
}

risk {
  stop_loss: 3%
  take_profit: 5%
  position_size: 10%
}`;
}

