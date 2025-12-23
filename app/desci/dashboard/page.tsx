/**
 * DeSci Dashboard
 * Shows data contributions and token earnings
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Database, Coins, ExternalLink } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

interface Contribution {
  id: string;
  date: string;
  dataPoints: number;
  tokenReward: number;
  researchStudy: string | null;
  transactionHash: string | null;
}

interface Earnings {
  totalEarned: number;
  totalDataPoints: number;
  contributions: Contribution[];
}

interface Breakdown {
  [key: string]: {
    count: number;
    tokens: number;
    dataPoints: number;
  };
}

export default function DeSciDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['desci-earnings'],
    queryFn: async () => {
      const res = await fetch('/api/desci/earnings');
      if (!res.ok) throw new Error('Failed to fetch earnings');
      const json = await res.json();
      return {
        earnings: json.earnings as Earnings,
        breakdown: json.breakdown as Breakdown,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-text-secondary">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-error">Error loading earnings</p>
        </div>
      </div>
    );
  }

  const { earnings, breakdown } = data || {
    earnings: { totalEarned: 0, totalDataPoints: 0, contributions: [] },
    breakdown: {},
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
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          DeSci Dashboard
        </h1>
        <p className="text-text-secondary">
          Track your data contributions and token earnings
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-6 h-6 text-primary" />
            <h3 className="text-sm font-medium text-text-secondary">
              Total Tokens Earned
            </h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {earnings.totalEarned.toFixed(2)} $TA
          </p>
          <p className="text-xs text-text-secondary mt-1">
            ≈ ${(earnings.totalEarned * 0.1).toFixed(2)} USD
          </p>
        </motion.div>

        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-success" />
            <h3 className="text-sm font-medium text-text-secondary">
              Data Points Contributed
            </h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {earnings.totalDataPoints.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Contributing to longevity research
          </p>
        </motion.div>

        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-warning" />
            <h3 className="text-sm font-medium text-text-secondary">
              Contributions
            </h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {earnings.contributions.length}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Total contributions
          </p>
        </motion.div>
      </div>

      {/* Earnings Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl mb-8"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Earnings Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([category, stats]) => (
              <div
                key={category}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary capitalize">
                    {category.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {stats.count} contributions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {stats.tokens.toFixed(2)} $TA
                  </p>
                  <p className="text-xs text-text-secondary">
                    {stats.dataPoints} data points
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Contributions */}
      <motion.div
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        className="glass-card p-6 rounded-2xl"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Recent Contributions
        </h2>
        {earnings.contributions.length > 0 ? (
          <div className="space-y-3">
            {earnings.contributions.slice(0, 20).map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(contribution.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {contribution.dataPoints} data points
                    {contribution.researchStudy &&
                      ` • ${contribution.researchStudy}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">
                      +{contribution.tokenReward.toFixed(2)} $TA
                    </p>
                  </div>
                  {contribution.transactionHash && (
                    <a
                      href={`https://basescan.org/tx/${contribution.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-3 text-text-secondary" />
            <p className="text-text-secondary">
              No contributions yet. Start syncing your wearables or logging meals
              to earn tokens!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
