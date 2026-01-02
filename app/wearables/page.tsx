'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import { Watch, Activity, Moon, HeartPulse, CheckCircle2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

type Device = 'apple' | 'fitbit' | 'oura';

export default function WearablesPage() {
  const { address, isConnected } = useAccount();
  const [device, setDevice] = useState<Device>('apple');
  const [accessToken, setAccessToken] = useState('');
  const [fitbitUserId, setFitbitUserId] = useState('');
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

    try {
      const response = await fetch('/api/wearables/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          device,
          accessToken,
          userId: device === 'fitbit' ? fitbitUserId || 'default' : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync device');
      }
      setResult(data.data || null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to sync device');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      icon: Activity,
      title: 'Steps & Activity',
      body: 'Import your daily steps, active minutes, and calorie burn.',
    },
    {
      icon: Moon,
      title: 'Sleep Quality',
      body: 'Pull sleep duration, deep sleep, and quality scores.',
    },
    {
      icon: HeartPulse,
      title: 'Heart Metrics',
      body: 'Track resting HR, average HR, and peak heart rates.',
    },
  ];

  return (
    <MainLayout title="Wearables & Devices" subtitle="Link Apple Health, Fitbit, or Oura to keep your wellness data in sync">
      <div className="max-w-6xl mx-auto space-y-8">

          {/* Overview cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} variants={staggerItem}>
                  <AnimatedCard hover>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary/10 to-accent-teal/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div className="text-sm font-semibold text-text-primary">
                        {card.title}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {card.body}
                    </p>
                  </AnimatedCard>
                </motion.div>
              );
            })}
            </div>
          </motion.div>

          {/* Connection form */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15 }}
          >
            <AnimatedCard>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold text-text-primary mb-2">
                    Connect a device
                  </h2>
                  <p className="text-sm text-text-secondary mb-4">
                    In production, this will open the official Apple, Fitbit, or Oura consent
                    flows. For now, you can simulate a sync by entering a placeholder token.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setDevice('apple')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        device === 'apple'
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-gray-200 text-text-secondary hover:border-accent-primary/40'
                      }`}
                    >
                      Apple Health
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice('fitbit')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        device === 'fitbit'
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-gray-200 text-text-secondary hover:border-accent-primary/40'
                      }`}
                    >
                      Fitbit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice('oura')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        device === 'oura'
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-gray-200 text-text-secondary hover:border-accent-primary/40'
                      }`}
                    >
                      Oura
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">
                        Access token (test value)
                      </label>
                      <input
                        type="text"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="input-premium w-full"
                        placeholder="Paste or type a placeholder token"
                      />
                    </div>
                    {device === 'fitbit' && (
                      <div>
                        <label className="block text-xs font-medium text-text-primary mb-1">
                          Fitbit user ID (optional)
                        </label>
                        <input
                          type="text"
                          value={fitbitUserId}
                          onChange={(e) => setFitbitUserId(e.target.value)}
                          className="input-premium w-full"
                          placeholder="Fitbit user id"
                        />
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-3 text-xs text-semantic-error bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <div className="mt-4">
                    <AnimatedButton
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleSync}
                      disabled={loading}
                    >
                      {loading ? 'Syncing…' : 'Sync now'}
                    </AnimatedButton>
                  </div>
                </div>

                {result && (
                  <div className="w-full md:w-72 border border-border-light rounded-2xl p-4 bg-cream/40">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-semantic-success" />
                      <span className="text-sm font-semibold text-text-primary">
                        Last sync
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">
                      {result.synced} data points imported. You earned{' '}
                      <span className="font-semibold text-semantic-success">
                        {result.reward} $tabledadrian
                      </span>{' '}
                      for staying connected.
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      Tip: keep your wearable connected and sync daily to keep your health coach
                      up to date.
                    </p>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </motion.div>
        </div>
      </MainLayout>
  );
}


