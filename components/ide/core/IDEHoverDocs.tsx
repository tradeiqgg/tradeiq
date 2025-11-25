// =====================================================================
// CHAPTER 6: IDE Hover Documentation Component
// =====================================================================

'use client';

import React from 'react';
import { getIndicatorSpec } from '@/lib/tql/indicators';
import { getBlockSpec } from '@/lib/tql/blocks';

interface HoverDocsProps {
  word: string;
  type: 'indicator' | 'block' | 'keyword' | 'function';
  position: { x: number; y: number };
}

export function IDEHoverDocs({ word, type, position }: HoverDocsProps) {
  let content: React.ReactNode = null;

  if (type === 'indicator') {
    const spec = getIndicatorSpec(word);
    if (spec) {
      content = (
        <div className="hover-docs-indicator">
          <h3>{spec.name}</h3>
          <p className="description">{spec.description}</p>
          <div className="params">
            <strong>Parameters:</strong>
            <ul>
              {Object.entries(spec.params).map(([key, param]) => (
                <li key={key}>
                  <code>{key}</code>: {param.type} (default: {String(param.default)})
                  {param.min !== undefined && param.max !== undefined && (
                    <span className="range">
                      {' '}
                      [{param.min} - {param.max}]
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="output">
            <strong>Output:</strong> <code>{spec.output}</code>
          </div>
          <div className="example">
            <strong>Example:</strong> <code>{spec.example}</code>
          </div>
        </div>
      );
    }
  } else if (type === 'block') {
    const spec = getBlockSpec(word);
    if (spec) {
      content = (
        <div className="hover-docs-block">
          <h3>{spec.label}</h3>
          <p className="description">{spec.description}</p>
          <div className="info">
            <p>{spec.info}</p>
          </div>
          <div className="category">
            <strong>Category:</strong> {spec.category}
          </div>
          {spec.inputs.length > 0 && (
            <div className="inputs">
              <strong>Inputs:</strong>
              <ul>
                {spec.inputs.map((input) => (
                  <li key={input.name}>
                    <code>{input.name}</code>: {input.type}
                    {input.optional && <span className="optional"> (optional)</span>}
                    <p className="input-desc">{input.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
  } else if (type === 'keyword') {
    content = (
      <div className="hover-docs-keyword">
        <h3>{word}</h3>
        <p>Reserved keyword in TQL</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div
      className="ide-hover-docs"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
      }}
    >
      {content}
    </div>
  );
}

/**
 * Get hover documentation for a word at cursor position
 */
export function getHoverDocs(
  word: string,
  context: string
): { type: 'indicator' | 'block' | 'keyword' | 'function'; content: React.ReactNode } | null {
  // Check if it's an indicator
  const indicatorSpec = getIndicatorSpec(word);
  if (indicatorSpec) {
    return {
      type: 'indicator',
      content: (
        <div>
          <h4>{indicatorSpec.name}</h4>
          <p>{indicatorSpec.description}</p>
          <p>
            <strong>Output:</strong> {indicatorSpec.output}
          </p>
          <p>
            <strong>Example:</strong> <code>{indicatorSpec.example}</code>
          </p>
        </div>
      ),
    };
  }

  // Check if it's a block
  const blockSpec = getBlockSpec(word);
  if (blockSpec) {
    return {
      type: 'block',
      content: (
        <div>
          <h4>{blockSpec.label}</h4>
          <p>{blockSpec.description}</p>
        </div>
      ),
    };
  }

  // Check if it's a keyword
  const keywords = [
    'meta',
    'settings',
    'indicators',
    'rules',
    'entry',
    'exit',
    'risk',
    'when',
    'then',
    'enter',
    'long',
    'short',
  ];
  if (keywords.includes(word.toLowerCase())) {
    return {
      type: 'keyword',
      content: (
        <div>
          <h4>{word}</h4>
          <p>Reserved keyword in TQL</p>
        </div>
      ),
    };
  }

  return null;
}

