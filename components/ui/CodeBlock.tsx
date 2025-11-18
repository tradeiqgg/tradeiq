'use client';

interface CodeBlockProps {
  code: string;
  language: 'pseudocode' | 'blocks' | 'json';
  className?: string;
}

export function CodeBlock({ code, language, className = '' }: CodeBlockProps) {
  const renderHighlightedCode = () => {
    if (language === 'json') {
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      let key = 0;

      // Match JSON keys
      const keyRegex = /"([^"]+)":/g;
      let match;
      while ((match = keyRegex.exec(code)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={key++}>{code.substring(lastIndex, match.index)}</span>);
        }
        parts.push(
          <span key={key++} style={{ color: '#39ffd0' }}>
            {match[0]}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < code.length) {
        parts.push(<span key={key++}>{code.substring(lastIndex)}</span>);
      }

      // Apply additional highlighting for values and numbers
      return parts.map((part, idx) => {
        if (typeof part.props.children === 'string') {
          const text = part.props.children;
          const highlighted: JSX.Element[] = [];
          let textIndex = 0;
          let textKey = 0;

          // Highlight string values
          const valueRegex = /:\s*"([^"]+)"/g;
          let valueMatch;
          while ((valueMatch = valueRegex.exec(text)) !== null) {
            if (valueMatch.index > textIndex) {
              highlighted.push(<span key={textKey++}>{text.substring(textIndex, valueMatch.index)}</span>);
            }
            highlighted.push(
              <span key={textKey++} style={{ color: '#adff2f' }}>
                {valueMatch[0]}
              </span>
            );
            textIndex = valueMatch.index + valueMatch[0].length;
          }
          if (textIndex < text.length) {
            const remaining = text.substring(textIndex);
            // Highlight numbers
            const numberRegex = /(\d+\.?\d*)/g;
            let numIndex = 0;
            let numMatch;
            while ((numMatch = numberRegex.exec(remaining)) !== null) {
              if (numMatch.index > numIndex) {
                highlighted.push(<span key={textKey++}>{remaining.substring(numIndex, numMatch.index)}</span>);
              }
              highlighted.push(
                <span key={textKey++} style={{ color: '#ffd700' }}>
                  {numMatch[0]}
                </span>
              );
              numIndex = numMatch.index + numMatch[0].length;
            }
            if (numIndex < remaining.length) {
              highlighted.push(<span key={textKey++}>{remaining.substring(numIndex)}</span>);
            }
          }

          return highlighted.length > 0 ? <span key={idx}>{highlighted}</span> : part;
        }
        return part;
      });
    } else if (language === 'pseudocode') {
      const parts: JSX.Element[] = [];
      let remaining = code;
      let key = 0;

      // Highlight keywords
      const keywordRegex = /\b(IF|THEN|END IF|BUY|SELL|SET)\b/g;
      let match;
      const matches: Array<{ index: number; text: string; type: 'keyword' | 'variable' | 'number' | 'operator' }> = [];
      while ((match = keywordRegex.exec(code)) !== null) {
        matches.push({ index: match.index, text: match[0], type: 'keyword' });
      }

      // Highlight variables
      const varRegex = /\b(price|moving_average|stop_loss)\b/g;
      while ((match = varRegex.exec(code)) !== null) {
        matches.push({ index: match.index, text: match[0], type: 'variable' });
      }

      // Highlight numbers
      const numRegex = /(\d+)/g;
      while ((match = numRegex.exec(code)) !== null) {
        matches.push({ index: match.index, text: match[0], type: 'number' });
      }

      // Highlight operators
      const opRegex = /(>|<|>=|<=)/g;
      while ((match = opRegex.exec(code)) !== null) {
        matches.push({ index: match.index, text: match[0], type: 'operator' });
      }

      // Sort matches by index
      matches.sort((a, b) => a.index - b.index);

      let lastIndex = 0;
      matches.forEach((m) => {
        if (m.index > lastIndex) {
          parts.push(<span key={key++}>{code.substring(lastIndex, m.index)}</span>);
        }
        if (m.type === 'keyword') {
          parts.push(
            <span key={key++} style={{ color: '#39ff14', textShadow: '0 0 10px rgba(57, 255, 20, 0.6)' }}>
              {m.text}
            </span>
          );
        } else if (m.type === 'variable') {
          parts.push(
            <span key={key++} style={{ color: '#39ffd0' }}>
              {m.text}
            </span>
          );
        } else if (m.type === 'number') {
          parts.push(
            <span key={key++} style={{ color: '#ffd700' }}>
              {m.text}
            </span>
          );
        } else if (m.type === 'operator') {
          parts.push(
            <span key={key++} style={{ color: '#adff2f' }}>
              {m.text}
            </span>
          );
        }
        lastIndex = m.index + m.text.length;
      });

      if (lastIndex < code.length) {
        parts.push(<span key={key++}>{code.substring(lastIndex)}</span>);
      }

      return parts;
    } else {
      // Blocks language
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      let key = 0;

      // Highlight block brackets
      const blockRegex = /\[([^\]]+)\]/g;
      let match;
      while ((match = blockRegex.exec(code)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={key++}>{code.substring(lastIndex, match.index)}</span>);
        }
        parts.push(
          <span key={key++} style={{ color: '#39ffd0' }}>
            {match[0]}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }

      // Highlight arrows
      const arrowRegex = /(→|CONNECT)/g;
      lastIndex = 0;
      const arrowMatches: Array<{ index: number; text: string }> = [];
      while ((match = arrowRegex.exec(code)) !== null) {
        arrowMatches.push({ index: match.index, text: match[0] });
      }

      // Highlight percentages
      const percentRegex = /(\d+%)/g;
      while ((match = percentRegex.exec(code)) !== null) {
        arrowMatches.push({ index: match.index, text: match[0] });
      }

      arrowMatches.sort((a, b) => a.index - b.index);
      arrowMatches.forEach((m) => {
        if (m.index > lastIndex) {
          const before = code.substring(lastIndex, m.index);
          if (before) parts.push(<span key={key++}>{before}</span>);
        }
        if (m.text === '→' || m.text === 'CONNECT') {
          parts.push(
            <span key={key++} style={{ color: '#39ff14', textShadow: '0 0 10px rgba(57, 255, 20, 0.6)' }}>
              {m.text}
            </span>
          );
        } else {
          parts.push(
            <span key={key++} style={{ color: '#ffd700' }}>
              {m.text}
            </span>
          );
        }
        lastIndex = m.index + m.text.length;
      });

      if (lastIndex < code.length) {
        parts.push(<span key={key++}>{code.substring(lastIndex)}</span>);
      }

      return parts.length > 0 ? parts : [<span key={0}>{code}</span>];
    }
  };

  return (
    <div className={`bg-[#0B0B0C] border border-[#1e1f22] rounded-lg p-4 font-mono text-xs overflow-x-auto ${className}`}>
      <pre className="text-white whitespace-pre-wrap m-0">
        {renderHighlightedCode()}
      </pre>
    </div>
  );
}

