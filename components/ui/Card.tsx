'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  shadow?: 'sm' | 'md' | 'lg';
}

export function Card({ children, title, className, shadow = 'md' }: CardProps) {
  const shadowClass = {
    sm: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }[shadow];

  return (
    <div className={cn('card bg-base-100', shadowClass, className)}>
      {title && <div className="card-title text-base-content">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}

