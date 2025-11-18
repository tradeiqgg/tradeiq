'use client';

import { useState, useEffect } from 'react';
import { TypingText } from './TypingText';

interface TypingCodeBlockProps {
  lines: Array<{ text: string; color: string; delay?: number }>;
  className?: string;
}

export function TypingCodeBlock({ lines, className = '' }: TypingCodeBlockProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const line = lines[currentLineIndex];
      const timeout = setTimeout(() => {
        setCompletedLines((prev) => [...prev, line.text]);
        setCurrentLineIndex((prev) => prev + 1);
      }, (line.delay || 0) + line.text.length * 30);

      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, lines]);

  return (
    <div className={`bg-[#111214] border border-[#1e1f22] rounded-lg p-6 font-mono text-sm ${className}`}>
      <div className="text-[#6f7177] mb-3">{'// Build your strategy in plain English'}</div>
      <div className="text-white space-y-2">
        {completedLines.map((line, idx) => {
          const originalLine = lines[idx];
          return (
            <div key={idx} style={{ color: originalLine.color }}>
              {line}
            </div>
          );
        })}
        {currentLineIndex < lines.length && (
          <div style={{ color: lines[currentLineIndex].color }}>
            <TypingText
              text={lines[currentLineIndex].text}
              speed={30}
              delay={lines[currentLineIndex].delay || 0}
            />
          </div>
        )}
      </div>
      {currentLineIndex >= lines.length && (
        <div className="mt-4 text-[#6f7177]">
          <TypingText 
            text="→ AI converts to executable code"
            speed={30}
            delay={500}
            className="text-[#7CFF4F]"
          />
        </div>
      )}
    </div>
  );
}

