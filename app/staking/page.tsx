'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { Lock, Unlock, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';

const TA_CONTRACT = '0xee47670a6ed7501aeeb9733efd0bf7d93ed3cb07' as `0x${string}`;

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const [stakedAmount, setStakedAmount] = useState(0);
  const [stakeInput, setStakeInput] = useState('');
  const [unstakeInput, setUnstakeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockUpStakes, setLockUpStakes] = useState<any[]>([]);
  const [lockUpAmount, setLockUpAmount] = useState('');
  const [lockUpPeriod, setLockUpPeriod] = useState<30 | 90 | 180 | 365>(30);

  const { data: balance } = useBalance({
    address,
    token: TA_CONTRACT,
    chainId: 8453,
  });

  useEffect(() => {
    if (address) {
      loadStakingInfo();
    }
  }, [address]);

  const loadStakingInfo = async () => {
    try {
      const [stakingRes, lockUpRes] = await Promise.all([
        fetch(`/api/staking?address=${address}`),
        fetch(`/api/staking/lock-up?address=${address}`),
      ]);
      const stakingData = await stakingRes.json();
      const lockUpData = await lockUpRes.json();
      setStakedAmount(stakingData.stakedAmount || 0);
      setLockUpStakes(lockUpData.activeStakes || []);
    } catch (error) {
      console.error('Error loading staking info:', error);
    }
  };

  const handleStake = async () => {
    if (!address || !stakeInput || parseFloat(stakeInput) <= 0) return;
    setLoading(true);
    try {
      const response = await fetch('/api/staking/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: parseFloat(stakeInput) }),
      });
      if (response.ok) {
        setStakeInput('');
        await loadStakingInfo();
      }
    } catch (error) {
      console.error('Error staking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!address || !unstakeInput || parseFloat(unstakeInput) <= 0) return;
    setLoading(true);
    try {
      const response = await fetch('/api/staking/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: parseFloat(unstakeInput) }),
      });
      if (response.ok) {
        setUnstakeInput('');
        await loadStakingInfo();
      }
    } catch (error) {
      console.error('Error unstaking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockUp = async () => {
    if (!address || !lockUpAmount || parseFloat(lockUpAmount) <= 0) return;
    setLoading(true);
    try {
      const response = await fetch('/api/staking/lock-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          amount: parseFloat(lockUpAmount),
          lockUpPeriod,
        }),
      });
      if (response.ok) {
        setLockUpAmount('');
        await loadStakingInfo();
      }
    } catch (error) {
      console.error('Error locking up:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <PageTransition>
        <div className="min-h-screen  flex items-center justify-center p-4">
          <AnimatedCard className="max-w-md w-full text-center">
            <Lock className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold gradient-text mb-4">Staking</h1>
            <p className="text-text-secondary mb-8">
              Connect your wallet to stake $tabledadrian tokens
            </p>
            <ConnectButton />
          </AnimatedCard>
        </div>
      </PageTransition>
    );
  }

  const availableBalance = balance ? parseFloat(balance.formatted) : 0;
  const lockUpOptions = [
    { days: 30, multiplier: 1.5, label: '30 Days', color: 'from-blue-500 to-cyan-500' },
    { days: 90, multiplier: 2.0, label: '90 Days', color: 'from-purple-500 to-indigo-500' },
    { days: 180, multiplier: 3.0, label: '180 Days', color: 'from-pink-500 to-rose-500' },
    { days: 365, multiplier: 5.0, label: '365 Days', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              Staking & Lock-Up
            </h1>
            <p className="text-text-secondary text-lg">
              Stake your $tabledadrian tokens and lock them up for increased governance voting power
            </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
            <motion.div variants={staggerItem}>
              <AnimatedCard hover>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent-primary" />
                  <div className="text-sm text-text-secondary">Available Balance</div>
                </div>
                <div className="text-3xl font-bold text-text-primary">
                  {availableBalance.toFixed(2)} $tabledadrian
                </div>
              </AnimatedCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <AnimatedCard hover>
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-accent-primary" />
                  <div className="text-sm text-text-secondary">Staked Amount</div>
                </div>
                <div className="text-3xl font-bold text-accent-primary">
                  {stakedAmount.toFixed(2)} $tabledadrian
                </div>
              </AnimatedCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <AnimatedCard hover>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-semantic-success" />
                  <div className="text-sm text-text-secondary">APY</div>
                </div>
                <div className="text-3xl font-bold text-semantic-success">
                  12% APY
                </div>
              </AnimatedCard>
            </motion.div>
            </motion.div>
          </div>

          {/* Lock-Up Staking */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
            <AnimatedCard className="bg-gradient-to-br from-accent-primary/10 to-accent-teal/10 border-2 border-accent-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-accent-primary" />
                <h2 className="text-2xl font-bold text-text-primary">
                  Lock-Up Staking (Governance Multipliers)
                </h2>
              </div>
              <p className="text-text-secondary mb-6">
                Lock your tokens to increase your voting power in DAO governance
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {lockUpOptions.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setLockUpPeriod(option.days as 30 | 90 | 180 | 365)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      lockUpPeriod === option.days
                        ? 'border-accent-primary bg-accent-primary/10 scale-105'
                        : 'border-gray-200 hover:border-accent-primary/50'
                    }`}
                  >
                    <div className={`text-2xl font-bold mb-1 bg-gradient-to-br ${option.color} bg-clip-text text-transparent`}>
                      {option.multiplier}x
                    </div>
                    <div className="text-sm text-text-secondary">{option.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mb-4">
                <input
                  type="number"
                  value={lockUpAmount}
                  onChange={(e) => setLockUpAmount(e.target.value)}
                  placeholder="Amount to lock"
                  className="input-premium flex-1"
                />
                <AnimatedButton
                  onClick={handleLockUp}
                  disabled={loading || !lockUpAmount}
                  variant="primary"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock {lockUpPeriod} Days
                </AnimatedButton>
              </div>

              {lockUpStakes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">Active Lock-Ups</h3>
                  <div className="space-y-2">
                    {lockUpStakes.map((stake) => (
                      <div
                        key={stake.id}
                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div>
                          <div className="font-semibold">{stake.amount.toFixed(2)} $tabledadrian</div>
                          <div className="text-xs text-text-secondary">
                            {stake.multiplier}x multiplier • Unlocks {new Date(stake.lockedUntil).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-semantic-success">
                          {stake.multiplier}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AnimatedCard>
            </motion.div>
          </div>

          {/* Regular Staking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
            >
            <motion.div variants={staggerItem}>
              <AnimatedCard hover>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-accent-primary" />
                  <h2 className="text-2xl font-bold text-text-primary">Stake $tabledadrian</h2>
                </div>
                <p className="text-text-secondary mb-4">
                  Stake your $tabledadrian tokens to unlock premium features and earn rewards
                </p>
                <div className="flex gap-4 mb-4">
                  <input
                    type="number"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    placeholder="Amount to stake"
                    className="input-premium flex-1"
                  />
                  <AnimatedButton
                    onClick={handleStake}
                    disabled={loading || !stakeInput}
                    variant="primary"
                  >
                    Stake
                  </AnimatedButton>
                </div>
                <div className="text-sm text-text-secondary">
                  Benefits: Premium meal plans, AI coach access, exclusive challenges, governance voting
                </div>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AnimatedCard hover>
                <div className="flex items-center gap-3 mb-4">
                  <Unlock className="w-6 h-6 text-accent-primary" />
                  <h2 className="text-2xl font-bold text-text-primary">Unstake $tabledadrian</h2>
                </div>
                <p className="text-text-secondary mb-4">
                  Unstake your tokens (7-day cooldown period applies)
                </p>
                <div className="flex gap-4 mb-4">
                  <input
                    type="number"
                    value={unstakeInput}
                    onChange={(e) => setUnstakeInput(e.target.value)}
                    placeholder="Amount to unstake"
                    className="input-premium flex-1"
                  />
                  <AnimatedButton
                    onClick={handleUnstake}
                    disabled={loading || !unstakeInput || stakedAmount === 0}
                    variant="secondary"
                  >
                    Unstake
                  </AnimatedButton>
                </div>
                <div className="text-sm text-text-secondary">
                  Maximum unstake: {stakedAmount.toFixed(2)} $tabledadrian
                </div>
              </AnimatedCard>
            </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
