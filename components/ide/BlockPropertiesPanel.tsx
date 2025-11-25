'use client';

import { getBlockSpec } from '@/lib/tql/blocks';

export interface BlockInstance {
  id: string;
  blockId: string;
  label: string;
  x: number;
  y: number;
  inputs: Record<string, any>;
}

interface BlockPropertiesPanelProps {
  selectedBlock: BlockInstance | null;
  onUpdateBlock: (blockId: string, updates: Partial<BlockInstance>) => void;
}

export function BlockPropertiesPanel({ selectedBlock, onUpdateBlock }: BlockPropertiesPanelProps) {
  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col bg-[#111214] overflow-y-auto">
        <div className="p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-4">
            Block Properties
          </div>
          <div className="text-xs font-mono text-[#6f7177] text-center py-8">
            Select a block to edit its properties
          </div>
        </div>
      </div>
    );
  }

  const spec = getBlockSpec(selectedBlock.blockId);
  if (!spec) {
    return (
      <div className="h-full flex flex-col bg-[#111214] overflow-y-auto p-4">
        <div className="text-xs font-mono text-[#FF617D]">Unknown block type</div>
      </div>
    );
  }

  const handleInputChange = (inputName: string, value: any) => {
    onUpdateBlock(selectedBlock.id, {
      inputs: {
        ...selectedBlock.inputs,
        [inputName]: value,
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#111214] overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-4">
          Block Properties
        </div>

        {/* Block Info */}
        <div>
          <label className="text-xs font-mono text-[#A9A9B3] mb-2 block">Block Type</label>
          <div
            className="text-sm font-mono px-3 py-2 rounded border"
            style={{
              backgroundColor: `${spec.color}20`,
              borderColor: spec.color,
              color: spec.color,
            }}
          >
            {spec.label}
          </div>
          <div className="text-xs font-mono text-[#6f7177] mt-2">{spec.description}</div>
        </div>

        {/* Block Label */}
        <div>
          <label className="text-xs font-mono text-[#A9A9B3] mb-2 block">Label</label>
          <input
            type="text"
            value={selectedBlock.label}
            onChange={(e) =>
              onUpdateBlock(selectedBlock.id, { label: e.target.value })
            }
            className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-sm rounded focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F]"
          />
        </div>

        {/* Block-specific inputs */}
        {spec.inputs.length > 0 && (
          <div>
            <label className="text-xs font-mono text-[#A9A9B3] mb-2 block">Parameters</label>
            <div className="space-y-3">
              {spec.inputs.map((inputSpec, index) => {
                const currentValue = selectedBlock.inputs[inputSpec.name] || '';
                
                return (
                  <div key={index} className="p-3 bg-[#0B0B0C] rounded border border-[#1e1f22]">
                    <div className="text-xs font-mono text-[#7CFF4F] mb-1">{inputSpec.name}</div>
                    <div className="text-xs font-mono text-[#6f7177] mb-2">{inputSpec.description}</div>
                    
                    {inputSpec.type === 'boolean' ? (
                      <select
                        value={currentValue.toString()}
                        onChange={(e) => handleInputChange(inputSpec.name, e.target.value === 'true')}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : inputSpec.type === 'number' ? (
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleInputChange(inputSpec.name, Number(e.target.value))}
                        placeholder={inputSpec.description}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      />
                    ) : inputSpec.name === 'operator' ? (
                      <select
                        value={currentValue}
                        onChange={(e) => handleInputChange(inputSpec.name, e.target.value)}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      >
                        <option value="gt">&gt; (greater than)</option>
                        <option value="lt">&lt; (less than)</option>
                        <option value="gte">&gt;= (greater or equal)</option>
                        <option value="lte">&lt;= (less or equal)</option>
                        <option value="eq">== (equal)</option>
                        <option value="neq">!= (not equal)</option>
                      </select>
                    ) : inputSpec.name === 'direction' && selectedBlock.blockId === 'entry_market' ? (
                      <select
                        value={currentValue}
                        onChange={(e) => handleInputChange(inputSpec.name, e.target.value)}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      >
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                      </select>
                    ) : inputSpec.name === 'direction' && selectedBlock.blockId === 'exit_position' ? (
                      <select
                        value={currentValue}
                        onChange={(e) => handleInputChange(inputSpec.name, e.target.value)}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      >
                        <option value="any">Any</option>
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                      </select>
                    ) : inputSpec.name === 'size_mode' ? (
                      <select
                        value={currentValue}
                        onChange={(e) => handleInputChange(inputSpec.name, e.target.value)}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      >
                        <option value="percent">Percent</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={typeof currentValue === 'object' ? JSON.stringify(currentValue) : currentValue}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            handleInputChange(inputSpec.name, parsed);
                          } catch {
                            handleInputChange(inputSpec.name, e.target.value);
                          }
                        }}
                        placeholder={inputSpec.description}
                        className="w-full px-2 py-1 bg-[#111214] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Position (for debugging/fine-tuning) */}
        <div>
          <label className="text-xs font-mono text-[#A9A9B3] mb-2 block">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={Math.round(selectedBlock.x)}
              onChange={(e) =>
                onUpdateBlock(selectedBlock.id, { x: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
              placeholder="X"
            />
            <input
              type="number"
              value={Math.round(selectedBlock.y)}
              onChange={(e) =>
                onUpdateBlock(selectedBlock.id, { y: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono text-xs rounded focus:outline-none focus:border-[#7CFF4F]"
              placeholder="Y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
