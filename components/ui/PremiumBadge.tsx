'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface PremiumBadgeProps {
  icon: ReactNode;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  label?: string;
  sublabel?: string;
  earned?: boolean;
}

const tierStyles = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700/20 to-amber-900/30',
    border: 'border-amber-600/40',
    ring: 'ring-amber-500/20',
    icon: 'text-amber-600',
    glow: 'shadow-amber-500/10',
  },
  silver: {
    bg: 'bg-gradient-to-br from-slate-300/20 to-slate-500/30',
    border: 'border-slate-400/40',
    ring: 'ring-slate-400/20',
    icon: 'text-slate-400',
    glow: 'shadow-slate-400/10',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400/20 to-amber-500/30',
    border: 'border-yellow-500/40',
    ring: 'ring-yellow-400/30',
    icon: 'text-yellow-500',
    glow: 'shadow-yellow-500/20',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-cyan-200/20 to-slate-300/30',
    border: 'border-cyan-300/40',
    ring: 'ring-cyan-300/30',
    icon: 'text-cyan-400',
    glow: 'shadow-cyan-400/20',
  },
  diamond: {
    bg: 'bg-gradient-to-br from-violet-300/20 to-fuchsia-400/30',
    border: 'border-violet-400/50',
    ring: 'ring-violet-400/30',
    icon: 'text-violet-400',
    glow: 'shadow-violet-500/30',
  },
};

const sizeStyles = {
  sm: { container: 'w-10 h-10', icon: 'w-4 h-4', ring: 'ring-2' },
  md: { container: 'w-14 h-14', icon: 'w-6 h-6', ring: 'ring-2' },
  lg: { container: 'w-20 h-20', icon: 'w-8 h-8', ring: 'ring-[3px]' },
  xl: { container: 'w-28 h-28', icon: 'w-12 h-12', ring: 'ring-4' },
};

export default function PremiumBadge({
  icon,
  tier = 'silver',
  size = 'md',
  animated = true,
  className,
  label,
  sublabel,
  earned = true,
}: PremiumBadgeProps) {
  const tierStyle = tierStyles[tier];
  const sizeStyle = sizeStyles[size];

  const content = (
    <div
      className={cn(
        'relative rounded-2xl flex items-center justify-center',
        'border backdrop-blur-sm',
        'transition-all duration-500',
        sizeStyle.container,
        sizeStyle.ring,
        tierStyle.bg,
        tierStyle.border,
        tierStyle.ring,
        earned ? 'opacity-100' : 'opacity-40 grayscale',
        animated && earned && 'hover:scale-110 hover:shadow-xl',
        tierStyle.glow,
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/5 to-transparent" />
      
      {/* Icon */}
      <div className={cn(sizeStyle.icon, tierStyle.icon, 'relative z-10')}>
        {icon}
      </div>

      {/* Shine effect for earned badges */}
      {earned && animated && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        </div>
      )}
    </div>
  );

  if (!label) {
    return animated ? (
      <motion.div
        whileHover={earned ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {content}
      </motion.div>
    ) : (
      content
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {animated ? (
        <motion.div
          whileHover={earned ? { y: -4 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {content}
        </motion.div>
      ) : (
        content
      )}
      <div className="text-center">
        <p className={cn(
          'font-semibold text-sm',
          earned ? 'text-text-primary' : 'text-text-disabled'
        )}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-text-tertiary mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

// Premium icon wrapper for consistent styling
interface PremiumIconProps {
  icon: ReactNode;
  color?: 'teal' | 'violet' | 'rose' | 'amber' | 'sky' | 'emerald' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconColors = {
  teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const iconSizes = {
  sm: 'w-8 h-8 p-1.5',
  md: 'w-11 h-11 p-2.5',
  lg: 'w-14 h-14 p-3',
};

export function PremiumIcon({
  icon,
  color = 'teal',
  size = 'md',
  className,
}: PremiumIconProps) {
  return (
    <div
      className={cn(
        'rounded-xl border flex items-center justify-center',
        'backdrop-blur-sm transition-all duration-300',
        iconColors[color],
        iconSizes[size],
        className
      )}
    >
      {icon}
    </div>
  );
}

// Animated stat badge for dashboard
interface StatBadgeProps {
  value: string | number;
  label: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatBadge({
  value,
  label,
  icon,
  trend,
  trendValue,
}: StatBadgeProps) {
  return (
    <motion.div
      className="glass-card p-5 group hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className="flex items-start justify-between mb-3">
        <PremiumIcon icon={icon} size="sm" color="teal" />
        {trend && trendValue && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend === 'up' && 'text-emerald-500 bg-emerald-500/10',
            trend === 'down' && 'text-rose-500 bg-rose-500/10',
            trend === 'neutral' && 'text-slate-400 bg-slate-500/10'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      <div className="text-3xl font-semibold text-text-primary mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
        {label}
      </div>
    </motion.div>
  );
}

