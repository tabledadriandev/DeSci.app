'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  ...props
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-28 text-sm',
    md: 'h-9 w-32 text-base',
    lg: 'h-10 w-36 text-lg',
  };

  return (
    <button
      className={cn(
        'uiverse-button',
        sizeClasses[size],
        variant === 'primary' && 'bg-accent-primary/20',
        variant === 'secondary' && 'bg-accent-primary/10',
        className
      )}
      {...props}
    >
      <span className="uiverse-label text-accent-primary font-sans">
        {children}
      </span>
      {icon && <span className="uiverse-svg-icon">{icon}</span>}
      {!icon && (
        <svg
          className="uiverse-svg-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

