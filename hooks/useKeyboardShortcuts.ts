'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K for search (common pattern)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Could open a search modal here
        console.log('Search shortcut pressed');
      }

      // Cmd/Ctrl + / for help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        console.log('Help shortcut pressed');
      }

      // Escape to close modals (handled by individual components)
      if (e.key === 'Escape') {
        // Could dispatch a global close event
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}

