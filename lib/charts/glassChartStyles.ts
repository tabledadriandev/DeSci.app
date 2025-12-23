/**
 * Glass Chart Styles
 * Recharts styling with glass morphism backgrounds
 * Transparent grid lines, teal primary colors, gold gradients for achievements
 */

export const glassChartConfig = {
  // Grid styling
  grid: {
    stroke: 'rgba(255, 255, 255, 0.1)',
    strokeDasharray: '5 5',
  },
  
  // Axis styling
  axis: {
    stroke: 'rgba(0, 0, 0, 0.3)',
    strokeWidth: 1,
    tick: {
      fill: 'rgba(0, 0, 0, 0.5)',
      fontSize: 12,
    },
    label: {
      fill: 'rgba(0, 0, 0, 0.7)',
      fontSize: 12,
      fontWeight: 500,
    },
  },
  
  // Dark mode axis
  axisDark: {
    stroke: 'rgba(255, 255, 255, 0.3)',
    strokeWidth: 1,
    tick: {
      fill: 'rgba(255, 255, 255, 0.5)',
      fontSize: 12,
    },
    label: {
      fill: 'rgba(255, 255, 255, 0.7)',
      fontSize: 12,
      fontWeight: 500,
    },
  },
  
  // Primary colors
  colors: {
    primary: '#1A9B8E', // Teal
    success: '#2CB566', // Green
    warning: '#E6A347', // Amber
    error: '#D94557', // Red
  },
  
  // Gold gradient for achievements
  goldGradient: {
    id: 'colorGold',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      { offset: '5%', stopColor: '#D4AF37', stopOpacity: 0.8 },
      { offset: '95%', stopColor: '#D4AF37', stopOpacity: 0 },
    ],
  },
  
  // Teal gradient for primary metrics
  tealGradient: {
    id: 'colorTeal',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      { offset: '5%', stopColor: '#1A9B8E', stopOpacity: 0.8 },
      { offset: '95%', stopColor: '#1A9B8E', stopOpacity: 0 },
    ],
  },
  
  // Tooltip styling
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  
  // Dark mode tooltip
  tooltipDark: {
    backgroundColor: 'rgba(31, 33, 33, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(26, 155, 142, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    color: '#F5F3F0',
  },
  
  // Reference line styling
  referenceLine: {
    stroke: '#1A9B8E',
    strokeWidth: 2,
    strokeDasharray: '5 5',
    opacity: 0.6,
  },
  
  // Reference area (healthy range band)
  referenceArea: {
    fill: '#1A9B8E',
    fillOpacity: 0.1,
  },
};

/**
 * Chart container styles
 */
export const chartContainerStyles = {
  glass: {
    className: 'glass-card p-6 rounded-2xl',
  },
  glassPremium: {
    className: 'glass-card premium p-6 rounded-2xl',
  },
};
