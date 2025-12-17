'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/onboarding',
  '/verify-email',
  '/reset-password',
  '/about',
  '/privacy',
  '/terms',
];

// Routes that require onboarding to be completed
const ONBOARDING_REQUIRED_ROUTES = [
  '/health-score',
  '/biomarkers',
  '/coach',
  '/wellness-plan',
  '/nutrition',
  '/meals',
  '/habits',
  '/symptoms',
  '/wearables',
  '/health-assessment',
  '/marketplace',
  '/staking',
  '/nfts',
  '/governance',
  '/achievements',
  '/challenges',
  '/community',
  '/telemedicine',
  '/chef-services',
  '/fasting',
];

export default function ProtectedRoute({ 
  children, 
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Compute route checks
  const isPublicRoute = useMemo(() => 
    PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    ), [pathname]);

  const needsOnboarding = useMemo(() => 
    ONBOARDING_REQUIRED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    ), [pathname]);

  // Determine if redirect is needed
  const shouldRedirect = useMemo(() => {
    if (isLoading) return false;
    
    // Not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      return true;
    }

    // Authenticated but onboarding not completed and on onboarding-required page
    if (isAuthenticated && user && !user.onboardingCompleted && needsOnboarding && pathname !== '/onboarding') {
      return true;
    }

    // On auth page but already authenticated
    if (isAuthenticated && pathname === '/auth') {
      return true;
    }

    // On onboarding but already completed
    if (isAuthenticated && user?.onboardingCompleted && pathname === '/onboarding') {
      return true;
    }

    return false;
  }, [isLoading, isAuthenticated, isPublicRoute, user, needsOnboarding, pathname]);

  useEffect(() => {
    if (isLoading || isRedirecting) return;

    // Not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      setIsRedirecting(true);
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Authenticated but onboarding not completed and on onboarding-required page
    if (isAuthenticated && user && !user.onboardingCompleted && needsOnboarding && pathname !== '/onboarding') {
      setIsRedirecting(true);
      router.push('/onboarding');
      return;
    }

    // On auth page but already authenticated
    if (isAuthenticated && pathname === '/auth') {
      setIsRedirecting(true);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/');
      return;
    }

    // On onboarding but already completed
    if (isAuthenticated && user?.onboardingCompleted && pathname === '/onboarding') {
      setIsRedirecting(true);
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, pathname, router, isPublicRoute, needsOnboarding, isRedirecting]);

  // Show loading while checking auth or redirecting
  if (isLoading || isRedirecting || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to check if current route is protected
export function useProtectedRoute() {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const needsOnboarding = ONBOARDING_REQUIRED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  return {
    isProtected: !isPublicRoute,
    needsOnboarding: needsOnboarding && !user?.onboardingCompleted,
    isAuthenticated,
    isLoading,
  };
}

