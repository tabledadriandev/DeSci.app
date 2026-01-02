'use client';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
  height?: number;
}

export default function RadarChart({ data, height = 300 }: RadarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#a0a0a0',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#ffffff',
        bodyColor: '#a0a0a0',
        borderColor: '#2a2a2a',
        borderWidth: 1,
      },
    },
    scales: {
      r: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#6b6b6b',
          backdropColor: 'transparent',
        },
        pointLabels: {
          color: '#a0a0a0',
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Radar data={data} options={options} />
    </div>
  );
}

