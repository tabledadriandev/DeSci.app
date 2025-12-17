'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import PageTransition from '@/components/ui/PageTransition';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { ShieldCheck, Zap, Gift } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function BattlePassPage() {
  const { address } = useAccount();
  const [progress, setProgress] = useState(0);
  const [tier, setTier] = useState(0);
  const [loading, setLoading] = useState(true);

  const tiers = [
    { level: 1, reward: '10 $TA', xp: 100 },
    { level: 2, reward: 'Recipe NFT', xp: 200 },
    { level: 3, reward: '25 $TA', xp: 300 },
    { level: 4, reward: 'Exclusive Badge', xp: 400 },
    { level: 5, reward: '50 $TA', xp: 500 },
    { level: 6, reward: 'VIP Access NFT', xp: 600 },
    { level: 7, reward: '100 $TA', xp: 700 },
    { level: 8, reward: 'Chef Consultation (15min)', xp: 800 },
    { level: 9, reward: '200 $TA', xp: 900 },
    { level: 10, reward: 'Legendary Achievement NFT', xp: 1000 },
  ];

  useEffect(() => {
    // Mock data for now
    setProgress(450);
    setTier(4);
    setLoading(false);
  }, [address]);

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Seasonal Battle Pass
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Complete challenges, earn XP, and unlock exclusive rewards.
          </p>
        </motion.div>

        <motion.div
          className="my-8 glass-card p-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Current Tier: {tier + 1}</h2>
              <p className="text-text-secondary">{progress} / {tiers[tier]?.xp || 1000} XP</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Next Reward</p>
              <p className="text-lg font-semibold text-accent-primary">{tiers[tier]?.reward || 'Complete!'}</p>
            </div>
          </div>
          <div className="w-full bg-bg-elevated rounded-full h-3">
            <motion.div
              className="bg-bio-gradient h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (progress / (tiers[tier]?.xp || 1000)) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {tiers.map((tierData, index) => (
            <TierItem key={tierData.level} tierData={tierData} currentTier={tier} />
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}

function TierItem({ tierData, currentTier }: { tierData: any, currentTier: number }) {
  const isUnlocked = tierData.level - 1 < currentTier;
  const isCurrent = tierData.level - 1 === currentTier;

  return (
    <motion.div
      variants={fadeInUp}
      className={`glass-card p-4 transition-all duration-300 ${isCurrent ? 'ring-2 ring-accent-primary shadow-glow' : ''} ${!isUnlocked && !isCurrent ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
              isUnlocked ? 'bg-accent-primary text-white' : 'bg-bg-elevated text-text-secondary'
            }`}
          >
            {isUnlocked ? <ShieldCheck /> : tierData.level}
          </div>
          <div>
            <p className="font-semibold text-text-primary">Tier {tierData.level}</p>
            <p className="text-sm text-text-secondary flex items-center gap-1"><Zap className="w-3 h-3" /> {tierData.xp} XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-accent-primary flex items-center gap-2"><Gift className="w-4 h-4" /> {tierData.reward}</p>
          {isUnlocked && !isCurrent && <p className="text-xs text-green-400">Claimed</p>}
          {isCurrent && <p className="text-xs text-yellow-400">In Progress</p>}
        </div>
      </div>
    </motion.div>
  );
}

