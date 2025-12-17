'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, Loader2, ArrowRight, RefreshCw, Dna } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth');
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

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
          <p className="text-sm text-text-tertiary mt-1">Email Verification</p>
        </div>

        <div className="glass-card p-8 text-center">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="w-16 h-16 text-accent-primary mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Verifying your email...
              </h2>
              <p className="text-text-secondary">
                Please wait while we verify your email address.
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Email Verified!
              </h2>
              <p className="text-text-secondary mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <p className="text-sm text-text-tertiary mb-4">
                Redirecting to sign in...
              </p>
              <Link href="/auth">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  Sign In Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Verification Failed
              </h2>
              <p className="text-text-secondary mb-2">
                {errorMessage}
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                The verification link may have expired or is invalid.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link href="/auth">
                  <button className="btn-primary w-full">
                    Back to Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {status === 'no-token' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Check Your Email
              </h2>
              <p className="text-text-secondary mb-6">
                We've sent a verification link to your email address. Please click the link to verify your account.
              </p>
              <div className="p-4 rounded-xl bg-bg-elevated border border-border-light mb-6">
                <p className="text-sm text-text-secondary">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or click below to resend.
                </p>
              </div>
              <div className="space-y-3">
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Resend Verification Email
                </button>
                <Link href="/auth">
                  <button className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors">
                    Back to Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

