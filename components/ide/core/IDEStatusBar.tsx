// =====================================================================
// CHAPTER 6: IDE Status Bar Component
// =====================================================================

'use client';

import React from 'react';
import { useIDEEngine } from './IDEEngine';

export function IDEStatusBar() {
  const engine = useIDEEngine();

  const errorCount = engine.diagnostics.filter((d) => d.type === 'error').length;
  const warningCount = engine.diagnostics.filter((d) => d.type === 'warning').length;
  const infoCount = engine.diagnostics.filter((d) => d.type === 'info').length;

  const isValid = engine.compileResult?.valid ?? false;
  const isDirty = engine.isDirty;
  const isSaving = engine.isSaving;
  const lastSaved = engine.lastSaved;

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';
    const diff = Date.now() - lastSaved.getTime();
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="ide-status-bar">
      <div className="status-left">
        {/* Validation status */}
        <span className={`status-indicator ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? '✓' : '✗'}
        </span>
        <span className="status-text">
          {errorCount} {errorCount === 1 ? 'error' : 'errors'}
        </span>
        {warningCount > 0 && (
          <span className="status-text warnings">
            · {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
          </span>
        )}
        {infoCount > 0 && (
          <span className="status-text info">
            · {infoCount} info
          </span>
        )}

        {/* Autosave status */}
        <span className="status-separator">·</span>
        <span className={`autosave-status ${isSaving ? 'saving' : isDirty ? 'dirty' : 'saved'}`}>
          {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : `Autosaved ${formatLastSaved()}`}
        </span>
      </div>

      <div className="status-right">
        {/* Current mode */}
        <span className="mode-indicator">
          {engine.mode.toUpperCase()} Mode
        </span>

        {/* Strategy name */}
        <span className="strategy-name">
          {engine.strategyName || 'Untitled Strategy'}
        </span>

        {/* Cursor position */}
        <span className="cursor-position">
          Ln {engine.cursorPosition.line}, Col {engine.cursorPosition.column}
        </span>
      </div>
    </div>
  );
}

