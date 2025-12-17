'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { Trophy, Award, Flame, Star, Target, Sparkles, Crown, Gem, Medal } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { staggerContainer, fadeInUp } from '@/lib/animations/variants';

type Achievement = {
  id: string;
  type: string;
  name: string;
  description: string;
  icon?: string | null;
  earnedAt: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
};

const TYPE_CONFIG: Record<string, { icon: React.ReactElement; tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' }> = {
  streak: { icon: <Flame className="w-full h-full" />, tier: 'gold' },
  level: { icon: <Star className="w-full h-full" />, tier: 'silver' },
  challenge: { icon: <Trophy className="w-full h-full" />, tier: 'platinum' },
  milestone: { icon: <Award className="w-full h-full" />, tier: 'gold' },
  rare: { icon: <Gem className="w-full h-full" />, tier: 'diamond' },
  elite: { icon: <Crown className="w-full h-full" />, tier: 'platinum' },
};

export default function AchievementsPage() {
  const { address } = useAccount();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const sampleBadges: Achievement[] = [
    { id: 'sample-1', type: 'streak', name: '7-Day Consistency', description: 'Completed daily health goals for 7 consecutive days.', icon: null, earnedAt: new Date().toISOString(), tier: 'bronze' },
    { id: 'sample-2', type: 'challenge', name: 'First Challenge Complete', description: 'Successfully finished your first community challenge.', icon: null, earnedAt: new Date().toISOString(), tier: 'silver' },
    { id: 'sample-3', type: 'level', name: 'Level 5 Pioneer', description: 'Achieved level 5 through consistent engagement.', icon: null, earnedAt: new Date().toISOString(), tier: 'silver' },
    { id: 'sample-4', type: 'milestone', name: 'Longevity Initiate', description: 'Completed your first comprehensive health assessment.', icon: null, earnedAt: new Date().toISOString(), tier: 'gold' },
    { id: 'sample-5', type: 'streak', name: '30-Day Dedication', description: 'Maintained an unbroken 30-day health tracking streak.', icon: null, earnedAt: new Date().toISOString(), tier: 'gold' },
    { id: 'sample-6', type: 'elite', name: 'Elite Researcher', description: 'Contributed to 10+ DeSci research initiatives.', icon: null, earnedAt: new Date().toISOString(), tier: 'platinum' },
    { id: 'sample-7', type: 'rare', name: 'Diamond Protocol', description: 'Achieved optimal scores across all health categories.', icon: null, earnedAt: new Date().toISOString(), tier: 'diamond' },
    { id: 'sample-8', type: 'level', name: 'Level 10 Veteran', description: 'Reached the prestigious level 10 milestone.', icon: null, earnedAt: new Date().toISOString(), tier: 'gold' },
  ];

  useEffect(() => {
    if (!address) {
      setAchievements(sampleBadges);
      return;
    }
    loadAchievements();
  }, [address]);

  const loadAchievements = async () => {
    if (!address) return;
    setLoading(true);
    setAchievements(sampleBadges);
    setLoading(false);
  };

  const getConfig = (type: string) => {
    return TYPE_CONFIG[type] ?? { icon: <Medal className="w-full h-full" />, tier: 'bronze' as const };
  };

  // Group achievements by tier
  const tierOrder = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
  const groupedAchievements = achievements.reduce((acc, ach) => {
    const tier = ach.tier || getConfig(ach.type).tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const tierLabels: Record<string, string> = {
    diamond: 'Legendary',
    platinum: 'Elite',
    gold: 'Distinguished',
    silver: 'Notable',
    bronze: 'Foundation',
  };

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="page-header"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="icon-box-lg icon-box-warning">
              <Sparkles className="w-5 h-5 text-semantic-warning" />
            </div>
            <h1 className="page-title">Achievements</h1>
          </div>
          <p className="page-subtitle max-w-2xl">
            Your collection of earned distinctions and milestones on your longevity journey
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-text-primary">{achievements.length}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Total Earned</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-violet-400">{groupedAchievements['diamond']?.length || 0}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Legendary</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{groupedAchievements['platinum']?.length || 0}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Elite</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{groupedAchievements['gold']?.length || 0}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Distinguished</p>
          </div>
        </motion.div>

        {!address && (
          <motion.div 
            className="mb-8 glass-card p-5 border-l-4 border-l-accent-primary"
            variants={fadeInUp}
          >
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Connect your wallet</span> to start earning real achievements and track your progress on the blockchain.
            </p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner text="Loading your achievements..." />
          </div>
        ) : (
          <div className="space-y-10">
            {tierOrder.map((tier) => {
              const tierAchievements = groupedAchievements[tier];
              if (!tierAchievements?.length) return null;

              return (
                <motion.div
                  key={tier}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {tierLabels[tier]}
                    </h2>
                    <div className="flex-1 h-px bg-border-light" />
                    <span className="text-sm text-text-tertiary">{tierAchievements.length} earned</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {tierAchievements.map((ach) => {
                      const config = getConfig(ach.type);
                      return (
                        <motion.div
                          key={ach.id}
                          className="glass-card p-6 flex flex-col items-center text-center group"
                          whileHover={{ y: -4 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <PremiumBadge
                            icon={config.icon}
                            tier={ach.tier || config.tier}
                            size="lg"
                            className="mb-4"
                          />
                          <h3 className="text-base font-semibold text-text-primary mb-1">
                            {ach.name}
                          </h3>
                          <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3">
                            {ach.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-text-secondary flex-1 leading-relaxed">
                            {ach.description}
                          </p>
                          <p className="text-xs text-text-disabled mt-4 pt-4 border-t border-border-light w-full">
                            Earned {new Date(ach.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}


