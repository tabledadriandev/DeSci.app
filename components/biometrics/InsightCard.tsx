'use client';

import { motion } from 'framer-motion';
import { ExternalLink, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface InsightCardProps {
  headline: string;
  explanation: string;
  action: string;
  confidence?: number; // 0-100
  learnMoreLink?: string;
  type?: 'info' | 'success' | 'warning' | 'alert';
  className?: string;
}

export default function InsightCard({
  headline,
  explanation,
  action,
  confidence = 85,
  learnMoreLink,
  type = 'info',
  className,
}: InsightCardProps) {
  const typeConfig = {
    info: {
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      icon: Info,
      glow: 'shadow-[0_0_20px_rgba(26,155,142,0.3)]',
    },
    success: {
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: CheckCircle2,
      glow: 'shadow-[0_0_20px_rgba(44,181,102,0.3)]',
    },
    warning: {
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: AlertCircle,
      glow: 'shadow-[0_0_20px_rgba(230,163,71,0.3)]',
    },
    alert: {
      color: 'text-error',
      bg: 'bg-error/10',
      border: 'border-error/30',
      icon: AlertCircle,
      glow: 'shadow-[0_0_20px_rgba(217,69,87,0.3)]',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn(
        'glass-card p-5 rounded-2xl border-2',
        config.border,
        config.glow,
        className
      )}
      role="article"
      aria-live="polite"
      aria-label={`Insight: ${headline}`}
    >
      {/* Header with Icon */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-text-primary mb-1">{headline}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{explanation}</p>
        </div>
      </div>

      {/* Action */}
      <div className={cn('p-3 rounded-lg mb-3', config.bg)}>
        <p className="text-sm font-medium text-text-primary">
          <span className="font-semibold">Action: </span>
          {action}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {confidence > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Confidence:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 bg-bg-elevated rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', {
                    'bg-success': confidence >= 80,
                    'bg-warning': confidence >= 60 && confidence < 80,
                    'bg-error': confidence < 60,
                  })}
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-medium text-text-secondary">{confidence}%</span>
            </div>
          </div>
        )}
        
        {learnMoreLink && (
          <a
            href={learnMoreLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-600 transition-colors"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
