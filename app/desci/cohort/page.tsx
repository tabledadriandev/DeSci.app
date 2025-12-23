/**
 * Cohort Comparison Dashboard
 * Compare your metrics with anonymized peer data
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CohortComparisonMatrix from '@/components/biometrics/CohortComparisonMatrix';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

interface CohortMetrics {
  metric: string;
  userValue: number;
  healthyRange: { min: number; max: number };
  cohortAverage: number;
  cohortMedian: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

interface CohortComparison {
  metrics: CohortMetrics[];
  cohortSize: number;
  filters: {
    ageRange?: [number, number];
    gender?: string;
    goals?: string[];
  };
}

export default function CohortComparisonPage() {
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    gender: '',
    goals: [] as string[],
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cohort-comparison', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.ageMin) params.append('ageMin', filters.ageMin);
      if (filters.ageMax) params.append('ageMax', filters.ageMax);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.goals.length > 0) params.append('goals', filters.goals.join(','));

      const res = await fetch(`/api/desci/cohort?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch cohort data');
      const json = await res.json();
      return json.comparison as CohortComparison;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-text-secondary">Loading cohort data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-error">Error loading cohort data</p>
        </div>
      </div>
    );
  }

  const comparison = data || {
    metrics: [],
    cohortSize: 0,
    filters: {},
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-text-primary">
            Cohort Comparison
          </h1>
        </div>
        <p className="text-text-secondary">
          Compare your metrics with anonymized peer data
        </p>
        {comparison.cohortSize > 0 && (
          <p className="text-sm text-text-secondary mt-2">
            Based on {comparison.cohortSize.toLocaleString()} anonymized users
          </p>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        className="glass-card p-6 rounded-2xl mb-8"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Filter Cohort
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Age Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.ageMin}
                onChange={(e) =>
                  setFilters({ ...filters, ageMin: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-text-secondary">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.ageMax}
                onChange={(e) =>
                  setFilters({ ...filters, ageMax: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {['longevity', 'performance', 'sleep', 'recovery'].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => {
                    const goals = filters.goals.includes(goal)
                      ? filters.goals.filter((g) => g !== goal)
                      : [...filters.goals, goal];
                    setFilters({ ...filters, goals });
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    filters.goals.includes(goal)
                      ? 'bg-primary text-white'
                      : 'bg-bg-elevated border border-border-light text-text-primary hover:border-primary'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison Matrix */}
      {comparison.metrics.length > 0 ? (
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
        >
          <CohortComparisonMatrix
            metrics={comparison.metrics.map((m) => {
              const getUnit = (metric: string) => {
                const units: Record<string, string> = {
                  hrv: 'ms',
                  sleep_score: '',
                  recovery: '%',
                  readiness: '',
                  steps: '',
                  active_minutes: 'min',
                  biological_age: 'years',
                };
                return units[metric] || '';
              };
              return {
                metric: m.metric.replace('_', ' '),
                userValue: m.userValue,
                range: m.healthyRange,
                cohortAverage: m.cohortAverage,
                percentile: m.percentile,
                trend: m.trend,
                unit: getUnit(m.metric),
              };
            })}
          />
        </motion.div>
      ) : (
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-12 rounded-2xl text-center"
        >
          <Users className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Cohort Data Available
          </h3>
          <p className="text-text-secondary">
            Start syncing your wearables to see how you compare with peers
          </p>
        </motion.div>
      )}
    </div>
  );
}
