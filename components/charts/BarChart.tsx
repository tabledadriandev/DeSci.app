'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
    }>;
  };
  title?: string;
  height?: number;
}

export default function BarChart({ data, title, height = 300 }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: data.datasets.length > 1,
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
      <Bar data={data} options={options} />
    </div>
  );
}

