'use client';

import { useState, useEffect, useRef } from 'react';
import type { Strategy, Block } from '@/types';

interface BlockEditorProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
  selectedBlock?: DraggableBlock | null;
  onSelectBlock?: (block: DraggableBlock | null) => void;
}

export interface DraggableBlock {
  id: string;
  type: 'condition' | 'action' | 'indicator' | 'operator';
  label: string;
  x: number;
  y: number;
  inputs?: Array<{ name: string; type: string; value: any }>;
}

export function BlockEditor({ strategy, onAutoSave, selectedBlock: externalSelectedBlock, onSelectBlock }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<DraggableBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<DraggableBlock | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<DraggableBlock | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use external selected block if provided, otherwise use internal state
  const currentSelectedBlock = externalSelectedBlock !== undefined ? externalSelectedBlock : selectedBlock;
  const handleSelectBlock = (block: DraggableBlock | null) => {
    if (onSelectBlock) {
      onSelectBlock(block);
    } else {
      setSelectedBlock(block);
    }
  };

  useEffect(() => {
    // Load blocks from strategy
    if (strategy.block_schema?.blocks) {
      const loadedBlocks = strategy.block_schema.blocks.map((block: any, idx: number) => ({
        id: block.id || `block-${idx}`,
        type: block.type || 'condition',
        label: block.label || 'Untitled Block',
        x: block.x || 50 + idx * 200,
        y: block.y || 50 + idx * 100,
        inputs: block.inputs || [],
      }));
      setBlocks(loadedBlocks);
    }
  }, [strategy.block_schema]);

  const blockColors = {
    condition: '#7CFF4F', // Green
    indicator: '#9B59B6', // Purple
    action: '#3498DB', // Blue
    operator: '#E7FF5C', // Yellow
  };

  const handleMouseDown = (e: React.MouseEvent, block: DraggableBlock) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - block.x;
    const offsetY = e.clientY - rect.top - block.y;
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedBlock(block);
    handleSelectBlock(block);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedBlock || !canvasRef.current || !dragOffset) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    // Update block position in real-time
    const updatedBlocks = blocks.map(block =>
      block.id === draggedBlock.id ? { ...block, x, y } : block
    );
    setBlocks(updatedBlocks);
  };

  const handleMouseUp = () => {
    if (draggedBlock) {
      // Final save on mouse up
      onAutoSave({
        block_schema: {
          blocks: blocks,
        },
      });
    }
    setDraggedBlock(null);
    setDragOffset(null);
  };

  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Initialize drag position when dragging starts
  useEffect(() => {
    if (draggedBlock && dragOffset && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragPosition({
        x: draggedBlock.x,
        y: draggedBlock.y,
      });
    }
  }, [draggedBlock, dragOffset]);

  // Handle mouse move and up globally
  useEffect(() => {
    if (draggedBlock && dragOffset) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;

        // Update drag position for preview
        setDragPosition({ x, y });

        // Update block position
        setBlocks(prevBlocks => 
          prevBlocks.map(block =>
            block.id === draggedBlock.id ? { ...block, x, y } : block
          )
        );
      };

      const handleGlobalMouseUp = () => {
        if (draggedBlock) {
          setBlocks(prevBlocks => {
            onAutoSave({
              block_schema: {
                blocks: prevBlocks,
              },
            });
            return prevBlocks;
          });
        }
        setDraggedBlock(null);
        setDragOffset(null);
        setDragPosition(null);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggedBlock, dragOffset, onAutoSave]);

  const addBlock = (type: DraggableBlock['type']) => {
    const newBlock: DraggableBlock = {
      id: `block-${Date.now()}`,
      type,
      label: `New ${type}`,
      x: 100,
      y: 100,
      inputs: [],
    };

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    onAutoSave({
      block_schema: {
        blocks: updatedBlocks,
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Toolbar */}
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center gap-2">
        <div className="text-xs font-mono text-[#A9A9B3]">Block Palette:</div>
        <button
          onClick={() => addBlock('condition')}
          className="px-3 py-1 text-xs font-mono bg-[#7CFF4F]/20 text-[#7CFF4F] hover:bg-[#7CFF4F]/30 rounded border border-[#7CFF4F]/40"
        >
          + Condition
        </button>
        <button
          onClick={() => addBlock('indicator')}
          className="px-3 py-1 text-xs font-mono bg-[#9B59B6]/20 text-[#9B59B6] hover:bg-[#9B59B6]/30 rounded border border-[#9B59B6]/40"
        >
          + Indicator
        </button>
        <button
          onClick={() => addBlock('action')}
          className="px-3 py-1 text-xs font-mono bg-[#3498DB]/20 text-[#3498DB] hover:bg-[#3498DB]/30 rounded border border-[#3498DB]/40"
        >
          + Action
        </button>
        <button
          onClick={() => addBlock('operator')}
          className="px-3 py-1 text-xs font-mono bg-[#E7FF5C]/20 text-[#E7FF5C] hover:bg-[#E7FF5C]/30 rounded border border-[#E7FF5C]/40"
        >
          + Operator
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 relative overflow-auto bg-[#0B0B0C]"
        style={{
          backgroundImage: 'linear-gradient(#1e1f22 1px, transparent 1px), linear-gradient(90deg, #1e1f22 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {blocks.map((block) => {
          // Hide the original block if it's being dragged
          const isDragging = draggedBlock?.id === block.id;
          return (
            <div
              key={block.id}
              onMouseDown={(e) => handleMouseDown(e, block)}
              onClick={() => handleSelectBlock(block)}
              className={`absolute cursor-move p-3 rounded border-2 transition-all select-none ${
                currentSelectedBlock?.id === block.id ? 'ring-2 ring-[#7CFF4F]' : ''
              } ${isDragging ? 'opacity-0 pointer-events-none' : ''}`}
              style={{
                left: `${block.x}px`,
                top: `${block.y}px`,
                backgroundColor: `${blockColors[block.type]}20`,
                borderColor: blockColors[block.type],
                color: blockColors[block.type],
                zIndex: isDragging ? 1000 : 1,
              }}
            >
              <div className="text-xs font-mono font-semibold">{block.label}</div>
              <div className="text-xs font-mono opacity-70 mt-1">{block.type}</div>
            </div>
          );
        })}
        {/* Dragged block preview - only visible while dragging, follows cursor */}
        {draggedBlock && dragPosition && (
          <div
            className="absolute cursor-move p-3 rounded border-2 pointer-events-none"
            style={{
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
              backgroundColor: `${blockColors[draggedBlock.type]}20`,
              borderColor: blockColors[draggedBlock.type],
              color: blockColors[draggedBlock.type],
              zIndex: 1001,
              opacity: 0.9,
            }}
          >
            <div className="text-xs font-mono font-semibold">{draggedBlock.label}</div>
            <div className="text-xs font-mono opacity-70 mt-1">{draggedBlock.type}</div>
          </div>
        )}
      </div>
    </div>
  );
}

