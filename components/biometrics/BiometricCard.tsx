'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
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
  const StatusIcon = config.icon;

  // Calculate trend direction
  const trendDirection = trend.length >= 2 
    ? (trend[trend.length - 1] > trend[0] ? 'up' : trend[trend.length - 1] < trend[0] ? 'down' : 'stable')
    : 'stable';

  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor = trendDirection === 'up' ? 'text-success' : trendDirection === 'down' ? 'text-error' : 'text-text-tertiary';

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card p-4 rounded-2xl', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary" aria-label={`${metric} metric card`}>{metric}</h3>
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs', config.bg, config.border, 'border')}>
          <StatusIcon className={cn('w-3 h-3', config.color)} />
          <span className={cn('font-medium', config.color)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3" aria-live="polite" aria-atomic="true">
        <p className="font-mono text-3xl font-bold text-primary-500" aria-label={`Current ${metric} value: ${value} ${unit}`}>
          {value.toLocaleString()}
          <span className="text-lg text-text-secondary ml-1">{unit}</span>
        </p>
      </div>

      {/* 7-day Sparkline */}
      {trend.length > 0 && (
        <div className="mb-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend.map((v, i) => ({ value: v, index: i }))}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={status === 'good' ? '#2CB566' : status === 'caution' ? '#E6A347' : '#D94557'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip content={() => null} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-1">
          <TrendIcon className={cn('w-3 h-3', trendColor)} />
          <span className={trendColor}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→'} 
            {trend.length >= 2 && ` ${Math.abs(((trend[trend.length - 1] - trend[0]) / trend[0]) * 100).toFixed(1)}%`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {personalBest && (
            <span className="text-text-secondary">
              vs. best: {personalBest.toLocaleString()}{unit}
            </span>
          )}
          
          {syncStatus === 'synced' && (
            <div className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced</span>
            </div>
          )}
          {syncStatus === 'syncing' && (
            <div className="flex items-center gap-1 text-warning">
              <Clock className="w-3 h-3 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="flex items-center gap-1 text-error">
              <AlertCircle className="w-3 h-3" />
              <span>Error</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
