'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function StatCard({ title, value, description, icon, variant = 'primary' }: StatCardProps) {
  const variantClasses = {
    primary: 'stat-primary',
    secondary: 'stat-secondary',
    success: 'stat-success',
    warning: 'stat-warning',
    error: 'stat-error',
  };

  return (
    <div className={`stat bg-base-100 shadow rounded-lg ${variantClasses[variant]}`}>
      <div className="stat-figure text-primary">{icon}</div>
      <div className="stat-title text-base-content/60">{title}</div>
      <div className="stat-value text-base-content">{value}</div>
      {description && <div className="stat-desc text-base-content/60">{description}</div>}
    </div>
  );
}

