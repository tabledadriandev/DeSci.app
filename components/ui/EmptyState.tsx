'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  illustration?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
        {illustration ? (
          <div className="mb-6">{illustration}</div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary/10 to-accent-teal/10 flex items-center justify-center mb-6">
              <Icon className="w-10 h-10 text-accent-primary" />
            </div>
          </motion.div>
        )}

        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary max-w-md mb-6">{description}</p>

        {action && (
          <AnimatedButton
            variant={action.variant || 'primary'}
            onClick={action.onClick}
          >
            {action.label}
          </AnimatedButton>
        )}
      </div>
    </motion.div>
  );
}

