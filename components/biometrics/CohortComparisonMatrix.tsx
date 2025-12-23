'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface MetricComparison {
  metric: string;
  userValue: number;
  range: { min: number; max: number };
  cohortAverage: number;
  percentile: number; // 0-100
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
}

export interface CohortComparisonMatrixProps {
  metrics: MetricComparison[];
  className?: string;
}

export default function CohortComparisonMatrix({
  metrics,
  className,
}: CohortComparisonMatrixProps) {
  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'text-success';
    if (percentile >= 50) return 'text-primary';
    if (percentile >= 25) return 'text-warning';
    return 'text-error';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return 'Excellent';
    if (percentile >= 75) return 'Good';
    if (percentile >= 50) return 'Average';
    if (percentile >= 25) return 'Below Average';
    return 'Poor';
  };

  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-error" />;
    return <Minus className="w-3 h-3 text-text-tertiary" />;
  };

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card p-6 rounded-2xl overflow-x-auto', className)}
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4">Cohort Comparison</h3>
      
      <div className="min-w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Metric
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Your Value
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Range
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Cohort Avg
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Your Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, idx) => (
              <motion.tr
                key={metric.metric}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-border-light hover:bg-bg-elevated/50 transition-colors"
              >
                <td className="py-3 px-3">
                  <span className="text-sm font-medium text-text-primary">{metric.metric}</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-sm font-bold text-primary-500">
                      {metric.userValue.toLocaleString()}
                      {metric.unit && <span className="text-xs text-text-secondary ml-1">{metric.unit}</span>}
                    </span>
                    <TrendIcon trend={metric.trend} />
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs text-text-secondary font-mono">
                    {metric.range.min.toLocaleString()}-{metric.range.max.toLocaleString()}
                    {metric.unit && <span className="ml-1">{metric.unit}</span>}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs text-text-secondary font-mono">
                    {metric.cohortAverage.toLocaleString()}
                    {metric.unit && <span className="ml-1">{metric.unit}</span>}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn('text-xs font-semibold', getPercentileColor(metric.percentile))}>
                      {metric.percentile}th %ile
                    </span>
                    <span className={cn('text-xs text-text-tertiary', getPercentileColor(metric.percentile))}>
                      ({getPercentileLabel(metric.percentile)})
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border-light">
        <p className="text-xs text-text-tertiary">
          Comparison based on anonymized peer data. Your identity is never revealed.
        </p>
      </div>
    </motion.div>
  );
}
