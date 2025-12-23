'use client';

import { useState, useEffect } from 'react';

export default function GrondaIntegrationPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const grondaUrl = 'https://chefadrianstefan.gronda.com';

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Handle fullscreen toggle
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      const iframe = document.getElementById('gronda-iframe') as HTMLIFrameElement;
      if (iframe?.requestFullscreen) {
        await iframe.requestFullscreen();
      }
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="sticky top-0 z-10 bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-display text-accent-primary">
          Chef Adrian Stefan - Gronda
        </h1>
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="relative" style={{ height: 'calc(100vh - 80px)' }}>
        <iframe
          id="gronda-iframe"
          src={grondaUrl}
          className="w-full h-full border-0"
          title="Chef Adrian Stefan - Gronda"
          allow="fullscreen"
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      {/* Mobile WebView instructions */}
      {typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
        <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-text-secondary mb-2">
            💡 Tip: Add to home screen for a native app experience
          </p>
          <button
            onClick={() => {
              // Show PWA install prompt
              (window as any).deferredPrompt?.prompt();
            }}
            className="text-sm text-accent-primary hover:underline"
          >
            Install App
          </button>
        </div>
      )}
    </div>
  );
}

