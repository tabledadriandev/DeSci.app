'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type AuthMethod = 'wallet' | 'email' | 'google' | 'apple' | 'twitter';

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  walletAddress?: string;
  authMethod: AuthMethod;
  avatar?: string;
  onboardingCompleted: boolean;
  emailVerified?: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  login: (method: AuthMethod, credentials?: LoginCredentials) => Promise<void>;
  register: (method: AuthMethod, data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  checkSession: () => Promise<void>;
}

interface LoginCredentials {
  email?: string;
  password?: string;
  walletAddress?: string;
}

export interface RegisterData {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  walletAddress?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ta_user_profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        // Merge with local profile data (for onboarding status)
        const localProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
        const localData = localProfile ? JSON.parse(localProfile) : {};
        
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          walletAddress: data.user.walletAddress,
          emailVerified: data.user.emailVerified,
          authMethod: data.user.walletAddress ? 'wallet' : 'email',
          onboardingCompleted: localData.onboardingCompleted ?? false,
          firstName: localData.firstName,
          lastName: localData.lastName,
          birthDate: localData.birthDate,
          avatar: localData.avatar,
          createdAt: data.user.createdAt || new Date().toISOString(),
        };
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Save local profile data when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        onboardingCompleted: user.onboardingCompleted,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        avatar: user.avatar,
      }));
    }
  }, [user]);

  const login = useCallback(async (method: AuthMethod, credentials?: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (method === 'email' && credentials?.email && credentials?.password) {
        const response = await fetch('/api/auth/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            action: 'login',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Refresh session to get full user data
        await checkSession();
      } else if (method === 'wallet' && credentials?.walletAddress) {
        const response = await fetch('/api/auth/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            walletAddress: credentials.walletAddress,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Wallet login failed');
        }

        await checkSession();
      } else if (['google', 'apple', 'twitter'].includes(method)) {
        // Social login - redirect to OAuth flow
        const response = await fetch('/api/auth/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: method }),
        });

        const data = await response.json();
        
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }

        await checkSession();
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [checkSession]);

  const register = useCallback(async (method: AuthMethod, data: RegisterData) => {
    setIsLoading(true);
    try {
      if (method === 'email' && data.email && data.password) {
        const response = await fetch('/api/auth/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            username: data.username,
            action: 'register',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Registration failed');
        }

        // Store local profile data
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          onboardingCompleted: false,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
        }));

        // Auto-login after registration
        await login('email', { email: data.email, password: data.password });
      } else if (method === 'wallet' && data.walletAddress) {
        const response = await fetch('/api/auth/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            walletAddress: data.walletAddress,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Wallet registration failed');
        }

        await checkSession();
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [checkSession, login]);

  const logout = useCallback(async () => {
    try {
      // Clear server session
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      authMethod: user?.authMethod || null,
      login,
      register,
      logout,
      updateProfile,
      completeOnboarding,
      checkSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

