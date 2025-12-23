'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

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
      className={`group relative flex w-full flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-accent-primary/20 ${className}`}
    >
      {/* Background gradient overlay - removed per requirements */}
      <div className="absolute inset-px rounded-[11px] bg-slate-950"></div>

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary">
              <Icon className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
          {status && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                status.active
                  ? 'bg-semantic-success/10 text-semantic-success'
                  : 'bg-semantic-error/10 text-semantic-error'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status.active ? 'bg-semantic-success' : 'bg-semantic-error'
                }`}
              ></span>
              {status.label}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg bg-slate-900/50 p-3">
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
                {stat.change && (
                  <span
                    className={`text-xs font-medium ${
                      stat.changePositive !== false
                        ? 'text-semantic-success'
                        : 'text-semantic-error'
                    }`}
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
          <div className="mb-4 h-24 w-full overflow-hidden rounded-lg bg-slate-900/50 p-3">
            {chart}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">{footer.label}</span>
            </div>
            {footer.actionLabel && footer.onAction && (
              <button
                onClick={footer.onAction}
                className="flex items-center gap-1 rounded-lg bg-accent-primary px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:bg-accent-primary/80"
              >
                {footer.actionLabel}
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

