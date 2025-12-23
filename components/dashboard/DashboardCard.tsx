'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  status = 'info',
  trend,
}: DashboardCardProps) {
  const statusClasses = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  };

  return (
    <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="card-title text-base text-base-content">{title}</h2>
            <p className="text-3xl font-bold text-base-content mt-2">{value}</p>
            {subtitle && <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>}
          </div>

          {icon && (
            <div className={`${statusClasses[status]} p-3 rounded-lg`}>
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  trend.direction === 'up'
                    ? 'text-success'
                    : trend.direction === 'down'
                    ? 'text-error'
                    : 'text-base-content/60'
                }
              >
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
              </span>
              <span className="font-semibold">{trend.percentage}%</span>
              <span className="text-base-content/60">from last month</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

