'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Moon, Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import BiometricCard from '@/components/biometrics/BiometricCard';
import { cn } from '@/lib/utils/cn';

export default function AdvancedMetricsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId('current-user-id'); // Would come from auth
  }, []);

  // Fetch advanced metrics
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['advancedMetrics', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/metrics/advanced?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Calculate mutation
  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/metrics/calculate-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className="min-h-screen p-4 md:p-8 bg-bg-primary">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Advanced Metrics</h1>
            <p className="text-text-secondary">
              Deep insights into your wellness and longevity
            </p>
          </div>
          <button
            onClick={() => calculateMutation.mutate()}
            disabled={calculateMutation.isPending}
            className="btn-primary"
          >
            {calculateMutation.isPending ? 'Calculating...' : 'Recalculate'}
          </button>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HRV Coherence */}
          <BiometricCard
            metric="HRV Coherence"
            value={data?.hrvCoherence || 0}
            unit=""
            status={data?.hrvCoherence > 70 ? 'good' : data?.hrvCoherence > 50 ? 'caution' : 'alert'}
            syncStatus="synced"
          />

          {/* Sleep Debt */}
          <BiometricCard
            metric="Sleep Debt"
            value={data?.sleepDebt || 0}
            unit="hours"
            status={data?.sleepDebt < 5 ? 'good' : data?.sleepDebt < 10 ? 'caution' : 'alert'}
            syncStatus="synced"
          />

          {/* Parasympathetic Tone */}
          <BiometricCard
            metric="Parasympathetic Tone"
            value={data?.parasympatheticTone || 0}
            unit=""
            status={data?.parasympatheticTone > 60 ? 'good' : data?.parasympatheticTone > 40 ? 'caution' : 'alert'}
            syncStatus="synced"
          />

          {/* Training Responsiveness */}
          <BiometricCard
            metric="Training Responsiveness"
            value={data?.trainingResponsiveness || 0}
            unit="%"
            status={data?.trainingResponsiveness > 70 ? 'good' : data?.trainingResponsiveness > 50 ? 'caution' : 'alert'}
            syncStatus="synced"
          />

          {/* Mitochondrial Proxy */}
          <BiometricCard
            metric="Mitochondrial Function"
            value={data?.mitochondrialProxy || 0}
            unit=""
            status={data?.mitochondrialProxy > 70 ? 'good' : data?.mitochondrialProxy > 50 ? 'caution' : 'alert'}
            syncStatus="synced"
          />

          {/* Circadian Robustness */}
          <BiometricCard
            metric="Circadian Robustness"
            value={data?.circadianRobustness || 0}
            unit=""
            status={data?.circadianRobustness > 70 ? 'good' : data?.circadianRobustness > 50 ? 'caution' : 'alert'}
            syncStatus="synced"
          />
        </div>

        {/* Longevity Score */}
        {data?.longevityScore && (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card premium p-6 rounded-2xl border-2 border-amber-400/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-text-primary">Longevity Score</h2>
            </div>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold token-balance mb-2">
                {data.longevityScore.score}
              </p>
              <p className="text-lg font-medium text-text-primary mb-1">
                {data.longevityScore.trajectory}
              </p>
              <p className="text-sm text-text-secondary">
                {data.longevityScore.prediction}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
