'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp } from '@/lib/animations/variants';
import { Maximize, Minimize } from 'lucide-react';

export default function GrondaIntegrationPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const grondaUrl = 'https://chefadrianstefan.gronda.com';
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

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
      const iframe = iframeRef.current;
      if (iframe?.requestFullscreen) {
        await iframe.requestFullscreen();
      }
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Chef Adrian Stefan - Gronda
            </h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Explore culinary wisdom and recipes from Chef Adrian Stefan.
            </p>
          </div>
          <AnimatedButton onClick={toggleFullscreen} variant="secondary" icon={isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </AnimatedButton>
        </motion.div>

        <motion.div className="glass-card p-0 overflow-hidden" variants={fadeInUp} style={{ height: 'calc(100vh - 250px)' }}>
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-surface z-10">
              <LoadingSpinner text="Loading Gronda content..." />
            </div>
          )}
          <iframe
            id="gronda-iframe"
            ref={iframeRef}
            src={grondaUrl}
            className="w-full h-full border-0"
            title="Chef Adrian Stefan - Gronda"
            allow="fullscreen"
            loading="lazy"
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </motion.div>

        {typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
          <motion.div className="glass-card p-4 rounded-lg shadow-lg border border-border-medium mt-4 text-center" variants={fadeInUp}>
            <p className="text-sm text-text-secondary mb-2">
              💡 Tip: Add to home screen for a native app experience!
            </p>
            <AnimatedButton size="sm" variant="secondary" onClick={() => { /* PWA install logic */ }}>
              Install App
            </AnimatedButton>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

