'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const next: Toast = { id, ...toast };
    setToasts((prev) => [...prev, next]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const iconFor = (variant?: ToastVariant) => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-semantic-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-semantic-error" />;
      default:
        return <Info className="w-5 h-5 text-accent-primary" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="glass-card border border-border-medium rounded-2xl px-4 py-3 shadow-lg bg-white/80 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{iconFor(toast.variant)}</div>
                  <div className="flex-1">
                    {toast.title && (
                      <div className="text-sm font-semibold text-text-primary mb-0.5">
                        {toast.title}
                      </div>
                    )}
                    {toast.description && (
                      <div className="text-xs text-text-secondary whitespace-pre-line">
                        {toast.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}


