'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-lg bg-red-50 border border-red-300 p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="font-semibold text-red-900 mb-2">Something went wrong</h2>
              <p className="text-sm text-red-800 mb-4">
                We encountered an error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-red-700 mt-4 p-2 bg-red-100 rounded">
                  <summary className="cursor-pointer font-semibold">Error details</summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

