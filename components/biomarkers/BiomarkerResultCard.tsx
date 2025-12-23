'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BiomarkerResultCardProps {
  name: string;
  value: number;
  unit: string;
  range: {
    low: number;
    high: number;
  };
  status: 'optimal' | 'normal' | 'caution' | 'alert';
  percentile: number;
  explanation: string;
  actions: string[];
}

export function BiomarkerResultCard({
  name,
  value,
  unit,
  range,
  status,
  percentile,
  explanation,
  actions,
}: BiomarkerResultCardProps) {
  const statusConfig = {
    optimal: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      icon: CheckCircle,
      color: 'text-green-700',
      label: 'Optimal',
      percentileDescription: 'Top 25% of your age cohort',
    },
    normal: {
      bg: 'bg-slate-50',
      border: 'border-slate-300',
      icon: Info,
      color: 'text-slate-700',
      label: 'Normal',
      percentileDescription: 'Average for your age',
    },
    caution: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      label: 'Caution',
      percentileDescription: 'Slightly above average',
    },
    alert: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      icon: AlertTriangle,
      color: 'text-red-600',
      label: 'Alert',
      percentileDescription: 'Requires attention',
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  // Calculate percentage position within range
  const position = ((value - range.low) / (range.high - range.low)) * 100;
  const clampedPosition = Math.max(0, Math.min(100, position));

  return (
    <div
      className={cn(
        'rounded-lg border p-6 space-y-4',
        config.bg,
        config.border
      )}
      role="article"
      aria-label={`${name} biomarker result: ${status}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{name}</h3>
            <IconComponent className={cn('w-5 h-5', config.color)} aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-600">{config.label}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {value.toFixed(1)}
            <span className="text-sm font-normal text-slate-600 ml-1">{unit}</span>
          </div>
        </div>
      </div>

      {/* Range Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>{range.low}</span>
          <span>{range.high}</span>
        </div>
        <div
          className="relative bg-white rounded-full h-3 overflow-hidden border border-slate-300"
          role="progressbar"
          aria-valuenow={clampedPosition}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} value position: ${clampedPosition.toFixed(0)}% of range`}
        >
          {/* Normal range indicator */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 opacity-20" />

          {/* User position indicator */}
          <div
            className={cn(
              'absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 -translate-x-1/2 border-2',
              status === 'optimal'
                ? 'bg-green-500 border-green-700'
                : status === 'normal'
                ? 'bg-slate-400 border-slate-600'
                : status === 'caution'
                ? 'bg-yellow-500 border-yellow-700'
                : 'bg-red-500 border-red-700'
            )}
            style={{ left: `${clampedPosition}%` }}
            title={`${percentile}th percentile`}
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-slate-500">
          Percentile: {percentile}th ({config.percentileDescription})
        </p>
      </div>

      {/* Explanation */}
      <div className="bg-white bg-opacity-50 rounded p-3">
        <p className="text-sm text-slate-700">{explanation}</p>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="border-t border-slate-300 pt-4">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
            What To Do
          </h4>
          <ul className="space-y-2" role="list">
            {actions.map((action, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex gap-2">
                <span className="text-green-600 font-bold" aria-hidden="true">
                  •
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Quality Note */}
      <div className="bg-blue-50 rounded p-2 border border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Data Source:</strong> UK Biobank Biological Age Model (Bortz et al., 2023)
        </p>
      </div>
    </div>
  );
}

