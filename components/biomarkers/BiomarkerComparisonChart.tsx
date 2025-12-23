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

// Date formatting utility (date-fns alternative)
function formatDate(date: Date, formatStr: string): string {
  const d = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (formatStr === 'MMM d') {
    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
  }
  return d.toLocaleDateString();
}

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
  const data = history.map((entry) => ({
    date: formatDate(entry.date, 'MMM d'),
    value: entry.value,
    percentile: entry.percentile,
    target: (normalRange.low + normalRange.high) / 2,
  }));

  const trend = calculateTrend(history);
  const trendIcon = getTrendIcon(history);
  const latestPercentile = data[data.length - 1]?.percentile || 0;

  return (
    <figure className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 mb-2">{biomarkerName} Trend</h3>
        <p className="text-sm text-slate-600">
          Normal range: {normalRange.low}−{normalRange.high}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          role="img"
          aria-label={`${biomarkerName} trend chart showing values over time`}
        >
          <defs>
            <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#1e293b' }}
            formatter={(value: number) => `${value.toFixed(2)}`}
          />

          {/* Normal Range Band */}
          <Line
            type="monotone"
            dataKey="target"
            stroke="#22c55e"
            strokeDasharray="5 5"
            dot={false}
            name="Target"
            isAnimationActive={false}
          />

          {/* User's Value */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ fill: '#0ea5e9', r: 5 }}
            activeDot={{ r: 7 }}
            name={biomarkerName}
            fill="url(#valueGradient)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">Trend Analysis</h4>
        <ul className="text-sm text-blue-800 space-y-1" role="list">
          <li>• Latest value: {data[data.length - 1]?.value.toFixed(2)}</li>
          <li>
            • 3-month trend: {trend} {trendIcon}
          </li>
          <li>• Percentile rank: {latestPercentile}th (among your cohort)</li>
        </ul>
      </div>

      {/* Fallback data table for accessibility */}
      <figcaption>
        <details className="text-sm text-slate-600">
          <summary className="cursor-pointer font-semibold hover:text-slate-900">
            View as table
          </summary>
          <table
            role="table"
            className="mt-4 w-full border-collapse border border-slate-300"
            aria-label={`${biomarkerName} data table`}
          >
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-2 text-left">Date</th>
                <th className="border border-slate-300 px-4 py-2 text-left">Value</th>
                <th className="border border-slate-300 px-4 py-2 text-left">Percentile</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-300 px-4 py-2">{entry.date}</td>
                  <td className="border border-slate-300 px-4 py-2">
                    {entry.value.toFixed(2)}
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    {entry.percentile}th
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figcaption>
    </figure>
  );
}

function calculateTrend(history: BiomarkerHistory[]): string {
  if (history.length < 2) return 'Insufficient data';

  const recent = history.slice(-3);
  if (recent.length < 2) return 'Insufficient data';

  const oldest = recent[0].value;
  const newest = recent[recent.length - 1].value;
  const change = newest - oldest;

  return change > 0 ? `+${change.toFixed(2)}` : `${change.toFixed(2)}`;
}

function getTrendIcon(history: BiomarkerHistory[]): string {
  if (history.length < 2) return '';
  const change =
    history[history.length - 1].value - history[history.length - 2].value;
  return change > 0 ? '↑' : change < 0 ? '↓' : '→';
}

