'use client';

import { motion } from 'framer-motion';
import LineChart from '@/components/charts/LineChart';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface BiometricCardProps {
  metric: string;
  value: number;
  unit: string;
  trend?: number[]; // 7-day trend data for sparkline
  status?: 'good' | 'caution' | 'alert';
  personalBest?: number;
  syncStatus?: 'synced' | 'syncing' | 'error';
  className?: string;
}

export default function BiometricCard({
  metric,
  value,
  unit,
  trend = [],
  status = 'good',
  personalBest,
  syncStatus = 'synced',
  className,
}: BiometricCardProps) {
  const statusConfig = {
    good: {
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: CheckCircle2,
    },
    caution: {
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: AlertCircle,
    },
    alert: {
      color: 'text-error',
      bg: 'bg-error/10',
      border: 'border-error/20',
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const trendDirection = trend.length > 1 
    ? trend[trend.length - 1] - trend[0] 
    : 0;
  const TrendIcon = trendDirection > 0 ? TrendingUp : trendDirection < 0 ? TrendingDown : Minus;

  const chartData = trend.length > 0 ? {
    labels: trend.map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: metric,
        data: trend,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  } : null;

  return (
    <motion.div
      {...glassEntranceAnimation}
      className={cn(
        'card bg-base-100 shadow-md border',
        config.border,
        className
      )}
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="card-title text-base-content text-lg">{metric}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-base-content">{value}</span>
              <span className="text-sm text-base-content/70">{unit}</span>
            </div>
          </div>
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>
        </div>

        {trend.length > 0 && chartData && (
          <div className="h-20 -mx-4 -mb-4">
            <LineChart data={chartData} height={80} />
          </div>
        )}

        {personalBest && (
          <div className="mt-2 text-xs text-base-content/60">
            Personal Best: {personalBest} {unit}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs">
            <TrendIcon className="w-3 h-3" />
            <span className="text-base-content/60">7-day trend</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span className="text-base-content/60">
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Error'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
