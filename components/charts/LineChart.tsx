'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number;
      fill?: boolean;
      pointRadius?: number;
      pointHoverRadius?: number;
      pointBackgroundColor?: string;
      pointBorderColor?: string;
      pointBorderWidth?: number;
      pointHoverBackgroundColor?: string;
      pointHoverBorderColor?: string;
      pointHoverBorderWidth?: number;
      borderDash?: number[];
      [key: string]: unknown;
    }>;
  };
  title?: string;
  height?: number;
}

export default function LineChart({ data, title, height = 300 }: LineChartProps) {
  const chartData = useMemo(() => ({
    labels: data.labels,
    datasets: data.datasets.map((dataset: typeof data.datasets[0], index: number) => ({
      ...dataset,
      borderColor: dataset.borderColor || `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: dataset.backgroundColor || `hsla(${index * 60}, 70%, 50%, 0.1)`,
      tension: dataset.tension ?? 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
    })),
  }), [data]);

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
      title: title
        ? {
            display: true,
            text: title,
            color: '#ffffff',
            font: {
              size: 16,
              weight: 'bold' as const,
            },
          }
        : undefined,
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#ffffff',
        bodyColor: '#a0a0a0',
        borderColor: '#2a2a2a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#6b6b6b',
        },
      },
      y: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#6b6b6b',
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

