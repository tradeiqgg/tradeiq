// =====================================================================
// Interactive Tutorial Overlay System
// =====================================================================

'use client';

import { useState, useEffect, useRef } from 'react';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'type' | 'select' | 'drag';
    target?: string;
    value?: string;
  };
  validation?: {
    check: () => boolean | Promise<boolean>;
    message?: string;
  };
  skipable?: boolean;
};

export interface TutorialConfig {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

interface TutorialOverlayProps {
  tutorial: TutorialConfig | null;
  onClose: () => void;
  onStepComplete: (stepId: string) => void;
}

export function TutorialOverlay({ tutorial, onClose, onStepComplete }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorial?.steps[currentStepIndex];

  useEffect(() => {
    if (!currentStep?.targetSelector) {
      setHighlightRect(null);
      return;
    }

    const updateHighlight = () => {
      const element = document.querySelector(currentStep.targetSelector!);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [currentStep]);

  const handleNext = async () => {
    if (!currentStep) return;

    // Validate step if validation exists
    if (currentStep.validation) {
      setIsValidating(true);
      try {
        const isValid = await currentStep.validation.check();
        if (!isValid) {
          alert(currentStep.validation.message || 'Please complete this step before continuing.');
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error('Validation error:', error);
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    onStepComplete(currentStep.id);

    if (currentStepIndex < tutorial!.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Tutorial complete
      tutorial?.onComplete?.();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    tutorial?.onSkip?.();
    onClose();
  };

  if (!tutorial || !currentStep) {
    return null;
  }

  const position = currentStep.position || 'bottom';
  const tooltipStyle: React.CSSProperties = highlightRect
    ? {
        position: 'fixed',
        ...(position === 'top' && {
          top: `${highlightRect.top - 10}px`,
          left: `${highlightRect.left + highlightRect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        }),
        ...(position === 'bottom' && {
          top: `${highlightRect.bottom + 10}px`,
          left: `${highlightRect.left + highlightRect.width / 2}px`,
          transform: 'translateX(-50%)',
        }),
        ...(position === 'left' && {
          top: `${highlightRect.top + highlightRect.height / 2}px`,
          left: `${highlightRect.left - 10}px`,
          transform: 'translate(-100%, -50%)',
        }),
        ...(position === 'right' && {
          top: `${highlightRect.top + highlightRect.height / 2}px`,
          left: `${highlightRect.right + 10}px`,
          transform: 'translateY(-50%)',
        }),
        ...(position === 'center' && {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }),
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          // Only close if clicking the backdrop, not the tooltip
          if (e.target === overlayRef.current) {
            if (currentStep.skipable) {
              handleSkip();
            }
          }
        }}
      >
        {/* Highlight cutout */}
        {highlightRect && (
          <div
            className="absolute border-2 border-[#7CFF4F] rounded shadow-lg pointer-events-none"
            style={{
              top: `${highlightRect.top}px`,
              left: `${highlightRect.left}px`,
              width: `${highlightRect.width}px`,
              height: `${highlightRect.height}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] bg-[#111214] border-2 border-[#7CFF4F] rounded-lg p-6 max-w-md shadow-2xl"
        style={tooltipStyle}
      >
        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-[#6f7177] mb-2">
            <span>Step {currentStepIndex + 1} of {tutorial.steps.length}</span>
            {currentStep.skipable && (
              <button
                onClick={handleSkip}
                className="text-[#6f7177] hover:text-white transition-colors"
              >
                Skip Tutorial
              </button>
            )}
          </div>
          <div className="w-full bg-[#1e1f22] rounded-full h-1">
            <div
              className="bg-[#7CFF4F] h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / tutorial.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <h3 className="text-lg font-semibold text-white mb-2">{currentStep.title}</h3>
        <p className="text-sm text-[#A9A9B3] mb-4">{currentStep.description}</p>

        {/* Action hint */}
        {currentStep.action && (
          <div className="mb-4 p-3 bg-[#1e1f22] rounded border border-[#1e1f22]">
            <div className="text-xs text-[#7CFF4F] font-mono">
              {currentStep.action.type === 'click' && `Click on: ${currentStep.action.target}`}
              {currentStep.action.type === 'type' && `Type: ${currentStep.action.value}`}
              {currentStep.action.type === 'select' && `Select: ${currentStep.action.target}`}
              {currentStep.action.type === 'drag' && `Drag: ${currentStep.action.target}`}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm font-mono bg-[#1e1f22] border border-[#1e1f22] text-[#A9A9B3] rounded hover:bg-[#151618] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={isValidating}
            className="px-4 py-2 text-sm font-mono bg-[#7CFF4F] text-black rounded hover:bg-[#6EE83F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isValidating ? 'Validating...' : currentStepIndex === tutorial.steps.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  );
}

