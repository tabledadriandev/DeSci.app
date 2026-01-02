'use client';

import LineChart from '@/components/charts/LineChart';

interface BiomarkerHistoryPoint {
  date: string;
  value: number;
}

interface BiomarkerChartProps {
  name: string;
  unit: string;
  history: BiomarkerHistoryPoint[];
  normalRange: { low: number; high: number };
}

export function BiomarkerChart({ name, unit, history, normalRange }: BiomarkerChartProps) {
  const latest = history[history.length - 1];
  const change = history.length > 1 ? latest.value - history[0].value : 0;
  const trend = change > 0 ? '↑' : change < 0 ? '↓' : '→';

  const chartData = {
    labels: history.map((entry: typeof history[0]) => entry.date),
    datasets: [
      {
        label: `${name} (${unit})`,
        data: history.map((entry: typeof history[0]) => entry.value),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#ec4899',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
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
    {
      label: 'Low Range',
      data: history.map(() => normalRange.low),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderDash: [3, 3],
      pointRadius: 0,
      fill: false,
    },
    {
      label: 'High Range',
      data: history.map(() => normalRange.high),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderDash: [3, 3],
      pointRadius: 0,
      fill: false,
    },
  ],
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-base-content">{name} Trend</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-base-content">{latest.value} {unit}</span>
          <span className="text-lg">{trend}</span>
          {change !== 0 && (
            <span className={`text-sm ${change > 0 ? 'text-success' : 'text-error'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
            </span>
          )}
        </div>
        <LineChart data={chartData} height={300} />
      </div>
    </div>
  );
}
