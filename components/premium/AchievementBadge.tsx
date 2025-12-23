'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { metallicShineGold } from '@/lib/animations/metallicShine';

export interface AchievementBadgeProps {
  name: string;
  icon?: string; // Emoji or icon name
  tokenReward?: number;
  unlockedAt?: Date;
  className?: string;
}

export default function AchievementBadge({
  name,
  icon = '🏆',
  tokenReward = 0,
  unlockedAt,
  className,
}: AchievementBadgeProps) {
  return (
    <motion.div
      variants={metallicShineGold}
      animate="animate"
      className={cn('achievement-badge gold p-4 rounded-xl border-2 shadow-lg text-center', className)}
    >
      {/* Icon */}
      <div className="text-4xl mb-2">{icon}</div>
      
      {/* Name */}
      <p className="text-sm font-bold text-amber-950 mb-1">{name}</p>
      
      {/* Token Reward */}
      {tokenReward > 0 && (
        <p className="text-xs text-amber-900 font-medium">
          +{tokenReward} $TA
        </p>
      )}
      
      {/* Unlocked Date */}
      {unlockedAt && (
        <p className="text-xs text-amber-800 mt-1 opacity-75">
          {unlockedAt.toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}
