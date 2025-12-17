'use client';

import { useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Watch, Activity, Moon, HeartPulse, CheckCircle2 } from 'lucide-react';

type Device = 'apple' | 'fitbit' | 'oura';

export default function WearablesPage() {
  const { address, isConnected } = useAccount();
  const [device, setDevice] = useState<Device>('apple');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ synced: number; reward: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!isConnected || !address) {
      setError('Connect your wallet to link a wearable.');
      return;
    }
    if (!accessToken) {
      setError('Enter an access token or placeholder value to simulate a sync.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Mock API call
    setTimeout(() => {
      setResult({ synced: Math.floor(Math.random() * 500) + 100, reward: 5 });
      setLoading(false);
    }, 2000);
  };

  const cards = [
    { icon: Activity, title: 'Steps & Activity', body: 'Import your daily steps, active minutes, and calorie burn.' },
    { icon: Moon, title: 'Sleep Quality', body: 'Pull sleep duration, deep sleep, and quality scores.' },
    { icon: HeartPulse, title: 'Heart Metrics', body: 'Track resting HR, average HR, and peak heart rates.' },
  ];

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Wearables & Devices
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Link Apple Health, Fitbit, or Oura to keep your wellness data in sync and earn rewards.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Overview cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} variants={fadeInUp} className="glass-card p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-bio-gradient flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-text-primary">{card.title}</h2>
                  </div>
                  <p className="text-sm text-text-secondary">{card.body}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Connection form */}
          <motion.div variants={fadeInUp} className="glass-card p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Connect a Device</h2>
            <p className="text-sm text-text-secondary mb-6 max-w-2xl">
              In a production environment, this would open the official Apple Health, Fitbit, or Oura consent flows. For now, you can simulate a sync by entering any placeholder token.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3">
                <h3 className="font-semibold text-text-secondary">Select Device</h3>
                <button
                  type="button"
                  onClick={() => setDevice('apple')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${device === 'apple' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-medium hover:border-accent-secondary/50'}`}
                >Apple Health</button>
                <button
                  type="button"
                  onClick={() => setDevice('fitbit')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${device === 'fitbit' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-medium hover:border-accent-secondary/50'}`}
                >Fitbit</button>
                <button
                  type="button"
                  onClick={() => setDevice('oura')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${device === 'oura' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-medium hover:border-accent-secondary/50'}`}
                >Oura</button>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Access Token (use any test value)
                  </label>
                  <input
                    type="text"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                    placeholder="Paste or type a placeholder token"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-semantic-error bg-semantic-error/10 border border-semantic-error/20 rounded-lg p-3"
                    >
                      {error}
                    </motion.div>
                  )}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="glass-card p-4 flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-semantic-success" />
                      <div>
                        <p className="font-semibold text-text-primary">Sync Successful</p>
                        <p className="text-sm text-text-secondary">
                          {result.synced} data points imported. You earned <span className="font-bold text-semantic-success">{result.reward} $TA</span>.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatedButton
                  type="button"
                  onClick={handleSync}
                  disabled={loading || !accessToken.trim()}
                  icon={<Watch className="w-5 h-5" />}
                >
                  {loading ? 'Syncing...' : 'Sync Now'}
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}


