'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/biomarkers', label: 'Biomarkers', icon: '🔬' },
    { href: '/health-assessment', label: 'Assessment', icon: '📋' },
    { href: '/challenges', label: 'Challenges', icon: '🏆' },
    { href: '/settings', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="btm-nav lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${isActive ? 'active text-primary' : 'text-base-content/60'}`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="btm-nav-label text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

