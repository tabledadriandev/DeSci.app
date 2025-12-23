'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import HealthGauge from '@/components/biometrics/HealthGauge';
import { cn } from '@/lib/utils/cn';

export default function BiologicalAgePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId('current-user-id'); // Would come from auth
  }, []);

  // Fetch biological age
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['biologicalAge', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/biomarkers/biological-age?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch biological age');
      return response.json();
    },
    enabled: !!userId,
  });

  // Calculate mutation
  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/biomarkers/calculate-biological-age', {
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

  const biologicalAge = data?.biologicalAge || 0;
  const chronologicalAge = data?.chronologicalAge || 0;
  const improvement = chronologicalAge - biologicalAge;
  const progress = improvement > 0 ? (improvement / 10) * 100 : 0; // Assuming 10 years is max improvement

  return (
    <div className="min-h-screen p-4 md:p-8 bg-bg-primary">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Biological Age</h1>
            <p className="text-text-secondary">
              Your aging speed calculated from wearable data
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

        {/* Main Gauge */}
        {data && (
          <HealthGauge
            goal="Biological Age Improvement"
            current={biologicalAge}
            target={chronologicalAge - 5} // Target: 5 years younger
            progress={progress}
            daysToGoal={improvement > 0 ? undefined : 90}
            helpingFactors={[
              { name: 'HRV Optimization', impact: 15 },
              { name: 'Sleep Quality', impact: 20 },
              { name: 'Activity Consistency', impact: 10 },
            ]}
            unit="years"
          />
        )}

        {/* Age Breakdown */}
        {data?.factors && (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Age Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-xs text-text-secondary mb-1">Cardiac Age</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {data.factors.cardiacAge.toFixed(1)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">HRV-based</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-xs text-text-secondary mb-1">Sleep Age</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {data.factors.sleepAge.toFixed(1)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Quality-based</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10">
                <p className="text-xs text-text-secondary mb-1">Activity Age</p>
                <p className="text-2xl font-bold font-mono text-warning">
                  {data.factors.activityAge.toFixed(1)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Movement-based</p>
              </div>
              <div className="p-4 rounded-lg bg-error/10">
                <p className="text-xs text-text-secondary mb-1">Recovery Age</p>
                <p className="text-2xl font-bold font-mono text-error">
                  {data.factors.recoveryAge.toFixed(1)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Adaptation-based</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Improvement Drivers */}
        {data?.factors?.drivers && (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">What's Driving Your Score</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <span className="text-sm font-medium text-text-primary">Primary Driver</span>
                <span className="text-sm font-semibold text-primary capitalize">
                  {data.factors.drivers.primary}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <span className="text-sm font-medium text-text-primary">Secondary Driver</span>
                <span className="text-sm font-semibold text-success capitalize">
                  {data.factors.drivers.secondary}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                <span className="text-sm font-medium text-text-primary">Tertiary Driver</span>
                <span className="text-sm font-semibold text-warning capitalize">
                  {data.factors.drivers.tertiary}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5-Year Trajectory */}
        {data && (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">5-Year Trajectory</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-text-secondary mb-1">Current</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {biologicalAge.toFixed(1)} years
                </p>
              </div>
              <div className="flex-1 text-center">
                {improvement > 0 ? (
                  <TrendingDown className="w-8 h-8 text-success mx-auto" />
                ) : (
                  <TrendingUp className="w-8 h-8 text-error mx-auto" />
                )}
                <p className={cn(
                  'text-sm font-medium mt-1',
                  improvement > 0 ? 'text-success' : 'text-error'
                )}>
                  {improvement > 0 ? `${improvement.toFixed(1)} years younger` : `${Math.abs(improvement).toFixed(1)} years older`}
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-text-secondary mb-1">Chronological</p>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {chronologicalAge} years
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
