'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

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
  const data = history.map((entry) => ({
    ...entry,
    target: (normalRange.low + normalRange.high) / 2,
    low: normalRange.low,
    high: normalRange.high,
  }));

  const latest = history[history.length - 1];
  const change = history.length > 1 ? latest.value - history[0].value : 0;
  const trend = change > 0 ? '↑' : change < 0 ? '↓' : '→';

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-base-content">{name} Trend</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1e293b' }}
              formatter={(value: number) => `${value.toFixed(2)} ${unit}`}
            />

            {/* Normal range reference lines */}
            <ReferenceLine
              y={normalRange.high}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{ value: 'High', position: 'right' }}
            />
            <ReferenceLine
              y={normalRange.low}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{ value: 'Low', position: 'right' }}
            />

            {/* Target line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#22c55e"
              strokeDasharray="5 5"
              dot={false}
              name="Target"
              strokeWidth={2}
            />

            {/* Actual data */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', r: 5 }}
              activeDot={{ r: 7 }}
              name={name}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="text-sm text-base-content/70 mt-4 space-y-1">
          <p>
            <strong>Latest value:</strong> {latest?.value.toFixed(2)} {unit}
          </p>
          <p>
            <strong>Change:</strong> {change > 0 ? '+' : ''}
            {change.toFixed(2)} {unit} {trend}
          </p>
          <p>
            <strong>Normal range:</strong> {normalRange.low} - {normalRange.high} {unit}
          </p>
        </div>
      </div>
    </div>
  );
}

