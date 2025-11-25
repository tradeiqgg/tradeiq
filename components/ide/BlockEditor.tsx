'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Strategy } from '@/types';
import { TQBlockRegistry, TQBlockColors, getBlockSpec, type TQBlockSpec } from '@/lib/tql/blocks';
import { syncFromBlocks } from './core/IDESyncBridge';
import { useIDEEngine } from './core/IDEEngine';

interface BlockEditorProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
  selectedBlock?: BlockInstance | null;
  onSelectBlock?: (block: BlockInstance | null) => void;
}

export interface BlockInstance {
  id: string;
  blockId: string; // Block type from registry
  label: string;
  x: number;
  y: number;
  inputs: Record<string, any>; // Input values
}

export interface Connection {
  id: string;
  fromBlockId: string;
  fromPort: string;
  toBlockId: string;
  toPort: string;
}

export function BlockEditor({ strategy, onAutoSave, selectedBlock: externalSelectedBlock, onSelectBlock }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BlockInstance | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockInstance | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{ blockId: string; port: string } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const ideEngine = useIDEEngine();

  // Use external selected block if provided
  const currentSelectedBlock = externalSelectedBlock !== undefined ? externalSelectedBlock : selectedBlock;
  const handleSelectBlock = (block: BlockInstance | null) => {
    if (onSelectBlock) {
      onSelectBlock(block);
    } else {
      setSelectedBlock(block);
    }
  };

  // Load blocks from strategy
  useEffect(() => {
    if (strategy.block_schema?.blocks) {
      const loadedBlocks = strategy.block_schema.blocks.map((block: any, idx: number) => ({
        id: block.id || `block-${idx}`,
        blockId: block.blockId || block.type || 'value_number',
        label: block.label || 'Untitled',
        x: block.x || 50 + idx * 200,
        y: block.y || 50 + idx * 100,
        inputs: block.inputs || {},
      }));
      setBlocks(loadedBlocks);
      
      if (strategy.block_schema?.connections) {
        setConnections(strategy.block_schema.connections);
      }
    }
  }, [strategy.block_schema]);

  // Sync to JSON whenever blocks change
  useEffect(() => {
    const syncToJSON = () => {
      try {
        const blockTree = { blocks, connections };
        const result = syncFromBlocks(blockTree);
        
        if (result.json) {
          ideEngine.updateJSON(JSON.stringify(result.json, null, 2));
          onAutoSave({
            strategy_json: result.json,
            json_logic: result.json,
          });
        }
        
        if (result.tql) {
          ideEngine.updateTQL(result.tql);
          onAutoSave({
            strategy_tql: result.tql,
          });
        }
      } catch (error) {
        console.error('Block sync error:', error);
      }
    };

    if (blocks.length > 0) {
      const debounce = setTimeout(syncToJSON, 500);
      return () => clearTimeout(debounce);
    }
  }, [blocks, connections]);

  // Add block from palette
  const addBlock = (blockId: string) => {
    const spec = getBlockSpec(blockId);
    if (!spec) return;

    const newBlock: BlockInstance = {
      id: `block-${Date.now()}`,
      blockId,
      label: spec.label,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      inputs: {},
    };

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    saveBlocks(updatedBlocks, connections);
  };

  // Save blocks to strategy
  const saveBlocks = (updatedBlocks: BlockInstance[], updatedConnections: Connection[]) => {
    onAutoSave({
      block_schema: {
        blocks: updatedBlocks,
        connections: updatedConnections,
      },
    });
  };

  // Handle block dragging
  const handleMouseDown = (e: React.MouseEvent, block: BlockInstance) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - block.x;
    const offsetY = e.clientY - rect.top - block.y;
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedBlock(block);
    handleSelectBlock(block);
  };

  // Handle connection start
  const handlePortMouseDown = (e: React.MouseEvent, blockId: string, port: string, isOutput: boolean) => {
    e.stopPropagation();
    if (isOutput) {
      setConnectingFrom({ blockId, port });
    }
  };

  // Handle connection end
  const handlePortMouseUp = (blockId: string, port: string, isInput: boolean) => {
    if (isInput && connectingFrom) {
      // Create connection
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromBlockId: connectingFrom.blockId,
        fromPort: connectingFrom.port,
        toBlockId: blockId,
        toPort: port,
      };
      const updatedConnections = [...connections, newConnection];
      setConnections(updatedConnections);
      saveBlocks(blocks, updatedConnections);
      setConnectingFrom(null);
    }
  };

  // Global mouse handlers
  useEffect(() => {
    if (!draggedBlock || !dragOffset) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.id === draggedBlock.id ? { ...block, x, y } : block
        )
      );
    };

    const handleGlobalMouseUp = () => {
      if (draggedBlock) {
        saveBlocks(blocks, connections);
      }
      setDraggedBlock(null);
      setDragOffset(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedBlock, dragOffset, blocks, connections]);

  // Cancel connection on escape or canvas click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingFrom(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Delete selected block
  const deleteSelectedBlock = () => {
    if (!currentSelectedBlock) return;
    const updatedBlocks = blocks.filter(b => b.id !== currentSelectedBlock.id);
    const updatedConnections = connections.filter(
      c => c.fromBlockId !== currentSelectedBlock.id && c.toBlockId !== currentSelectedBlock.id
    );
    setBlocks(updatedBlocks);
    setConnections(updatedConnections);
    handleSelectBlock(null);
    saveBlocks(updatedBlocks, updatedConnections);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && currentSelectedBlock) {
        e.preventDefault();
        deleteSelectedBlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSelectedBlock]);

  // Get block position for rendering connections
  const getBlockCenter = (blockId: string, isOutput: boolean) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { x: 0, y: 0 };
    return {
      x: block.x + (isOutput ? 150 : 0), // 150px is block width
      y: block.y + 40, // Center vertically
    };
  };

  return (
    <div className="h-full flex bg-[#0B0B0C]">
      {/* Block Palette Sidebar */}
      {paletteOpen && (
        <div className="w-64 border-r border-[#1e1f22] bg-[#111214] overflow-y-auto" data-tutorial="block-palette">
          <div className="p-3 border-b border-[#1e1f22]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#7CFF4F] mb-2">
              Block Palette
            </h3>
          </div>
          <div className="p-2 space-y-2">
            {Object.values(TQBlockRegistry).map((spec) => (
              <button
                key={spec.id}
                data-tutorial={spec.id === 'indicator_rsi' ? 'indicator-rsi' : undefined}
                onClick={() => addBlock(spec.id)}
                className="w-full text-left px-3 py-2 rounded text-xs font-mono transition-all hover:bg-[#151618]"
                style={{
                  backgroundColor: `${spec.color}20`,
                  borderLeft: `3px solid ${spec.color}`,
                  color: spec.color,
                }}
              >
                <div className="font-semibold">{spec.label}</div>
                <div className="text-[10px] opacity-70 mt-1">{spec.category}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="px-3 py-1 text-xs font-mono bg-[#111214] border border-[#1e1f22] text-[#7CFF4F] hover:bg-[#151618] rounded"
            >
              {paletteOpen ? '◀ Hide Palette' : '▶ Show Palette'}
            </button>
            <div className="text-xs font-mono text-[#A9A9B3]">
              Blocks: {blocks.length} | Connections: {connections.length}
            </div>
          </div>
          {currentSelectedBlock && (
            <button
              onClick={deleteSelectedBlock}
              className="px-3 py-1 text-xs font-mono bg-[#FF617D]/20 border border-[#FF617D]/40 text-[#FF617D] hover:bg-[#FF617D]/30 rounded"
            >
              Delete Block
            </button>
          )}
        </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        data-tutorial="blocks-view"
        className="flex-1 relative overflow-auto bg-[#0B0B0C]"
        style={{
          backgroundImage: 'linear-gradient(#1e1f22 1px, transparent 1px), linear-gradient(90deg, #1e1f22 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        onClick={() => {
          handleSelectBlock(null);
          setConnectingFrom(null);
        }}
      >
          {/* SVG for connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn) => {
              const from = getBlockCenter(conn.fromBlockId, true);
              const to = getBlockCenter(conn.toBlockId, false);
              return (
                <line
                  key={conn.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#7CFF4F"
                  strokeWidth="2"
                  opacity="0.6"
                />
              );
            })}
          </svg>

          {/* Blocks */}
          {blocks.map((block) => {
            const spec = getBlockSpec(block.blockId);
            if (!spec) return null;

            const isSelected = currentSelectedBlock?.id === block.id;
            const isDragging = draggedBlock?.id === block.id;

            return (
              <div
                key={block.id}
                onMouseDown={(e) => handleMouseDown(e, block)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectBlock(block);
                }}
                className={`absolute cursor-move rounded border-2 transition-all select-none ${
                  isSelected ? 'ring-2 ring-[#7CFF4F]' : ''
                } ${isDragging ? 'opacity-50' : ''}`}
                style={{
                  left: `${block.x}px`,
                  top: `${block.y}px`,
                  width: '150px',
                  backgroundColor: `${spec.color}20`,
                  borderColor: spec.color,
                  zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
                }}
              >
                {/* Block Header */}
                <div
                  className="px-2 py-1 text-xs font-mono font-semibold"
                  style={{ color: spec.color }}
                >
                  {spec.label}
                </div>

                {/* Input Ports */}
                {spec.inputs.length > 0 && (
                  <div className="border-t" style={{ borderColor: `${spec.color}40` }}>
                    {spec.inputs.map((input, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono">
                        <div
                          className="w-2 h-2 rounded-full border cursor-pointer hover:scale-150 transition-transform"
                          style={{ borderColor: spec.color, backgroundColor: '#0B0B0C' }}
                          onMouseUp={() => handlePortMouseUp(block.id, input.name, true)}
                        />
                        <span style={{ color: `${spec.color}` }} className="opacity-70">{input.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Output Port */}
                {spec.output && (
                  <div className="border-t flex justify-end px-2 py-1" style={{ borderColor: `${spec.color}40` }}>
                    <div
                      className="w-2 h-2 rounded-full border cursor-pointer hover:scale-150 transition-transform"
                      style={{ borderColor: spec.color, backgroundColor: spec.color }}
                      onMouseDown={(e) => handlePortMouseDown(e, block.id, 'output', true)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl mb-4">🧩</div>
                <div className="text-sm font-mono text-[#A9A9B3]">
                  Drag blocks from the palette to start building your strategy
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
