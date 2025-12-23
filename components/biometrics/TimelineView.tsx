'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { glassChartConfig } from '@/lib/charts/glassChartStyles';

export interface TimelineDataPoint {
  date: Date;
  value: number;
  adherence?: number; // 0-100%
  notes?: string;
}

export interface TimelineViewProps {
  experimentId: string;
  startDate: Date;
  endDate?: Date;
  dataPoints: TimelineDataPoint[];
  metricName?: string;
  className?: string;
}

export default function TimelineView({
  experimentId,
  startDate,
  endDate,
  dataPoints,
  metricName = 'Metric',
  className,
}: TimelineViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const selectedData = selectedDate 
    ? dataPoints.find(d => d.date.toDateString() === selectedDate.toDateString())
    : null;

  // Generate 30-day calendar
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  // Prepare chart data
  const chartData = dataPoints.map(dp => ({
    date: dp.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: dp.value,
    adherence: dp.adherence || 0,
  }));

  // Calculate adherence heatmap
  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return '#2CB566'; // Green
    if (adherence >= 50) return '#E6A347'; // Amber
    return '#D94557'; // Red
  };

  // Calculate improvement
  const improvement = dataPoints.length >= 2
    ? ((dataPoints[dataPoints.length - 1].value - dataPoints[0].value) / dataPoints[0].value) * 100
    : 0;

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card p-6 rounded-2xl', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">30-Day Timeline</h3>
          <p className="text-sm text-text-secondary">{metricName} Progress</p>
        </div>
        {improvement !== 0 && (
          <div className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
            improvement > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          )}>
            <TrendingUp className="w-4 h-4" />
            <span>{improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Adherence Heatmap */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-2">Adherence</p>
        <div className="grid grid-cols-30 gap-1">
          {days.map((day, idx) => {
            const dataPoint = dataPoints.find(d => d.date.toDateString() === day.toDateString());
            const adherence = dataPoint?.adherence || 0;
            return (
              <div
                key={idx}
                className={cn(
                  'aspect-square rounded cursor-pointer transition-all hover:scale-110',
                  adherence > 0 ? 'opacity-100' : 'opacity-20'
                )}
                style={{ backgroundColor: getAdherenceColor(adherence) }}
                onClick={() => setSelectedDate(day)}
                title={`${day.toLocaleDateString()}: ${adherence}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Metric Trend Line */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-text-secondary mb-2">{metricName} Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A9B8E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1A9B8E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(0, 0, 0, 0.3)"
                tick={{ fill: 'rgba(0, 0, 0, 0.5)', fontSize: 10 }}
              />
              <YAxis 
                stroke="rgba(0, 0, 0, 0.3)"
                tick={{ fill: 'rgba(0, 0, 0, 0.5)', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#1A9B8E" 
                strokeWidth={2}
                dot={{ fill: '#1A9B8E', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Selected Day Notes */}
      {selectedData && selectedData.notes && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-text-tertiary mt-0.5" />
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">
                {selectedData.date.toLocaleDateString()}
              </p>
              <p className="text-xs text-text-primary">{selectedData.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis */}
      {dataPoints.length >= 7 && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <p className="text-xs text-text-secondary">
            {improvement > 0 
              ? `You improved ${improvement.toFixed(1)}% when consistent`
              : improvement < 0
              ? `Declined ${Math.abs(improvement).toFixed(1)}% - review protocol`
              : 'Stable performance'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
