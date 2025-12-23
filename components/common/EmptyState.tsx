'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body text-center space-y-6 py-12">
        <p className="text-5xl">{icon}</p>
        <div className="space-y-2">
          <p className="text-xl font-bold text-base-content">{title}</p>
          <p className="text-base-content/70">{description}</p>
        </div>
        {action && (
          <Link href={action.href} className="btn btn-primary">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

