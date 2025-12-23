'use client';

import { motion } from 'framer-motion';
import { Lock, TrendingUp, Calendar, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface StakingCardProps {
  totalStaked: number;
  apy: number; // 8-12%
  rewardsEarned: number;
  unlockDate?: Date;
  className?: string;
  onStake?: () => void;
  onWithdraw?: () => void;
}

export default function StakingCard({
  totalStaked,
  apy,
  rewardsEarned,
  unlockDate,
  className,
  onStake,
  onWithdraw,
}: StakingCardProps) {
  const isLocked = unlockDate && unlockDate > new Date();
  const daysUntilUnlock = unlockDate 
    ? Math.ceil((unlockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card premium p-6 rounded-2xl border-2 border-amber-400/50', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {isLocked ? (
          <Lock className="w-5 h-5 text-amber-500" />
        ) : (
          <Unlock className="w-5 h-5 text-success" />
        )}
        <h2 className="text-lg font-semibold text-text-primary">Staking</h2>
      </div>

      {/* Total Staked */}
      <div className="mb-4">
        <p className="text-xs text-text-secondary mb-1">Total Staked</p>
        <p className="text-3xl font-bold token-balance">
          {totalStaked.toLocaleString()} $TA
        </p>
      </div>

      {/* APY Display - Metallic Gold */}
      <div className="mb-4 p-4 rounded-lg metallic-gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Current APY</span>
          </div>
          <span className="text-2xl font-bold font-mono">{apy}%</span>
        </div>
      </div>

      {/* Rewards Earned */}
      <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Rewards Earned</span>
          <span className="text-lg font-mono font-bold text-success">
            {rewardsEarned.toLocaleString()} $TA
          </span>
        </div>
      </div>

      {/* Unlock Progress */}
      {isLocked && unlockDate && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-text-primary">Unlock Progress</span>
          </div>
          <p className="text-xs text-text-secondary">
            {daysUntilUnlock} days until unlock
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {unlockDate.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/20">
        {onStake && (
          <button
            onClick={onStake}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-300/50 transition-all"
          >
            Stake More
          </button>
        )}
        {onWithdraw && !isLocked && (
          <button
            onClick={onWithdraw}
            className="flex-1 px-4 py-2 bg-bg-surface border border-border-light text-text-primary font-semibold rounded-lg hover:bg-bg-elevated transition-colors"
          >
            Withdraw
          </button>
        )}
      </div>
    </motion.div>
  );
}
