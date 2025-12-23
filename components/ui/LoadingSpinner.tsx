'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div
          className={cn(
            'border-4 border-accent-primary/20 rounded-full',
            sizeClasses[size]
          )}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className={cn(
              'border-4 border-transparent border-t-accent-primary rounded-full absolute inset-0',
              sizeClasses[size]
            )}
          />
        </motion.div>
      </div>
      {text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-text-secondary">{text}</p>
        </motion.div>
      )}
    </div>
  );
}

