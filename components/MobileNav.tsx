'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-700 hover:bg-slate-50'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-xl" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Bottom navigation for quick access to 5 key features */}
      <div className="flex justify-around items-center h-20 px-4 safe-area-bottom">
        <NavItem href="/" icon="📊" label="Dashboard" />
        <NavItem href="/biomarkers" icon="🔬" label="Tests" />
        <NavItem href="/biological-age" icon="⏱️" label="Age" />
        <NavItem href="/coach" icon="🤖" label="Coach" />
        <NavItem href="/settings" icon="👤" label="Account" />
      </div>
    </nav>
  );
}

