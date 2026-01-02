/**
 * Chart.js Default Configuration
 * Centralized chart configuration for consistent styling
 */

export const chartConfig = {
  defaultColors: [
    '#a855f7', // purple
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
  ],
  darkTheme: {
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    textSecondary: '#a0a0a0',
    gridColor: '#2a2a2a',
    borderColor: '#2a2a2a',
  },
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#a0a0a0',
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
  },
};

