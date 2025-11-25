'use client';

import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Specialized error boundary for Strategy IDE
 * Prevents white screen crashes and provides helpful recovery
 */
export default class StrategyBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StrategyBoundary caught an error:', error, errorInfo);
    // Log to error tracking service if available
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-screen flex items-center justify-center bg-[#0B0B0C] p-6">
          <div className="max-w-md w-full bg-[#111214] border border-red-500/50 rounded-lg p-6">
            <h2 className="text-lg font-display font-semibold text-red-400 mb-2">
              Failed to load Strategy IDE
            </h2>
            <p className="text-sm text-[#A9A9B3] font-sans mb-4">
              {this.state.error?.message || 'An unexpected error occurred while loading the strategy editor.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans font-medium hover:bg-[#70e84b] transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="flex-1 px-4 py-2 bg-transparent border border-[#1e1f22] text-white rounded-lg font-sans font-medium hover:border-[#7CFF4F] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

