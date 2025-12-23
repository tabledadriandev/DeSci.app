'use client';

import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface HealthGaugeProps {
  goal: string;
  current: number;
  target: number;
  progress: number; // 0-100
  daysToGoal?: number;
  helpingFactors?: Array<{ name: string; impact: number }>; // e.g., [{ name: "Meditation", impact: 8 }]
  unit?: string;
  className?: string;
}

export default function HealthGauge({
  goal,
  current,
  target,
  progress,
  daysToGoal,
  helpingFactors = [],
  unit = '',
  className,
}: HealthGaugeProps) {
  const isOnTrack = progress >= 50;
  const progressColor = isOnTrack ? 'from-primary-500 to-success-500' : 'from-warning-500 to-error-500';

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card p-6 rounded-2xl', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">{goal}</h3>
      </div>

      {/* Current vs Target */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <p className="font-mono text-3xl font-bold text-primary-500">
            {current.toLocaleString()}
            {unit && <span className="text-lg text-text-secondary ml-1">{unit}</span>}
          </p>
          <span className="text-text-tertiary">/</span>
          <p className="font-mono text-xl font-semibold text-text-secondary">
            {target.toLocaleString()}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </p>
        </div>
        <p className="text-xs text-text-tertiary">Target: {target.toLocaleString()}{unit}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-bg-elevated rounded-full h-3 overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full bg-gradient-to-r', progressColor)}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Days to Goal */}
      {daysToGoal !== undefined && daysToGoal > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-primary/5">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {isOnTrack ? 'On track' : 'Behind schedule'}
            </p>
            <p className="text-xs text-text-secondary">
              {daysToGoal} days to reach goal
            </p>
          </div>
        </div>
      )}

      {/* Helping Factors */}
      {helpingFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <p className="text-xs font-medium text-text-secondary mb-2">What's helping:</p>
          <div className="space-y-1">
            {helpingFactors.map((factor, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-text-primary">{factor.name}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs font-medium text-success">+{factor.impact}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
