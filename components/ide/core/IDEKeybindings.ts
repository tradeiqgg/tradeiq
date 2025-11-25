// =====================================================================
// CHAPTER 6: IDE Keyboard Shortcuts Manager
// =====================================================================

import { useIDEEngine } from './IDEEngine';
import { runImmediateValidation } from './IDEValidationBridge';

export interface Keybinding {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export const IDE_KEYBINDINGS: Keybinding[] = [
  // Global shortcuts
  {
    key: 's',
    ctrl: true,
    cmd: true,
    handler: () => {
      const engine = useIDEEngine.getState();
      // Trigger save
      console.log('Save strategy');
    },
    description: 'Save strategy',
  },
  {
    key: 'Enter',
    ctrl: true,
    cmd: true,
    handler: async () => {
      const engine = useIDEEngine.getState();
      await runImmediateValidation(
        engine.mode,
        engine.tqlText,
        engine.jsonText,
        engine.blockTree
      );
    },
    description: 'Validate now',
  },
  {
    key: ',',
    ctrl: true,
    cmd: true,
    handler: () => {
      console.log('Open settings');
    },
    description: 'Open settings',
  },
  {
    key: 'd',
    ctrl: true,
    cmd: true,
    shift: true,
    handler: () => {
      console.log('Open diagnostics panel');
    },
    description: 'Open diagnostics panel',
  },
  {
    key: 'v',
    ctrl: true,
    cmd: true,
    shift: true,
    handler: () => {
      console.log('Open version history');
    },
    description: 'Open version history',
  },
  // Editor shortcuts
  {
    key: 'Space',
    ctrl: true,
    cmd: true,
    handler: () => {
      console.log('Trigger autocomplete');
    },
    description: 'Trigger autocomplete',
  },
  {
    key: 'F2',
    handler: () => {
      console.log('Fix-it action');
    },
    description: 'Fix-it action',
  },
  {
    key: 'i',
    ctrl: true,
    cmd: true,
    handler: () => {
      console.log('Hover info');
    },
    description: 'Hover info',
  },
];

/**
 * Register keyboard shortcuts
 */
export function registerKeybindings(keybindings: Keybinding[] = IDE_KEYBINDINGS) {
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const binding of keybindings) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      if (
        event.key === binding.key &&
        (binding.ctrl || binding.cmd ? modKey : !modKey) &&
        (binding.shift ? event.shiftKey : !event.shiftKey) &&
        (binding.alt ? event.altKey : !event.altKey)
      ) {
        event.preventDefault();
        binding.handler();
        return;
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Hook for components to use keybindings
 */
export function useIDEKeybindings() {
  React.useEffect(() => {
    return registerKeybindings();
  }, []);
}

// Add React import for hook
import React from 'react';

