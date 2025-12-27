/**
 * Lazy Loading Utilities
 * Code splitting and dynamic imports for performance
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy load a component with loading spinner
 */
export function lazyLoadComponent<T = Record<string, never>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  });
}

/**
 * Lazy load a component without SSR
 */
export function lazyLoadNoSSR<T = Record<string, never>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
) {
  return dynamic(importFunc, {
    ssr: false,
  });
}

/**
 * Lazy load a chart component (heavy library)
 */
export function lazyLoadChart<T = Record<string, never>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  });
}
