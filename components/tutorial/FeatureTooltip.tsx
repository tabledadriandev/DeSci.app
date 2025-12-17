'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FeatureTooltipProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delay?: number;
}

export function FeatureTooltip({
  id,
  title,
  description,
  children,
  position = 'bottom',
  showOnce = true,
  delay = 500,
}: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(true);

  useEffect(() => {
    if (showOnce) {
      const dismissed = localStorage.getItem(`ta_tooltip_${id}`);
      if (!dismissed) {
        setHasBeenDismissed(false);
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
      }
    }
  }, [id, showOnce, delay]);

  const dismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    if (showOnce) {
      localStorage.setItem(`ta_tooltip_${id}`, 'true');
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-accent-primary',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-accent-primary',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-accent-primary',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-accent-primary',
  };

  return (
    <div className="relative inline-block">
      {children}
      
      <AnimatePresence>
        {isVisible && !hasBeenDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'absolute z-50 w-72 p-4 rounded-xl bg-accent-primary text-white shadow-xl',
              positionClasses[position]
            )}
          >
            {/* Arrow */}
            <div className={cn('absolute w-0 h-0 border-8', arrowClasses[position])} />
            
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/20 flex-shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">{description}</p>
              </div>
              <button
                onClick={dismiss}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={dismiss}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              Got it
              <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick tips that appear at the bottom of the screen
interface QuickTipProps {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function QuickTip({ id, message, action }: QuickTipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`ta_quicktip_${id}`);
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`ta_quicktip_${id}`, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-bg-surface border border-border-light rounded-xl shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent-primary/10 flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{message}</p>
                {action && (
                  <button
                    onClick={() => {
                      action.onClick();
                      dismiss();
                    }}
                    className="mt-2 text-sm font-medium text-accent-primary hover:text-accent-primary/80 transition-colors"
                  >
                    {action.label} →
                  </button>
                )}
              </div>
              <button
                onClick={dismiss}
                className="p-1 rounded-lg hover:bg-bg-elevated transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

