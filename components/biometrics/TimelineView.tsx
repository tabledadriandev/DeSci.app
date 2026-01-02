'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import LineChart from '@/components/charts/LineChart';
import { Calendar, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { format } from 'date-fns';

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
  const chartData = {
    labels: dataPoints.map(dp => format(dp.date, 'MMM d')),
    datasets: [
      {
        label: metricName,
        data: dataPoints.map(dp => dp.value),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      },
      ...(dataPoints.some(dp => dp.adherence !== undefined) ? [{
        label: 'Adherence',
        data: dataPoints.map(dp => dp.adherence || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      }] : []),
    ],
  };

  return (
    <motion.div
      {...glassEntranceAnimation}
      className={cn('card bg-base-100 shadow-md', className)}
    >
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-base-content">
            <Calendar className="w-5 h-5" />
            Timeline View
          </h3>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <TrendingUp className="w-4 h-4" />
            <span>{dataPoints.length} data points</span>
          </div>
        </div>

        <div className="mb-4">
          <LineChart data={chartData} height={250} />
        </div>

        {selectedData && (
          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              <span className="font-semibold text-base-content">
                {format(selectedData.date, 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-base-content/80">
              Value: {selectedData.value}
            </p>
            {selectedData.adherence !== undefined && (
              <p className="text-base-content/80">
                Adherence: {selectedData.adherence}%
              </p>
            )}
            {selectedData.notes && (
              <p className="text-base-content/60 text-sm mt-2">
                {selectedData.notes}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 mt-4">
          {days.map((day, index) => {
            const hasData = dataPoints.some(dp => 
              dp.date.toDateString() === day.toDateString()
            );
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'aspect-square rounded text-xs p-1 transition-colors',
                  hasData 
                    ? 'bg-primary text-primary-content hover:bg-primary/80' 
                    : 'bg-base-200 text-base-content/40 hover:bg-base-300',
                  isSelected && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
