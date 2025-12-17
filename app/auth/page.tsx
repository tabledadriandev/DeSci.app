'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, Lock, User, Calendar, Eye, EyeOff, 
  Wallet, ChevronRight, ArrowLeft, Sparkles, Dna, Loader2
} from 'lucide-react';
import { useAuth, RegisterData } from '@/contexts/AuthContext';

type AuthMode = 'welcome' | 'login' | 'register';

// Separate component for search params to avoid hydration issues
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, user } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const getPostAuthRedirect = () => {
    if (user && !user.onboardingCompleted) {
      return '/onboarding';
    }
    return redirectUrl;
  };
  
  const [formData, setFormData] = useState<RegisterData & { password?: string; confirmPassword?: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push(getPostAuthRedirect());
    }
  }, [isAuthenticated]);

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'twitter') => {
    setIsLoading(true);
    setError('');
    try {
      await login(provider);
      router.push(getPostAuthRedirect());
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login('email', { email: formData.email, password: formData.password });
      router.push(getPostAuthRedirect());
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      await register('email', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
      });
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {mode === 'welcome' && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Welcome</h2>
            <p className="text-sm text-text-secondary mt-1">
              Choose how you'd like to continue
            </p>
          </div>

          {/* Wallet Connection - Primary option */}
          <button
            onClick={() => {
              // Navigate to a dedicated wallet connect page or use modal
              setError('Wallet connection coming soon! Use email for now.');
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Connect Wallet</div>
                <div className="text-xs opacity-80">Earn $tabledadrian rewards</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-bg-surface text-text-tertiary">or continue with</span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center p-3 rounded-xl border border-border-light hover:border-accent-primary/50 hover:bg-bg-elevated transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="flex items-center justify-center p-3 rounded-xl border border-border-light hover:border-accent-primary/50 hover:bg-bg-elevated transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
            <button
              onClick={() => handleSocialLogin('twitter')}
              disabled={isLoading}
              className="flex items-center justify-center p-3 rounded-xl border border-border-light hover:border-accent-primary/50 hover:bg-bg-elevated transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>

          {/* Email Options */}
          <div className="space-y-2 mt-4">
            <button
              onClick={() => setMode('login')}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-border-light hover:border-accent-primary/50 hover:bg-bg-elevated transition-colors text-sm font-medium text-text-primary"
            >
              <Mail className="w-4 h-4" />
              Sign in with Email
            </button>
            <button
              onClick={() => setMode('register')}
              className="w-full text-center text-sm text-text-secondary hover:text-accent-primary transition-colors"
            >
              Don't have an account? <span className="font-medium">Sign up</span>
            </button>
          </div>

          {error && (
            <p className="text-sm text-semantic-error text-center mt-4">{error}</p>
          )}
        </motion.div>
      )}

      {mode === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <button
            onClick={() => setMode('welcome')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h2 className="text-xl font-semibold text-text-primary mb-6">Sign In</h2>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-semantic-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-text-secondary text-center mt-4">
            Don't have an account?{' '}
            <button onClick={() => setMode('register')} className="text-accent-primary font-medium hover:underline">
              Sign up
            </button>
          </p>
        </motion.div>
      )}

      {mode === 'register' && (
        <motion.div
          key="register"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <button
            onClick={() => setMode('welcome')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h2 className="text-xl font-semibold text-text-primary mb-6">Create Account</h2>

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Birth Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-semantic-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-text-secondary text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-accent-primary font-medium hover:underline">
              Sign in
            </button>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary mx-auto flex items-center justify-center shadow-lg shadow-accent-primary/20 mb-4">
            <Dna className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Table d'Adrian</h1>
          <p className="text-sm text-text-tertiary mt-1">Longevity & DeSci Platform</p>
        </div>

        <div className="glass-card p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
            </div>
          }>
            <AuthContent />
          </Suspense>
        </div>

        {/* Terms */}
        <p className="text-xs text-text-tertiary text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-accent-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-accent-primary hover:underline">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
