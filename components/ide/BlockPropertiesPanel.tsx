'use client';

import { useState, useEffect } from 'react';
import type { DraggableBlock } from './BlockEditor';

interface BlockPropertiesPanelProps {
  selectedBlock: DraggableBlock | null;
  onUpdateBlock: (blockId: string, updates: Partial<DraggableBlock>) => void;
}

export function BlockPropertiesPanel({ selectedBlock, onUpdateBlock }: BlockPropertiesPanelProps) {
  const [localBlock, setLocalBlock] = useState<DraggableBlock | null>(selectedBlock);

  useEffect(() => {
    setLocalBlock(selectedBlock);
  }, [selectedBlock]);

  if (!selectedBlock || !localBlock) {
    return (
      <div className="h-full flex flex-col bg-[#111214]">
        <div className="p-4 border-b border-[#1e1f22]">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F]">
            BLOCK PROPERTIES
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🧩</div>
            <div className="text-sm font-mono text-[#6f7177]">
              Select a block to edit
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<DraggableBlock>) => {
    const updated = { ...localBlock, ...updates };
    setLocalBlock(updated);
    onUpdateBlock(localBlock.id, updates);
  };

  return (
    <div className="h-full flex flex-col bg-[#111214] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e1f22]">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-1">
          BLOCK PROPERTIES
        </h2>
        <div className="text-xs font-mono text-[#A9A9B3]">
          {localBlock.type}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Label */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
            LABEL
          </label>
          <input
            type="text"
            value={localBlock.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F]"
            placeholder="Block label"
          />
        </div>

        {/* Type Display */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
            TYPE
          </label>
          <div className="px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded">
            {localBlock.type}
          </div>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
              X POSITION
            </label>
            <input
              type="number"
              value={Math.round(localBlock.x)}
              onChange={(e) => handleUpdate({ x: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F]"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
              Y POSITION
            </label>
            <input
              type="number"
              value={Math.round(localBlock.y)}
              onChange={(e) => handleUpdate({ y: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F]"
            />
          </div>
        </div>

        {/* Inputs */}
        {localBlock.inputs && localBlock.inputs.length > 0 && (
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2 block">
              INPUTS
            </label>
            <div className="space-y-2">
              {localBlock.inputs.map((input, idx) => (
                <div key={idx} className="p-3 bg-[#0B0B0C] border border-[#1e1f22] rounded">
                  <div className="text-xs font-mono text-[#A9A9B3] mb-1">{input.name}</div>
                  <input
                    type={input.type === 'number' ? 'number' : 'text'}
                    value={input.value}
                    onChange={(e) => {
                      const updatedInputs = [...(localBlock.inputs || [])];
                      updatedInputs[idx] = { ...input, value: e.target.value };
                      handleUpdate({ inputs: updatedInputs });
                    }}
                    className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Input Button */}
        <div>
          <button
            onClick={() => {
              const newInputs = [...(localBlock.inputs || []), { name: 'input', type: 'string', value: '' }];
              handleUpdate({ inputs: newInputs });
            }}
            className="w-full px-3 py-2 bg-[#7CFF4F]/20 border border-[#7CFF4F]/40 text-[#7CFF4F] font-mono text-xs rounded hover:bg-[#7CFF4F]/30 transition-colors"
          >
            + ADD INPUT
          </button>
        </div>
      </div>
    </div>
  );
}

