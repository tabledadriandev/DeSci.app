'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Heart, Moon, TrendingUp } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { useAllWearablesSync } from '@/lib/realtime/sync';
import BiometricCard from '@/components/biometrics/BiometricCard';
import { cn } from '@/lib/utils/cn';

export default function BiometricsDashboard() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from auth (would come from auth context)
    setUserId('current-user-id'); // Placeholder
  }, []);

  // Sync all wearables
  const { data: syncData, isLoading: syncing, syncAll } = useAllWearablesSync(userId || '');

  // Fetch latest biomarker readings
  const { data: biomarkers, isLoading: loadingBiomarkers } = useQuery({
    queryKey: ['biomarkers', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/biomarkers/latest?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch biomarkers');
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Calculate trends (7-day)
  const getTrend = (metric: string): number[] => {
    // In production, fetch from API
    // For now, return mock trend
    return [45, 47, 46, 48, 49, 50, 52];
  };

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
            <h1 className="text-3xl font-bold text-text-primary mb-2">Biometric Dashboard</h1>
            <p className="text-text-secondary">
              Real-time data from all connected wearables
            </p>
          </div>
          <button
            onClick={() => syncAll()}
            disabled={syncing}
            className="btn-primary flex items-center gap-2"
          >
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
        </motion.div>

        {/* Biometric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HRV Card */}
          <BiometricCard
            metric="Heart Rate Variability"
            value={biomarkers?.hrv || 52}
            unit="ms"
            trend={getTrend('hrv')}
            status={biomarkers?.hrv > 50 ? 'good' : biomarkers?.hrv > 40 ? 'caution' : 'alert'}
            personalBest={58}
            syncStatus="synced"
          />

          {/* Sleep Score Card */}
          <BiometricCard
            metric="Sleep Score"
            value={biomarkers?.sleepScore || 82}
            unit=""
            trend={getTrend('sleep')}
            status={biomarkers?.sleepScore > 80 ? 'good' : biomarkers?.sleepScore > 70 ? 'caution' : 'alert'}
            personalBest={90}
            syncStatus="synced"
          />

          {/* Recovery Card */}
          <BiometricCard
            metric="Recovery"
            value={biomarkers?.recovery || 72}
            unit="%"
            trend={getTrend('recovery')}
            status={biomarkers?.recovery > 70 ? 'good' : biomarkers?.recovery > 60 ? 'caution' : 'alert'}
            personalBest={85}
            syncStatus="synced"
          />

          {/* Readiness Card */}
          <BiometricCard
            metric="Readiness"
            value={biomarkers?.readiness || 68}
            unit=""
            trend={getTrend('readiness')}
            status={biomarkers?.readiness > 70 ? 'good' : biomarkers?.readiness > 60 ? 'caution' : 'alert'}
            personalBest={75}
            syncStatus="synced"
          />

          {/* Steps Card */}
          <BiometricCard
            metric="Steps"
            value={biomarkers?.steps || 8500}
            unit=""
            trend={getTrend('steps')}
            status={biomarkers?.steps > 10000 ? 'good' : biomarkers?.steps > 7000 ? 'caution' : 'alert'}
            personalBest={12000}
            syncStatus="synced"
          />

          {/* Activity Card */}
          <BiometricCard
            metric="Active Minutes"
            value={biomarkers?.activeMinutes || 45}
            unit="min"
            trend={getTrend('activity')}
            status={biomarkers?.activeMinutes > 30 ? 'good' : 'caution'}
            personalBest={60}
            syncStatus="synced"
          />
        </div>

        {/* Connected Devices */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">Connected Devices</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {['Oura', 'Apple Health', 'Google Fit', 'WHOOP', 'Strava', 'Fitbit'].map((device) => (
              <div
                key={device}
                className="p-3 rounded-lg bg-bg-elevated text-center"
              >
                <p className="text-sm font-medium text-text-primary">{device}</p>
                <p className="text-xs text-success mt-1">Connected</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
