// =====================================================================
// CHAPTER 6: IDE Engine - Master Orchestrator
// =====================================================================

import { create } from 'zustand';
import type { TQJSSchema, TQValidationResult } from '@/lib/tql';
import type { TQDiagnostic } from '@/lib/tql';

export type IDEMode = 'tql' | 'json' | 'blocks';

export interface IDERepresentation {
  tql?: string;
  json?: Partial<TQJSSchema>;
  blocks?: any; // TQBlockInstanceTree
}

export interface IDEState {
  // Current mode
  mode: IDEMode;
  
  // Current content
  tqlText: string;
  jsonText: string;
  blockTree: any; // TQBlockInstanceTree
  
  // Parsed/compiled state
  ast: any; // TQL AST
  compiledJSON: Partial<TQJSSchema> | null;
  
  // Validation state
  diagnostics: TQDiagnostic[];
  compileResult: TQValidationResult | null;
  isValidating: boolean;
  
  // Editor state
  cursorPosition: { line: number; column: number };
  selection: { start: number; end: number } | null;
  
  // History
  undoStack: IDERepresentation[];
  redoStack: IDERepresentation[];
  
  // File state
  strategyId: string | null;
  strategyName: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Snapshots
  snapshots: Array<{
    id: string;
    timestamp: Date;
    representation: IDERepresentation;
  }>;
  
  // Actions
  setMode: (mode: IDEMode) => void;
  updateTQL: (text: string) => void;
  updateJSON: (text: string) => void;
  updateBlocks: (tree: any) => void;
  setCursorPosition: (line: number, column: number) => void;
  setSelection: (start: number, end: number) => void;
  
  // Validation
  setDiagnostics: (diagnostics: TQDiagnostic[]) => void;
  setCompileResult: (result: TQValidationResult | null) => void;
  setIsValidating: (isValidating: boolean) => void;
  
  // History
  pushToHistory: (representation: IDERepresentation) => void;
  undo: () => void;
  redo: () => void;
  
  // File operations
  setStrategyId: (id: string | null) => void;
  setStrategyName: (name: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  
  // Snapshots
  createSnapshot: () => void;
  loadSnapshot: (snapshotId: string) => void;
  
  // Utility
  getCurrentRepresentation: () => IDERepresentation;
  reset: () => void;
}

const initialState = {
  mode: 'tql' as IDEMode,
  tqlText: '',
  jsonText: '',
  blockTree: null,
  ast: null,
  compiledJSON: null,
  diagnostics: [],
  compileResult: null,
  isValidating: false,
  cursorPosition: { line: 1, column: 1 },
  selection: null,
  undoStack: [],
  redoStack: [],
  strategyId: null,
  strategyName: 'Untitled Strategy',
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  snapshots: [],
};

export const useIDEEngine = create<IDEState>((set, get) => ({
  ...initialState,
  
  setMode: (mode) => {
    set({ mode });
  },
  
  updateTQL: (text) => {
    set({ tqlText: text, isDirty: true });
    get().pushToHistory({ tql: text });
  },
  
  updateJSON: (text) => {
    set({ jsonText: text, isDirty: true });
    try {
      const json = JSON.parse(text);
      get().pushToHistory({ json });
    } catch (e) {
      // Invalid JSON, don't update history
    }
  },
  
  updateBlocks: (tree) => {
    set({ blockTree: tree, isDirty: true });
    get().pushToHistory({ blocks: tree });
  },
  
  setCursorPosition: (line, column) => {
    set({ cursorPosition: { line, column } });
  },
  
  setSelection: (start, end) => {
    set({ selection: { start, end } });
  },
  
  setDiagnostics: (diagnostics) => {
    set({ diagnostics });
  },
  
  setCompileResult: (result) => {
    set({ compileResult: result });
  },
  
  setIsValidating: (isValidating) => {
    set({ isValidating });
  },
  
  pushToHistory: (representation) => {
    const current = get().getCurrentRepresentation();
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), current], // Keep last 50
      redoStack: [], // Clear redo on new action
    }));
  },
  
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    
    const previous = state.undoStack[state.undoStack.length - 1];
    const current = state.getCurrentRepresentation();
    
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, current],
    }));
    
    // Apply previous state
    if (previous.tql) {
      set({ tqlText: previous.tql });
    }
    if (previous.json) {
      set({ jsonText: JSON.stringify(previous.json, null, 2) });
    }
    if (previous.blocks) {
      set({ blockTree: previous.blocks });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    
    const next = state.redoStack[state.redoStack.length - 1];
    const current = state.getCurrentRepresentation();
    
    set((s) => ({
      undoStack: [...s.undoStack, current],
      redoStack: s.redoStack.slice(0, -1),
    }));
    
    // Apply next state
    if (next.tql) {
      set({ tqlText: next.tql });
    }
    if (next.json) {
      set({ jsonText: JSON.stringify(next.json, null, 2) });
    }
    if (next.blocks) {
      set({ blockTree: next.blocks });
    }
  },
  
  setStrategyId: (id) => {
    set({ strategyId: id });
  },
  
  setStrategyName: (name) => {
    set({ strategyName: name });
  },
  
  setIsDirty: (dirty) => {
    set({ isDirty: dirty });
  },
  
  setIsSaving: (saving) => {
    set({ isSaving: saving });
  },
  
  setLastSaved: (date) => {
    set({ lastSaved: date });
  },
  
  createSnapshot: () => {
    const state = get();
    const representation = state.getCurrentRepresentation();
    const snapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date(),
      representation,
    };
    
    set((s) => ({
      snapshots: [...s.snapshots, snapshot],
    }));
    
    return snapshot.id;
  },
  
  loadSnapshot: (snapshotId) => {
    const state = get();
    const snapshot = state.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return;
    
    if (snapshot.representation.tql) {
      set({ tqlText: snapshot.representation.tql });
    }
    if (snapshot.representation.json) {
      set({ jsonText: JSON.stringify(snapshot.representation.json, null, 2) });
    }
    if (snapshot.representation.blocks) {
      set({ blockTree: snapshot.representation.blocks });
    }
  },
  
  getCurrentRepresentation: () => {
    const state = get();
    return {
      tql: state.tqlText,
      json: state.compiledJSON || (state.jsonText ? JSON.parse(state.jsonText) : undefined),
      blocks: state.blockTree,
    };
  },
  
  reset: () => {
    set(initialState);
  },
}));

