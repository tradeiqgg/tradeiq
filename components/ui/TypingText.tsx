'use client';

import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  delay?: number;
}

export function TypingText({ 
  text, 
  speed = 50, 
  className = '', 
  onComplete,
  delay = 0 
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [key, setKey] = useState(0);

  // Reset on text change to ensure fresh animation
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(false);
    setKey((prev) => prev + 1);
  }, [text]);

  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        setIsTyping(true);
      }, delay);
      return () => clearTimeout(delayTimeout);
    } else {
      setIsTyping(true);
    }
  }, [delay, key]);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    setDisplayedText(''); // Always start empty
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isTyping, onComplete, key]);

  return (
    <span className={`font-mono ${className}`}>
      {displayedText}
      {isTyping && displayedText.length < text.length && (
        <span className="terminal-cursor" />
      )}
    </span>
  );
}

