// =====================================================================
// Tutorial Manager - Manages tutorial state and lesson paths
// =====================================================================

'use client';

import { useState, useEffect } from 'react';
import { TutorialOverlay, type TutorialConfig, type TutorialStep } from './TutorialOverlay';

export type TutorialPath = 'beginner' | 'intermediate' | 'advanced' | 'custom';

interface TutorialManagerProps {
  path?: TutorialPath;
  onComplete?: () => void;
}

export function TutorialManager({ path = 'beginner', onComplete }: TutorialManagerProps) {
  const [currentTutorial, setCurrentTutorial] = useState<TutorialConfig | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load tutorial based on path
    const tutorial = getTutorialForPath(path);
    setCurrentTutorial(tutorial);
  }, [path]);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...Array.from(prev), stepId]));
  };

  const handleTutorialComplete = () => {
    // Save completion to localStorage
    if (currentTutorial) {
      const completed = JSON.parse(localStorage.getItem('tutorials_completed') || '[]');
      if (!completed.includes(currentTutorial.id)) {
        completed.push(currentTutorial.id);
        localStorage.setItem('tutorials_completed', JSON.stringify(completed));
      }
    }
    onComplete?.();
  };

  const handleClose = () => {
    setCurrentTutorial(null);
  };

  if (!currentTutorial) {
    return null;
  }

  return (
    <TutorialOverlay
      tutorial={currentTutorial}
      onClose={handleClose}
      onStepComplete={handleStepComplete}
    />
  );
}

/**
 * Get tutorial configuration for a path
 */
function getTutorialForPath(path: TutorialPath): TutorialConfig {
  switch (path) {
    case 'beginner':
      return getBeginnerTutorial();
    case 'intermediate':
      return getIntermediateTutorial();
    case 'advanced':
      return getAdvancedTutorial();
    default:
      return getBeginnerTutorial();
  }
}

/**
 * Beginner Tutorial - First time user guide
 */
function getBeginnerTutorial(): TutorialConfig {
  return {
    id: 'beginner_001',
    title: 'Welcome to TradeIQ!',
    description: 'Learn the basics of creating trading strategies',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome! 👋',
        description: 'Welcome to TradeIQ - a visual platform for building trading algorithms. This tutorial will guide you through creating your first strategy.',
        position: 'center',
        skipable: true,
      },
      {
        id: 'tql_editor',
        title: 'TQL Editor',
        description: 'The TQL (TradeIQ Query Language) editor lets you write strategies in a simple, readable syntax. Try typing some code!',
        targetSelector: '[data-tutorial="tql-editor"]',
        position: 'right',
        action: {
          type: 'type',
          value: 'rsi = rsi(period: 14)',
        },
        validation: {
          check: () => {
            // Check if TQL editor has content
            const editor = document.querySelector('[data-tutorial="tql-editor"]');
            return editor ? (editor as any).value?.length > 0 : false;
          },
          message: 'Please type some TQL code in the editor',
        },
      },
      {
        id: 'blocks_view',
        title: 'Visual Blocks',
        description: 'Watch as your TQL code automatically converts to visual blocks! Blocks make it easy to see your strategy structure.',
        targetSelector: '[data-tutorial="blocks-view"]',
        position: 'left',
        validation: {
          check: () => {
            // Check if blocks exist
            const blocksView = document.querySelector('[data-tutorial="blocks-view"]');
            return blocksView !== null;
          },
        },
      },
      {
        id: 'indicator_blocks',
        title: 'Adding Indicators',
        description: 'You can drag indicator blocks from the palette. Try adding an RSI or MACD block!',
        targetSelector: '[data-tutorial="block-palette"]',
        position: 'right',
        action: {
          type: 'click',
          target: '[data-tutorial="indicator-rsi"]',
        },
      },
      {
        id: 'backtest',
        title: 'Running Backtests',
        description: 'Test your strategy on historical data. Click the "Run Backtest" button to see how your strategy performs!',
        targetSelector: '[data-tutorial="backtest-button"]',
        position: 'top',
        action: {
          type: 'click',
          target: '[data-tutorial="backtest-button"]',
        },
      },
      {
        id: 'complete',
        title: 'You\'re Ready! 🎉',
        description: 'You\'ve learned the basics! Start building your first strategy. Remember: you can always come back to tutorials.',
        position: 'center',
      },
    ],
    onComplete: () => {
      console.log('Beginner tutorial completed!');
    },
  };
}

/**
 * Intermediate Tutorial - Building complex strategies
 */
function getIntermediateTutorial(): TutorialConfig {
  return {
    id: 'intermediate_001',
    title: 'Building Advanced Strategies',
    description: 'Learn to combine multiple indicators and create sophisticated trading logic',
    steps: [
      {
        id: 'multiple_indicators',
        title: 'Multiple Indicators',
        description: 'Combine RSI, MACD, and moving averages for stronger signals. Each indicator provides different insights.',
        position: 'center',
      },
      {
        id: 'condition_logic',
        title: 'Complex Conditions',
        description: 'Use AND/OR logic to combine conditions. For example: "RSI < 30 AND price > SMA"',
        targetSelector: '[data-tutorial="logic-blocks"]',
        position: 'bottom',
      },
      {
        id: 'risk_management',
        title: 'Risk Management',
        description: 'Always set stop-loss and take-profit levels. Risk management is crucial for long-term success.',
        targetSelector: '[data-tutorial="risk-panel"]',
        position: 'top',
      },
    ],
  };
}

/**
 * Advanced Tutorial - Optimization and deployment
 */
function getAdvancedTutorial(): TutorialConfig {
  return {
    id: 'advanced_001',
    title: 'Advanced Features',
    description: 'Master optimization, live trading, and strategy sharing',
    steps: [
      {
        id: 'optimization',
        title: 'Parameter Optimization',
        description: 'Test different parameter values to find optimal settings for your strategy.',
        position: 'center',
      },
      {
        id: 'live_trading',
        title: 'Live Trading',
        description: 'Deploy your strategy to trade on real markets. Start with paper trading!',
        targetSelector: '[data-tutorial="live-panel"]',
        position: 'bottom',
      },
      {
        id: 'sharing',
        title: 'Share Strategies',
        description: 'Share your strategies with the community and learn from others.',
        targetSelector: '[data-tutorial="share-button"]',
        position: 'top',
      },
    ],
  };
}

