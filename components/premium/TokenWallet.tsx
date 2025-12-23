'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

export interface TokenEarning {
  source: string;
  amount: number;
}

export interface TokenWalletProps {
  balance: number;
  usdValue?: number;
  earnings?: TokenEarning[];
  staked?: number;
  apy?: number;
  rewardsEarned?: number;
  className?: string;
  onStake?: () => void;
  onWithdraw?: () => void;
}

export default function TokenWallet({
  balance,
  usdValue,
  earnings = [],
  staked = 0,
  apy = 10,
  rewardsEarned = 0,
  className,
  onStake,
  onWithdraw,
}: TokenWalletProps) {
  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className={cn('glass-card premium p-6 rounded-2xl border-2 border-amber-400/50', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-text-primary">Your Wallet</h2>
      </div>

      {/* Token Balance - Gold Gradient */}
      <div className="mb-4">
        <p className="text-4xl font-bold token-balance">
          {balance.toLocaleString()} $TA
        </p>
        {usdValue !== undefined && (
          <p className="text-sm token-value mt-1">≈ ${usdValue.toLocaleString()} USD</p>
        )}
      </div>

      {/* Earnings Breakdown */}
      {earnings.length > 0 && (
        <div className="mb-6 pt-4 border-t border-white/20">
          <p className="text-xs font-medium text-text-secondary mb-2">Earned This Month:</p>
          <div className="space-y-1">
            {earnings.map((earning, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{earning.source}:</span>
                <span className="font-mono font-semibold text-success">+{earning.amount} $TA</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staking Section */}
      {staked > 0 && (
        <div className="mb-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary">Staking</span>
            </div>
            <span className="text-sm font-mono font-bold text-primary">{staked.toLocaleString()} $TA</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">APY:</span>
            <span className="text-xs font-mono font-bold text-success">{apy}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Rewards Earned:</span>
            <span className="text-xs font-mono font-bold text-success">{rewardsEarned.toLocaleString()} $TA</span>
          </div>
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
        {onWithdraw && staked > 0 && (
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
