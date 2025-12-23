'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    primary: 'bg-accent-primary',
    success: 'bg-semantic-success',
    warning: 'bg-semantic-warning',
    error: 'bg-semantic-error',
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-text-primary">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-text-secondary">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-gray-200',
          sizeClasses[size]
        )}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className={cn('h-full rounded-full', colorClasses[color])} />
          </motion.div>
        ) : (
          <div
            className={cn('h-full rounded-full', colorClasses[color])}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}

