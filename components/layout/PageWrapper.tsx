'use client';

import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function PageWrapper({ children, title, description, className = '' }: PageWrapperProps) {
  return (
    <>
      <main className={`min-h-screen bg-base-200 py-4 md:py-8 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto">
          {(title || description) && (
            <div className="mb-6 md:mb-8">
              {title && <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">{title}</h1>}
              {description && <p className="text-base-content/70">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
      <MobileNav />
    </>
  );
}

