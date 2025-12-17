'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Refined color palette for charts - soft, professional tones
const CHART_COLORS = {
  primary: '#2dd4bf',    // Teal
  secondary: '#a78bfa',  // Violet
  tertiary: '#f9a8d4',   // Rose
  quaternary: '#fbbf24', // Amber
  success: '#34d399',    // Emerald
  warning: '#fb923c',    // Orange
  info: '#60a5fa',       // Sky
  muted: '#94a3b8',      // Slate
};

const SOFT_PALETTE = [
  '#2dd4bf', '#a78bfa', '#f9a8d4', '#fbbf24', 
  '#34d399', '#60a5fa', '#fb923c', '#94a3b8'
];

// Custom tooltip with premium styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-bg-surface/95 backdrop-blur-md border border-border-light rounded-xl p-4 shadow-xl">
      <p className="text-xs text-text-tertiary mb-2 font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-text-secondary">{entry.name}:</span>
          <span className="text-sm font-semibold text-text-primary">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Premium Area Chart
interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

interface PremiumAreaChartProps {
  data: AreaChartData[];
  dataKeys: { key: string; color?: string; name?: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  gradient?: boolean;
}

export function PremiumAreaChart({
  data,
  dataKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  gradient = true,
}: PremiumAreaChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {dataKeys.map((dk, i) => (
              <linearGradient key={dk.key} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dk.color || SOFT_PALETTE[i]} stopOpacity={0.4} />
                <stop offset="100%" stopColor={dk.color || SOFT_PALETTE[i]} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
          )}
          {dataKeys.map((dk, i) => (
            <Area
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.name || dk.key}
              stroke={dk.color || SOFT_PALETTE[i]}
              strokeWidth={2}
              fill={gradient ? `url(#gradient-${dk.key})` : dk.color || SOFT_PALETTE[i]}
              fillOpacity={gradient ? 1 : 0.2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// Premium Line Chart
interface PremiumLineChartProps {
  data: AreaChartData[];
  dataKeys: { key: string; color?: string; name?: string; dashed?: boolean }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showDots?: boolean;
}

export function PremiumLineChart({
  data,
  dataKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  showDots = true,
}: PremiumLineChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
          )}
          {dataKeys.map((dk, i) => (
            <Line
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.name || dk.key}
              stroke={dk.color || SOFT_PALETTE[i]}
              strokeWidth={2.5}
              strokeDasharray={dk.dashed ? '5 5' : undefined}
              dot={showDots ? { fill: dk.color || SOFT_PALETTE[i], strokeWidth: 0, r: 4 } : false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// Premium Bar Chart
interface PremiumBarChartProps {
  data: AreaChartData[];
  dataKeys: { key: string; color?: string; name?: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
}

export function PremiumBarChart({
  data,
  dataKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
  stacked = false,
}: PremiumBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          )}
          <XAxis
            dataKey={layout === 'vertical' ? undefined : 'name'}
            type={layout === 'vertical' ? 'number' : 'category'}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
          />
          <YAxis
            dataKey={layout === 'vertical' ? 'name' : undefined}
            type={layout === 'vertical' ? 'category' : 'number'}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            width={layout === 'vertical' ? 80 : 40}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
          )}
          {dataKeys.map((dk, i) => (
            <Bar
              key={dk.key}
              dataKey={dk.key}
              name={dk.name || dk.key}
              fill={dk.color || SOFT_PALETTE[i]}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// Premium Donut/Pie Chart
interface PremiumDonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

export function PremiumDonutChart({
  data,
  height = 280,
  innerRadius = 55,
  showLegend = true,
  centerLabel,
  centerValue,
}: PremiumDonutChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Chart container with centered label - always centered responsively */}
      <div className="relative w-full max-w-[280px] mx-auto" style={{ aspectRatio: '1 / 1' }}>
        <div className="relative w-full h-full grid place-items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="85%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color || SOFT_PALETTE[index % SOFT_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {(centerLabel || centerValue) && (
            <div 
              className="absolute flex flex-col items-center justify-center pointer-events-none"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {centerValue && (
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-none">{centerValue}</span>
              )}
              {centerLabel && (
                <span className="text-xs sm:text-sm text-text-tertiary mt-1">{centerLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend - horizontal on mobile, wraps nicely */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: entry.color || SOFT_PALETTE[index % SOFT_PALETTE.length] }}
              />
              <span className="text-xs sm:text-sm text-text-secondary whitespace-nowrap">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Premium Radial Progress Chart
interface RadialProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  unit?: string;
}

export function RadialProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 12,
  color = CHART_COLORS.primary,
  label,
  showValue = true,
  unit = '',
}: RadialProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const data = [{ value: percentage, fill: color }];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={strokeWidth}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: 'var(--bg-elevated)' }}
            dataKey="value"
            cornerRadius={strokeWidth / 2}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className="text-2xl font-bold text-text-primary">
            {Math.round(value)}{unit}
          </span>
        )}
        {label && (
          <span className="text-xs text-text-tertiary mt-0.5">{label}</span>
        )}
      </div>
    </motion.div>
  );
}

// Stat Card with Sparkline
interface SparklineStatProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  data: number[];
  color?: string;
}

export function SparklineStat({
  title,
  value,
  unit,
  trend,
  data,
  color = CHART_COLORS.primary,
}: SparklineStatProps) {
  const chartData = data.map((v, i) => ({ value: v, index: i }));
  
  return (
    <motion.div
      className="glass-card p-5 group"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-text-tertiary uppercase tracking-wider font-medium mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-text-primary">{value}</span>
            {unit && <span className="text-sm text-text-secondary">{unit}</span>}
          </div>
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            trend > 0 && 'text-emerald-500 bg-emerald-500/10',
            trend < 0 && 'text-rose-500 bg-rose-500/10',
            trend === 0 && 'text-slate-400 bg-slate-500/10'
          )}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : 
             trend < 0 ? <TrendingDown className="w-3 h-3" /> : 
             <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="h-12 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`sparkline-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#sparkline-${title})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Premium Metric Card
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'optimal' | 'warning' | 'alert' | 'neutral';
  onClick?: () => void;
}

const statusColors = {
  optimal: 'border-l-emerald-400 bg-emerald-500/5',
  warning: 'border-l-amber-400 bg-amber-500/5',
  alert: 'border-l-rose-400 bg-rose-500/5',
  neutral: 'border-l-slate-400 bg-slate-500/5',
};

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  status = 'neutral',
  onClick,
}: MetricCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card p-5 border-l-4 cursor-pointer group',
        statusColors[status]
      )}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-bg-elevated group-hover:bg-bg-surface transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-tertiary uppercase tracking-wider font-medium mb-1">
            {title}
          </p>
          <p className="text-xl font-bold text-text-primary truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

