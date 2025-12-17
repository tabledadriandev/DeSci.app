'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { useSafeBalance } from '@/hooks/useSafeBalance';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Lock, Unlock, TrendingUp, Zap, Wallet, Clock, Shield, Coins, ArrowUpRight, Info } from 'lucide-react';

const TA_CONTRACT = '0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07' as `0x${string}`;

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const [stakedAmount, setStakedAmount] = useState(0);
  const [stakeInput, setStakeInput] = useState('');
  const [unstakeInput, setUnstakeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [lockUpStakes, setLockUpStakes] = useState<any[]>([]);
  const [lockUpAmount, setLockUpAmount] = useState('');
  const [lockUpPeriod, setLockUpPeriod] = useState<30 | 90 | 180 | 365>(30);

  const { data: balance } = useSafeBalance({
    address,
    token: TA_CONTRACT,
    chainId: 8453,
  });

  useEffect(() => {
    // New user - starts at 0
    if (isConnected && address) {
      // Mock: would fetch from ta_labs
      setStakedAmount(0);
      setLockUpStakes([]);
    } else {
      setStakedAmount(0);
      setLockUpStakes([]);
    }
    setLoading(false);
  }, [address, isConnected]);

  const handleStake = async () => {
    alert(`Staking ${stakeInput} $tabledadrian`);
  };

  const handleUnstake = async () => {
    alert(`Unstaking ${unstakeInput} $tabledadrian`);
  };

  const handleLockUp = async () => {
    alert(`Locking up ${lockUpAmount} $tabledadrian for ${lockUpPeriod} days`);
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <motion.div 
          initial="initial" 
          animate="animate" 
          variants={fadeIn} 
          className="empty-state max-w-md mx-auto"
        >
          <div className="icon-box-lg mx-auto mb-5">
            <Coins className="w-7 h-7 text-accent-primary" />
          </div>
          <h1 className="empty-state-title">Staking</h1>
          <p className="empty-state-description mb-6">
            Connect your wallet to stake $tabledadrian tokens
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </motion.div>
      </div>
    );
  }

  const availableBalance = balance ? parseFloat(balance.formatted) : 0;
  const lockUpOptions = [
    { days: 30, multiplier: 1.5, label: '30 Days', apy: '15%' },
    { days: 90, multiplier: 2.0, label: '90 Days', apy: '24%' },
    { days: 180, multiplier: 3.0, label: '180 Days', apy: '36%' },
    { days: 365, multiplier: 5.0, label: '1 Year', apy: '60%' },
  ];

  const selectedOption = lockUpOptions.find(o => o.days === lockUpPeriod);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div 
        initial="initial" 
        animate="animate" 
        variants={fadeIn}
        className="page-header"
      >
        <h1 className="page-title">Staking</h1>
        <p className="page-subtitle">
          Stake $tabledadrian for governance power and rewards
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="bg-bg-surface border border-border-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-accent-primary" />
            </div>
            <span className="text-xs text-text-tertiary">Available</span>
          </div>
          <p className="text-xl font-semibold text-text-primary">{availableBalance.toFixed(2)}</p>
          <p className="text-[10px] text-text-tertiary mt-0.5">$tabledadrian</p>
        </motion.div>

        <motion.div variants={fadeIn} className="bg-bg-surface border border-border-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent-secondary/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-accent-secondary" />
            </div>
            <span className="text-xs text-text-tertiary">Staked</span>
          </div>
          <p className="text-xl font-semibold text-text-primary">{stakedAmount.toFixed(2)}</p>
          <p className="text-[10px] text-text-tertiary mt-0.5">$tabledadrian</p>
        </motion.div>

        <motion.div variants={fadeIn} className="bg-bg-surface border border-border-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-semantic-success/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-semantic-success" />
            </div>
            <span className="text-xs text-text-tertiary">Base APY</span>
          </div>
          <p className="text-xl font-semibold text-semantic-success">12%</p>
          <p className="text-[10px] text-text-tertiary mt-0.5">Annual yield</p>
        </motion.div>
      </motion.div>

      {/* Lock-Up Section */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-bg-surface border border-border-light rounded-xl p-4 sm:p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Lock-Up Staking</h2>
            <p className="text-xs text-text-tertiary">Higher rewards with longer commitments</p>
          </div>
        </div>

        {/* Lock Period Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {lockUpOptions.map((option) => (
            <button
              key={option.days}
              onClick={() => setLockUpPeriod(option.days as 30 | 90 | 180 | 365)}
              className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                lockUpPeriod === option.days 
                  ? 'border-accent-primary bg-accent-primary/5' 
                  : 'border-border-light bg-bg-elevated/50 hover:border-border-medium'
              }`}
            >
              <p className={`text-lg font-semibold mb-0.5 ${lockUpPeriod === option.days ? 'text-accent-primary' : 'text-text-primary'}`}>
                {option.multiplier}x
              </p>
              <p className="text-[11px] text-text-secondary">{option.label}</p>
              <p className={`text-[10px] font-medium mt-1 ${lockUpPeriod === option.days ? 'text-accent-primary' : 'text-semantic-success'}`}>
                {option.apy} APY
              </p>
            </button>
          ))}
        </div>

        {/* Lock Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              value={lockUpAmount}
              onChange={(e) => setLockUpAmount(e.target.value)}
              placeholder="Amount to lock"
              className="form-input"
            />
          </div>
          <AnimatedButton
            onClick={handleLockUp}
            disabled={loading || !lockUpAmount}
            size="sm"
            className="whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            Lock for {selectedOption?.label}
          </AnimatedButton>
        </div>

        {/* Active Lock-Ups */}
        {lockUpStakes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <p className="text-xs font-medium text-text-secondary mb-2">Active Lock-Ups</p>
            <div className="space-y-2">
              {lockUpStakes.map((stake) => (
                <div key={stake.id} className="flex items-center justify-between p-3 bg-bg-elevated/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-accent-secondary/10 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-accent-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{stake.amount.toFixed(2)} $tabledadrian</p>
                      <p className="text-[10px] text-text-tertiary">
                        Unlocks {new Date(stake.lockedUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary text-xs font-medium">
                    {stake.multiplier}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockUpStakes.length === 0 && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center gap-2 text-text-tertiary">
              <Info className="w-3.5 h-3.5" />
              <p className="text-xs">No active lock-ups. Lock tokens to earn multiplied rewards.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stake / Unstake */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Stake Card */}
        <motion.div variants={fadeIn} className="bg-bg-surface border border-border-light rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-accent-primary" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Stake</h3>
          </div>
          <p className="text-xs text-text-tertiary mb-3">
            Stake tokens to earn rewards and unlock features
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              placeholder="Amount"
              className="form-input flex-1"
            />
            <AnimatedButton
              onClick={handleStake}
              disabled={loading || !stakeInput}
              size="sm"
            >
              Stake
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Unstake Card */}
        <motion.div variants={fadeIn} className="bg-bg-surface border border-border-light rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-text-tertiary/10 flex items-center justify-center">
              <Unlock className="w-3.5 h-3.5 text-text-tertiary" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Unstake</h3>
          </div>
          <p className="text-xs text-text-tertiary mb-3">
            7-day cooldown • Max: {stakedAmount.toFixed(2)}
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={unstakeInput}
              onChange={(e) => setUnstakeInput(e.target.value)}
              placeholder="Amount"
              className="form-input flex-1"
            />
            <AnimatedButton
              onClick={handleUnstake}
              disabled={loading || !unstakeInput || stakedAmount === 0}
              variant="secondary"
              size="sm"
            >
              Unstake
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>

      {/* Info Banner */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mt-4 p-3 bg-accent-primary/5 border border-accent-primary/20 rounded-xl flex items-start gap-2"
      >
        <Shield className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-text-secondary">
            <span className="font-medium text-text-primary">Secure Staking:</span> Your tokens are held in audited smart contracts on Base. Rewards are distributed automatically.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
