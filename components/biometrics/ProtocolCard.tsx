'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface ProtocolCardProps {
  name: string;
  streak?: number;
  lastCompleted?: Date;
  correlatedMetrics?: Record<string, number>; // e.g., { "hrv": 8, "sleep": 12 }
  adherence?: number; // 0-100%
  className?: string;
  onEdit?: () => void;
  onLog?: () => void;
}

export default function ProtocolCard({
  name,
  streak = 0,
  lastCompleted,
  correlatedMetrics = {},
  adherence = 0,
  className,
  onEdit,
  onLog,
}: ProtocolCardProps) {
  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card p-4 rounded-2xl', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text-primary">{name}</h3>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <span>🔥</span>
            <span>{streak} days</span>
          </div>
        )}
      </div>

      {/* Last Completed */}
      {lastCompleted && (
        <div className="flex items-center gap-2 mb-3 text-xs text-text-secondary">
          <Calendar className="w-3 h-3" />
          <span>Last: {lastCompleted.toLocaleDateString()}</span>
        </div>
      )}

      {/* Correlated Metrics */}
      {Object.keys(correlatedMetrics).length > 0 && (
        <div className="mb-3 space-y-1">
          <p className="text-xs font-medium text-text-secondary mb-1">Affects:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(correlatedMetrics).map(([metric, change]) => (
              <div
                key={metric}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  change > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                )}
              >
                {metric}: {change > 0 ? '+' : ''}{change}%
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adherence Bar */}
      {adherence > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Adherence</span>
            <span className="font-medium">{Math.round(adherence)}%</span>
          </div>
          <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-success-500"
              initial={{ width: 0 }}
              animate={{ width: `${adherence}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
        {onLog && (
          <button
            onClick={onLog}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Log</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
