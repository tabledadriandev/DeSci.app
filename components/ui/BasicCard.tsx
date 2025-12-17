'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface BasicCardProps {
  children: ReactNode;
  className?: string;
}

export default function BasicCard({ 
  children, 
  className = '',
}: BasicCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

