// =====================================================================
// CHAPTER 5: TQL Diagnostics Engine
// =====================================================================

import { TQErrorCode, ERROR_MESSAGES } from './errors';

export interface TQFixSuggestion {
  suggestion: string;
  apply?: string;
  description?: string;
}

export interface TQDiagnostic {
  type: "error" | "warning" | "info";
  code: TQErrorCode;
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  fix?: TQFixSuggestion;
  relatedCode?: string;
}

export class DiagnosticsBuilder {
  private diagnostics: TQDiagnostic[] = [];

  error(
    code: TQErrorCode,
    message: string,
    options?: {
      line?: number;
      column?: number;
      snippet?: string;
      fix?: TQFixSuggestion;
      relatedCode?: string;
    }
  ): this {
    this.diagnostics.push({
      type: "error",
      code,
      message: message || ERROR_MESSAGES[code],
      ...options,
    });
    return this;
  }

  warning(
    code: TQErrorCode,
    message: string,
    options?: {
      line?: number;
      column?: number;
      snippet?: string;
      fix?: TQFixSuggestion;
      relatedCode?: string;
    }
  ): this {
    this.diagnostics.push({
      type: "warning",
      code,
      message: message || ERROR_MESSAGES[code],
      ...options,
    });
    return this;
  }

  info(
    code: TQErrorCode,
    message: string,
    options?: {
      line?: number;
      column?: number;
      snippet?: string;
      fix?: TQFixSuggestion;
      relatedCode?: string;
    }
  ): this {
    this.diagnostics.push({
      type: "info",
      code,
      message: message || ERROR_MESSAGES[code],
      ...options,
    });
    return this;
  }

  getDiagnostics(): TQDiagnostic[] {
    return [...this.diagnostics];
  }

  clear(): void {
    this.diagnostics = [];
  }
}

/**
 * Create a diagnostic from an error code and context
 */
export function createDiagnostic(
  type: "error" | "warning" | "info",
  code: TQErrorCode,
  customMessage?: string,
  options?: {
    line?: number;
    column?: number;
    snippet?: string;
    fix?: TQFixSuggestion;
    relatedCode?: string;
  }
): TQDiagnostic {
  return {
    type,
    code,
    message: customMessage || ERROR_MESSAGES[code],
    ...options,
  };
}

/**
 * Format diagnostic for display in IDE
 */
export function formatDiagnostic(diagnostic: TQDiagnostic): string {
  const location = diagnostic.line && diagnostic.column
    ? `[${diagnostic.line}:${diagnostic.column}]`
    : '';
  const snippet = diagnostic.snippet ? `\n  ${diagnostic.snippet}` : '';
  const fix = diagnostic.fix ? `\n  Fix: ${diagnostic.fix.suggestion}` : '';
  
  return `${diagnostic.type.toUpperCase()} ${location} ${diagnostic.code}: ${diagnostic.message}${snippet}${fix}`;
}

