'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Trophy, CheckCircle, Clock } from 'lucide-react';

export default function ChallengesPage() {
  const { address } = useAccount();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setChallenges([
      { id: '1', name: '7-Day Hydration Challenge', description: 'Drink 8 glasses of water daily for 7 days.', type: 'daily', rewards: '10 $TA', startDate: new Date().toISOString() },
      { id: '2', name: 'Mindfulness Marathon', description: 'Meditate for 10 minutes every day for 30 days.', type: 'monthly', rewards: 'Exclusive NFT', startDate: new Date().toISOString() },
      { id: '3', name: 'Sleep Optimization', description: 'Maintain 7-9 hours of sleep for 14 days.', type: 'weekly', rewards: '25 $TA', startDate: new Date().toISOString() },
    ]);
    setUserProgress({
      '1': { progress: 70, completed: false, joined: true },
      '2': { progress: 0, completed: false, joined: false },
      '3': { progress: 100, completed: true, joined: true },
    });
    setLoading(false);
  }, [address]);

  const joinChallenge = async (challengeId: string) => {
    if (!address) return;
    console.log(`Joining challenge ${challengeId}`);
    // Simulate API call
    setUserProgress(prev => ({ ...prev, [challengeId]: { progress: 0, completed: false, joined: true } }));
  };

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <h1 className="page-title">Wellness Challenges</h1>
          <p className="page-subtitle max-w-2xl">
            Push your limits, earn rewards, and connect with a thriving community.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading challenges..." />
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8" variants={staggerContainer} initial="hidden" animate="visible">
            {challenges.map((challenge) => {
              const progress = userProgress[challenge.id];
              const isJoined = !!progress?.joined;
              const isCompleted = progress?.completed;

              return (
                <motion.div key={challenge.id} variants={fadeInUp} className="glass-card-hover p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-2">
                        {challenge.name}
                      </h3>
                      <p className="text-text-secondary text-sm">{challenge.description}</p>
                    </div>
                    {isCompleted && (
                      <span className="px-3 py-1 bg-semantic-success/10 text-semantic-success rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-text-secondary mb-1">
                      <span>Progress</span>
                      <span>{isJoined ? `${progress.progress}%` : 'Not Started'}</span>
                    </div>
                    {isJoined && (
                      <div className="w-full bg-bg-elevated rounded-full h-2">
                        <motion.div
                          className="bg-bio-gradient h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.progress || 0}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="glass-card p-3 mb-4 flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-accent-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Rewards:</p>
                      <p className="text-xs text-text-secondary">{challenge.rewards}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-text-tertiary">
                      {challenge.type} • Starts{' '}
                      {new Date(challenge.startDate).toLocaleDateString()}
                    </div>
                    {!isJoined ? (
                      <AnimatedButton size="sm" onClick={() => joinChallenge(challenge.id)}>
                        Join Challenge
                      </AnimatedButton>
                    ) : (
                      <AnimatedButton size="sm" variant="secondary" disabled>
                        Joined
                      </AnimatedButton>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div className="glass-card p-6 mt-8" variants={fadeInUp} initial="hidden" animate="visible">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent-primary" /> Leaderboard
          </h2>
          <div className="space-y-3">
            <div className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <p className="font-semibold text-text-primary">Top Challenger</p>
                  <p className="text-sm text-text-secondary">5 challenges completed</p>
                </div>
              </div>
              <p className="text-accent-primary font-bold">500 $TA</p>
            </div>
            {/* More leaderboard entries */}
            <div className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥈</span>
                <div>
                  <p className="font-semibold text-text-primary">Second Place</p>
                  <p className="text-sm text-text-secondary">4 challenges completed</p>
                </div>
              </div>
              <p className="text-accent-secondary font-bold">300 $TA</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

