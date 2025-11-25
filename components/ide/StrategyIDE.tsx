'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Strategy } from '@/types';
import { StrategySidebar } from './StrategySidebar';
import { IDETabs } from './IDETabs';
import { TerminalPanel } from './TerminalPanel';
import { ChartSidebar } from './ChartSidebar';
import { BlockPropertiesPanel, type BlockInstance } from './BlockPropertiesPanel';
import { useStrategyStore } from '@/stores/strategyStore';
import { useCloudSync } from '@/lib/cloud/useCloudSync';
import { useAuthStore } from '@/stores/authStore';
import { useIDEEngine } from './core/IDEEngine';
import { syncFromJSON } from './core/IDESyncBridge';
import { ErrorBoundary } from './ErrorBoundary';
import { TutorialManager } from '@/components/tutorial';

interface StrategyIDEProps {
  strategy: Strategy;
}

export function StrategyIDE({ strategy: initialStrategy }: StrategyIDEProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'blocks' | 'json' | 'backtests' | 'chat' | 'logs' | 'research' | 'settings' | 'live' | 'alerts' | 'examples'>('blocks');
  const [selectedBlock, setSelectedBlock] = useState<BlockInstance | null>(null);
  const [strategy, setStrategy] = useState<Strategy>(initialStrategy);
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { updateStrategy } = useStrategyStore();
  const { user } = useAuthStore();
  
  // Chapter 10: Cloud sync integration
  // This enables autosave every 3 seconds when strategy is valid
  useCloudSync(strategy.id);

  // Initialize IDE Engine with strategy data
  const ideEngine = useIDEEngine();
  
  useEffect(() => {
    // Initialize IDE engine with strategy data
    if (initialStrategy) {
      ideEngine.setStrategyId(initialStrategy.id);
      ideEngine.setStrategyName(initialStrategy.title || 'Untitled Strategy');
      
      // Load strategy JSON into IDE engine
      if (initialStrategy.strategy_json) {
        const json = initialStrategy.strategy_json as any;
        ideEngine.updateJSON(JSON.stringify(json, null, 2));
        
        // Sync to TQL and blocks
        const syncResult = syncFromJSON(json);
        if (syncResult.tql) {
          ideEngine.updateTQL(syncResult.tql);
        }
        if (syncResult.blocks) {
          ideEngine.updateBlocks(syncResult.blocks);
        }
      } else if (initialStrategy.strategy_tql) {
        ideEngine.updateTQL(initialStrategy.strategy_tql);
      } else if (initialStrategy.json_logic) {
        const json = initialStrategy.json_logic as any;
        ideEngine.updateJSON(JSON.stringify(json, null, 2));
      }
    }
  }, [initialStrategy, ideEngine]);

  // Sync strategy when initialStrategy changes
  useEffect(() => {
    setStrategy(initialStrategy);
  }, [initialStrategy]);

  // Auto-save debounce
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleAutoSave = (updates: Partial<Strategy>) => {
    // Update local strategy state immediately for UI responsiveness
    setStrategy(prev => ({ ...prev, ...updates }));

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        await updateStrategy(strategy.id, updates);
        console.log('Auto-saved strategy');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000); // Debounce 1 second

    setSaveTimeout(timeout);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<BlockInstance>) => {
    if (!strategy.block_schema?.blocks) return;
    
    const updatedBlocks = strategy.block_schema.blocks.map((block: any) =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    handleAutoSave({
      block_schema: { 
        blocks: updatedBlocks,
        connections: strategy.block_schema.connections || [],
      },
    });

    // Update selected block if it's the one being updated
    if (selectedBlock?.id === blockId) {
      setSelectedBlock({ ...selectedBlock, ...updates });
    }
  };

  // Auto-expand right sidebar when in block mode
  useEffect(() => {
    if (activeTab === 'blocks') {
      setRightSidebarCollapsed(false);
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return (
    <div className="h-screen flex flex-col bg-[#0B0B0C] overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-[#1e1f22] bg-[#111214] flex items-center px-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-mono text-[#A9A9B3] hover:text-[#7CFF4F] transition-colors mr-4"
        >
          ← BACK TO DASHBOARD
        </button>
        <div className="flex-1 font-mono text-sm text-white">
          {strategy.title || 'Untitled Strategy'}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTutorial(true)}
            className="text-xs font-mono text-[#7CFF4F] hover:text-[#6EE83F] transition-colors"
            title="Start Tutorial"
          >
            📚 TUTORIAL
          </button>
          <div className="text-xs font-mono text-[#7CFF4F]">
            AUTO-SAVE: <span className="text-[#A9A9B3]">ENABLED</span>
          </div>
        </div>
      </div>
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialManager
          path="beginner"
          onComplete={() => setShowTutorial(false)}
        />
      )}

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={`transition-all duration-300 border-r border-[#1e1f22] bg-[#111214] ${
            leftSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'
          }`}
        >
          {!leftSidebarCollapsed && (
            <StrategySidebar 
              strategy={strategy} 
              onAutoSave={handleAutoSave}
              onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
            />
          )}
        </div>

        {/* Collapse Button for Left Sidebar */}
        <button
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          className="w-4 bg-[#111214] border-r border-[#1e1f22] hover:bg-[#151618] transition-colors flex items-center justify-center text-[#7CFF4F] text-xs"
          title={leftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {leftSidebarCollapsed ? '▶' : '◀'}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs and Content */}
          <ErrorBoundary>
            <IDETabs
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              strategy={strategy}
              onAutoSave={handleAutoSave}
              selectedBlock={selectedBlock}
              onSelectBlock={setSelectedBlock}
            />
          </ErrorBoundary>

          {/* Bottom Terminal */}
          <div className="h-48 border-t border-[#1e1f22]">
            <TerminalPanel strategyId={strategy.id} />
          </div>
        </div>

        {/* Collapse Button for Right Sidebar */}
        <button
          onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          className="w-4 bg-[#111214] border-l border-[#1e1f22] hover:bg-[#151618] transition-colors flex items-center justify-center text-[#7CFF4F] text-xs"
          title={rightSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {rightSidebarCollapsed ? '◀' : '▶'}
        </button>

        {/* Right Sidebar - Show Block Properties in Block Mode, Chart Sidebar otherwise */}
        <div
          className={`transition-all duration-300 border-l border-[#1e1f22] bg-[#111214] ${
            rightSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-96'
          }`}
        >
          {!rightSidebarCollapsed && (
            activeTab === 'blocks' ? (
              <BlockPropertiesPanel 
                selectedBlock={selectedBlock} 
                onUpdateBlock={handleBlockUpdate}
              />
            ) : (
              <ChartSidebar strategyId={strategy.id} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

