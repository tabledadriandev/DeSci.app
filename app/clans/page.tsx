'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Users, Star, Crown, Plus } from 'lucide-react';

export default function ClansPage() {
  const { address } = useAccount();
  const [clans, setClans] = useState<any[]>([]);
  const [myClan, setMyClan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setClans([
      { id: '1', name: 'Longevity Legends', description: 'Dedicated to maximizing lifespan and healthspan.', members: 120, totalXP: 150000, rank: 1 },
      { id: '2', name: 'Bio-Hackers Elite', description: 'Pushing the boundaries of human potential.', members: 90, totalXP: 100000, rank: 2 },
      { id: '3', name: 'Crypto Wellness Guild', description: 'Blending blockchain and wellness for a healthier future.', members: 75, totalXP: 80000, rank: 3 },
    ]);
    setMyClan({ id: '4', name: 'Alpha Squad', members: 15, totalXP: 25000, rank: 10 });
    setLoading(false);
  }, [address]);

  const joinClan = async (clanId: string) => {
    if (!address) return;
    console.log(`Joining clan ${clanId}`);
    // Simulate API call
    setMyClan(clans.find(clan => clan.id === clanId)); // This is a simplistic mock
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Wellness Clans
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Join a clan, collaborate on goals, and climb the global leaderboards.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading clans..." />
          </div>
        ) : (
          <>
            {/* My Clan */}
            {myClan && (
              <motion.div className="glass-card p-6 my-8" variants={fadeInUp}>
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-accent-primary" /> My Clan: {myClan.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Members</p>
                      <p className="text-xl font-bold text-text-primary">{myClan.members || 0}</p>
                    </div>
                  </div>
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-text-secondary">Total XP</p>
                      <p className="text-xl font-bold text-text-primary">{myClan.totalXP || 0}</p>
                    </div>
                  </div>
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Crown className="w-5 h-5 text-accent-primary" />
                    <div>
                      <p className="text-sm text-text-secondary">Rank</p>
                      <p className="text-xl font-bold text-text-primary">#{myClan.rank || '-'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Available Clans */}
            <motion.div className="mt-8" variants={fadeInUp}>
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-accent-primary" /> Available Clans
              </h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {clans.map((clan) => (
                  <motion.div key={clan.id} variants={fadeInUp} className="glass-card-hover p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-2">{clan.name}</h3>
                      <p className="text-text-secondary text-sm mb-4">{clan.description}</p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-text-secondary flex items-center gap-1">
                        <Users className="w-4 h-4" /> {clan.members} members
                      </div>
                      <div className="text-sm text-text-secondary flex items-center gap-1">
                        <Star className="w-4 h-4" /> {clan.totalXP} XP
                      </div>
                    </div>
                    <AnimatedButton
                      onClick={() => joinClan(clan.id)}
                      disabled={!!myClan}
                      className="w-full"
                    >
                      {myClan ? 'Already in a Clan' : 'Join Clan'}
                    </AnimatedButton>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}

