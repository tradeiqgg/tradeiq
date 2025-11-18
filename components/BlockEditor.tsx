'use client';

import { useState } from 'react';
import type { Block } from '@/types';

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, onBlocksChange }: BlockEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  return (
    <div className="h-full flex flex-col terminal-panel">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-mono uppercase tracking-wider text-primary">BLOCK EDITOR</h3>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Drag and drop blocks to build your strategy
        </p>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center font-mono">
              <p className="text-lg mb-2">NO BLOCKS YET</p>
              <p className="text-sm">Blocks will appear here after AI conversion</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block)}
                className={`p-3 border cursor-pointer transition-all neon-hover animate-fade-in ${
                  selectedBlock?.id === block.id
                    ? 'border-primary bg-primary/10 glow-lime'
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-sm font-semibold">{block.label}</span>
                  <span className="text-xs text-primary uppercase">{block.type}</span>
                </div>
                {block.inputs.length > 0 && (
                  <div className="mt-2 space-y-1 pt-2 border-t border-border/50">
                    {block.inputs.map((input, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground font-mono">
                        <span className="text-primary">{input.name}:</span> {String(input.value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedBlock && (
        <div className="p-4 border-t border-border bg-muted/30">
          <h4 className="text-xs font-mono uppercase tracking-wider text-primary mb-2">BLOCK DETAILS</h4>
          <pre className="text-xs overflow-auto max-h-32 font-mono bg-background p-2 border border-border">
            {JSON.stringify(selectedBlock, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

