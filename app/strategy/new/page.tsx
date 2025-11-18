'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { BlockEditor } from '@/components/BlockEditor';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import type { Block } from '@/types';

export default function NewStrategyPage() {
  const [mounted, setMounted] = useState(false);
  const { connected, connecting } = useWalletSafe();
  const router = useRouter();
  const { user } = useAuthStore();
  const { createStrategy, isLoading } = useStrategyStore();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [jsonLogic, setJsonLogic] = useState<Record<string, any>>({});
  const [pseudocode, setPseudocode] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!connected && !connecting) {
      router.replace('/');
      return;
    }
  }, [connected, connecting, mounted, router]);

  if (!mounted) {
    return null;
  }

  if (!connected || !user) {
    return null;
  }

  const handleConvert = async () => {
    if (!prompt.trim() || !user) return;

    // TODO: Call AI API to convert prompt to blocks, JSON logic, and pseudocode
    // For now, create mock data
    const mockBlocks: Block[] = [
      {
        id: '1',
        type: 'condition',
        label: 'Price > Moving Average',
        inputs: [
          { name: 'price', type: 'number', value: 100 },
          { name: 'ma', type: 'number', value: 95 },
        ],
      },
      {
        id: '2',
        type: 'action',
        label: 'Buy',
        inputs: [{ name: 'amount', type: 'number', value: 100 }],
      },
    ];

    const mockJsonLogic = {
      condition: 'price > ma',
      action: 'buy',
    };

    const mockPseudocode = `
      IF price > moving_average(20) THEN
        BUY 100 shares
      END IF
    `;

    setBlocks(mockBlocks);
    setJsonLogic(mockJsonLogic);
    setPseudocode(mockPseudocode);
  };

  const handleSave = async () => {
    if (!title.trim() || !prompt.trim() || !user) return;

    try {
      await createStrategy({
        user_id: user.id,
        title,
        raw_prompt: prompt,
        json_logic: jsonLogic,
        block_schema: { blocks },
        pseudocode,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save strategy:', error);
    }
  };

  return (
    <LayoutShell>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        <div className="mb-6">
          <h1 className="terminal-section-header">== CREATE STRATEGY ==</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Write your strategy in plain English. AI will convert it to executable code.
          </p>
        </div>

        {/* Top Ribbon */}
        <div className="mb-4 flex items-center gap-4 px-4 py-2 terminal-panel">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              AI MODEL: LLAMA3 (GROQ)
            </span>
          </div>
          <div className="flex-1"></div>
          <span className="text-xs font-mono text-muted-foreground">
            STATUS: <span className="text-primary">READY</span>
          </span>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          {/* Panel 1: Prompt Input - Terminal Window */}
          <div className="flex flex-col terminal-panel overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-mono uppercase tracking-wider text-primary">STRATEGY PROMPT</h3>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="MY_TRADING_STRATEGY"
                  className="terminal-input w-full"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">DESCRIBE YOUR STRATEGY</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Buy when price crosses above the 20-day moving average, sell when RSI is above 70..."
                  className="flex-1 w-full terminal-input font-mono text-sm resize-none"
                />
                <div className="mt-2 text-xs text-muted-foreground font-mono terminal-cursor">
                  Ready for input...
                </div>
              </div>
              <button
                onClick={handleConvert}
                disabled={!prompt.trim() || isLoading}
                className="terminal-button w-full"
              >
                {isLoading ? <span className="terminal-spinner" /> : 'CONVERT WITH AI'}
              </button>
            </div>
          </div>

          {/* Panel 2: Block Editor */}
          <div className="flex flex-col overflow-hidden">
            <BlockEditor blocks={blocks} onBlocksChange={setBlocks} />
          </div>

          {/* Panel 3: JSON + Pseudocode - Terminal Output */}
          <div className="flex flex-col terminal-panel overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-mono uppercase tracking-wider text-primary">CODE OUTPUT</h3>
            </div>
            <div className="flex-1 p-4 overflow-auto space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-primary mb-2">JSON LOGIC</h4>
                <pre className="text-xs bg-background p-3 border border-border overflow-auto max-h-48 font-mono">
                  {JSON.stringify(jsonLogic, null, 2) || '// JSON logic will appear here'}
                </pre>
                <button
                  onClick={() => {
                    if (Object.keys(jsonLogic).length > 0) {
                      navigator.clipboard.writeText(JSON.stringify(jsonLogic, null, 2));
                    }
                  }}
                  className="mt-2 text-xs terminal-button"
                  disabled={Object.keys(jsonLogic).length === 0}
                >
                  COPY JSON
                </button>
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-primary mb-2">PSEUDOCODE</h4>
                <div className="bg-background p-3 border border-border overflow-auto max-h-48 font-mono text-xs whitespace-pre-wrap text-foreground terminal-cursor">
                  {pseudocode || '// Pseudocode will appear here'}
                </div>
                <button
                  onClick={() => {
                    if (pseudocode) {
                      navigator.clipboard.writeText(pseudocode);
                    }
                  }}
                  className="mt-2 text-xs terminal-button"
                  disabled={!pseudocode}
                >
                  COPY CODE
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <button
                onClick={handleSave}
                disabled={!title.trim() || !prompt.trim() || isLoading}
                className="terminal-button w-full"
              >
                SAVE STRATEGY
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

