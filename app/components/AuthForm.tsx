'use client';

import { useState, useEffect } from 'react';
import { BadgeCheck } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    google?: any;
    AppleID?: any;
  }
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load Google Identity Services
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleAppleAuth = async (response: any) => {
    try {
      const authResponse = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'apple',
          providerId: response.user,
          email: response.email,
          displayName: response.name || response.email,
        }),
      });

      const authData = await authResponse.json();
      if (authResponse.ok && authData.success) {
        setSuccess('Apple login successful!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else window.location.reload();
        }, 1000);
      } else {
        setError(authData.error || 'Apple authentication failed');
      }
    } catch (err: any) {
      setError('Failed to complete Apple login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          action: isLogin ? 'login' : 'register',
        }),
      });

      // Read response safely – API should return JSON, but in dev
      // Next can send back HTML error pages, which would break .json().
      let data: any = {};
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Not valid JSON – keep data as empty object
      }

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
      
      // Reload page to update auth state
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }, 1000);
    } catch (err: any) {
      setError('An unexpected error occurred while contacting the server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-display text-accent-primary mb-2 text-center">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <p className="text-text-secondary text-center mb-6">
          {isLogin
            ? 'Welcome back! Sign in to continue'
            : 'Create an account to get started'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition"
            />
            {error && error.includes('email') && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition"
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-text-secondary">Must be at least 8 characters</p>
            )}
            {error && error.includes('password') && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300'
                    : confirmPassword && password === confirmPassword && password.length >= 8
                    ? 'border-green-300'
                    : 'border-gray-300'
                }`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 8 && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary text-white py-3 rounded-lg font-semibold hover:bg-accent-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Social login */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-text-tertiary uppercase tracking-[0.16em]">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  setError('');
                  // Google OAuth - Load Google Identity Services
                  if (typeof window !== 'undefined' && (window as any).google) {
                    const client = (window as any).google.accounts.oauth2.initTokenClient({
                      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                      scope: 'email profile',
                      callback: async (response: any) => {
                        try {
                          // Get user info from Google
                          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { Authorization: `Bearer ${response.access_token}` },
                          });
                          const userInfo = await userInfoResponse.json();

                          // Call our social auth endpoint
                          const authResponse = await fetch('/api/auth/social', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              provider: 'google',
                              providerId: userInfo.id,
                              email: userInfo.email,
                              displayName: userInfo.name,
                              avatarUrl: userInfo.picture,
                            }),
                          });

                          const authData = await authResponse.json();
                          if (authResponse.ok && authData.success) {
                            setSuccess('Google login successful!');
                            setTimeout(() => {
                              if (onSuccess) onSuccess();
                              else window.location.reload();
                            }, 1000);
                          } else {
                            setError(authData.error || 'Google authentication failed');
                          }
                        } catch (err: any) {
                          setError('Failed to complete Google login');
                        } finally {
                          setLoading(false);
                        }
                      },
                    });
                    client.requestAccessToken();
                  } else {
                    // Fallback: redirect to backend OAuth if client library not loaded
                    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(window.location.href)}`;
                  }
                } catch (err: any) {
                  setError('Google sign-in failed. Please try again.');
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-text-primary">
                Google
              </span>
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  setError('');
                  // Apple Sign In
                  if (typeof window !== 'undefined' && (window as any).AppleID) {
                    // Use Apple ID JS SDK if available
                    (window as any).AppleID.auth.signIn({
                      requestedScopes: ['email', 'name'],
                    }).then((response: any) => {
                      handleAppleAuth(response);
                    }).catch((err: any) => {
                      setError('Apple sign-in failed');
                      setLoading(false);
                    });
                  } else {
                    // Fallback: redirect to backend OAuth
                    window.location.href = `/api/auth/apple?redirect=${encodeURIComponent(window.location.href)}`;
                  }
                } catch (err: any) {
                  setError('Apple sign-in failed. Please try again.');
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-sm font-medium text-text-primary">
                Apple
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-accent-primary hover:text-accent-primary/80 text-sm font-medium"
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

