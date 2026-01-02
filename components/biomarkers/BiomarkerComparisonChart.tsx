'use client';

import LineChart from '@/components/charts/LineChart';
import { format } from 'date-fns';

interface BiomarkerHistory {
  date: Date;
  value: number;
  percentile: number;
}

interface BiomarkerComparisonChartProps {
  history: BiomarkerHistory[];
  biomarkerName: string;
  normalRange: { low: number; high: number };
}

export function BiomarkerComparisonChart({
  history,
  biomarkerName,
  normalRange,
}: BiomarkerComparisonChartProps) {
  const latestPercentile = history[history.length - 1]?.percentile || 0;
  const trend = history.length > 1 
    ? history[history.length - 1].value - history[0].value 
    : 0;

  const chartData = {
    labels: history.map((entry: typeof history[0]) => format(entry.date, 'MMM d')),
    datasets: [
      {
        label: 'Value',
        data: history.map((entry: typeof history[0]) => entry.value),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Target',
        data: history.map(() => (normalRange.low + normalRange.high) / 2),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-base-content">{biomarkerName} Comparison</h3>
        <div className="mb-4">
          <p className="text-base-content">
            Latest: {history[history.length - 1]?.value} ({latestPercentile}th percentile)
          </p>
          {trend !== 0 && (
            <p className={`text-sm ${trend > 0 ? 'text-success' : 'text-error'}`}>
              Trend: {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
            </p>
          )}
        </div>
        <LineChart data={chartData} height={300} />
      </div>
    </div>
  );
}
