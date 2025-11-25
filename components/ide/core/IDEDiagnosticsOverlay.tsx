// =====================================================================
// CHAPTER 6: IDE Diagnostics Overlay Component
// =====================================================================

'use client';

import React from 'react';
import type { TQDiagnostic } from '@/lib/tql';
import { formatDiagnostic } from '@/lib/tql/diagnostics';

interface DiagnosticsOverlayProps {
  diagnostics: TQDiagnostic[];
  onFixClick?: (diagnostic: TQDiagnostic) => void;
}

export function IDEDiagnosticsOverlay({
  diagnostics,
  onFixClick,
}: DiagnosticsOverlayProps) {
  // Group diagnostics by line
  const diagnosticsByLine = diagnostics.reduce((acc, diag) => {
    const line = diag.line || 0;
    if (!acc[line]) {
      acc[line] = [];
    }
    acc[line].push(diag);
    return acc;
  }, {} as Record<number, TQDiagnostic[]>);

  return (
    <div className="ide-diagnostics-overlay">
      {Object.entries(diagnosticsByLine).map(([line, diags]) => (
        <DiagnosticLine
          key={line}
          line={Number(line)}
          diagnostics={diags}
          onFixClick={onFixClick}
        />
      ))}
    </div>
  );
}

interface DiagnosticLineProps {
  line: number;
  diagnostics: TQDiagnostic[];
  onFixClick?: (diagnostic: TQDiagnostic) => void;
}

function DiagnosticLine({
  line,
  diagnostics,
  onFixClick,
}: DiagnosticLineProps) {
  const errors = diagnostics.filter((d) => d.type === 'error');
  const warnings = diagnostics.filter((d) => d.type === 'warning');
  const info = diagnostics.filter((d) => d.type === 'info');

  // Determine severity color
  const severityColor =
    errors.length > 0
      ? 'text-red-500'
      : warnings.length > 0
      ? 'text-yellow-500'
      : 'text-blue-500';

  return (
    <div
      className={`diagnostic-line line-${line} ${severityColor}`}
      data-line={line}
    >
      {/* Gutter icon */}
      <div className="diagnostic-gutter-icon">
        {errors.length > 0 && (
          <span className="text-red-500" title={`${errors.length} error(s)`}>
            ●
          </span>
        )}
        {warnings.length > 0 && errors.length === 0 && (
          <span
            className="text-yellow-500"
            title={`${warnings.length} warning(s)`}
          >
            ⚠
          </span>
        )}
        {info.length > 0 && errors.length === 0 && warnings.length === 0 && (
          <span className="text-blue-500" title={`${info.length} info`}>
            ℹ
          </span>
        )}
      </div>

      {/* Tooltip with diagnostics */}
      <div className="diagnostic-tooltip">
        {diagnostics.map((diag, idx) => (
          <div key={idx} className={`diagnostic-item diagnostic-${diag.type}`}>
            <div className="diagnostic-message">{diag.message}</div>
            {diag.snippet && (
              <div className="diagnostic-snippet">{diag.snippet}</div>
            )}
            {diag.fix && (
              <button
                className="diagnostic-fix-button"
                onClick={() => onFixClick?.(diag)}
                title={diag.fix.suggestion}
              >
                💡 Fix
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CSS classes for editor decorations
 * These would be applied to Monaco Editor decorations
 */
export function getDiagnosticDecorations(diagnostics: TQDiagnostic[]) {
  return diagnostics.map((diag) => {
    if (!diag.line || !diag.column) return null;

    const color =
      diag.type === 'error'
        ? '#f44336'
        : diag.type === 'warning'
        ? '#ff9800'
        : '#2196f3';

    return {
      range: {
        startLineNumber: diag.line,
        startColumn: diag.column,
        endLineNumber: diag.line,
        endColumn: diag.column + (diag.snippet?.length || 10),
      },
      options: {
        inlineClassName: `diagnostic-squiggle diagnostic-${diag.type}`,
        glyphMarginClassName: `diagnostic-gutter diagnostic-${diag.type}`,
        hoverMessage: {
          value: formatDiagnostic(diag),
        },
        overviewRuler: {
          color,
          position: diag.type === 'error' ? 1 : diag.type === 'warning' ? 2 : 3,
        },
      },
    };
  }).filter(Boolean);
}

