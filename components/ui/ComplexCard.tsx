'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
}

interface ComplexCardProps {
  title: string;
  icon: LucideIcon;
  status?: {
    label: string;
    active: boolean;
  };
  stats?: StatItem[];
  chart?: ReactNode;
  footer?: {
    label: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  className?: string;
}

export default function ComplexCard({
  title,
  icon: Icon,
  status,
  stats,
  chart,
  footer,
  className = '',
}: ComplexCardProps) {
  return (
    <div
      className={cn(
        'glass-card-hover p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
            <Icon className="h-5 w-5 text-accent-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        {status && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium',
              status.active
                ? 'bg-semantic-success/10 text-semantic-success'
                : 'bg-semantic-error/10 text-semantic-error'
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                status.active ? 'bg-semantic-success' : 'bg-semantic-error'
              )}
            ></span>
            {status.label}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-lg bg-bg-surface p-3">
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <p className="text-xl font-semibold text-text-primary">{stat.value}</p>
              {stat.change && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    stat.changePositive !== false
                      ? 'text-semantic-success'
                      : 'text-semantic-error'
                  )}
                >
                  {stat.change}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart Area */}
      {chart && (
        <div className="mb-4 h-32 w-full overflow-hidden rounded-lg bg-bg-surface p-3">
          {chart}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-between border-t border-border-light pt-4 mt-4">
          <p className="text-sm text-text-secondary">{footer.label}</p>
          {footer.actionLabel && footer.onAction && (
            <button
              onClick={footer.onAction}
              className="text-sm font-semibold text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              {footer.actionLabel} &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

