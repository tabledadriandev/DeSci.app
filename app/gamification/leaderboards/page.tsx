'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Trophy, Leaf, Flame, User } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  label: string;
  shannonIndex?: number | null;
  streak?: number | null;
  walletAddress: string; // Added for mock data
}

interface LeaderboardsResponse {
  microbiotaDiversity: LeaderboardEntry[];
  longestStreaks: LeaderboardEntry[];
}

export default function GamificationLeaderboardsPage() {
  const [data, setData] = useState<LeaderboardsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setData({
      microbiotaDiversity: [
        { rank: 1, label: 'BioExplorer', shannonIndex: 4.8, walletAddress: '0xabc...efg' },
        { rank: 2, label: 'GutGuru', shannonIndex: 4.5, walletAddress: '0x123...456' },
        { rank: 3, label: 'FloraFriend', shannonIndex: 4.2, walletAddress: '0x789...012' },
      ],
      longestStreaks: [
        { rank: 1, label: 'DailyHabitHero', streak: 125, walletAddress: '0xabc...efg' },
        { rank: 2, label: 'ConsistentCarrot', streak: 90, walletAddress: '0x321...654' },
        { rank: 3, label: 'StreakMaster', streak: 78, walletAddress: '0x987...210' },
      ],
    });
    setLoading(false);
  }, []);

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Wellness Leaderboards
            </h1>
            <p className="text-base text-text-secondary max-w-md">
              Compete, track your progress, and see how you stack up in the community.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading leaderboards..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Microbiota diversity */}
            <motion.section className="glass-card p-6" variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-text-primary">Microbiota Diversity</h2>
              </div>
              {data?.microbiotaDiversity.length === 0 ? (
                <p className="text-text-secondary">No microbiome tests recorded yet.</p>
              ) : (
                <ol className="space-y-3">
                  {data?.microbiotaDiversity.map((entry) => (
                    <motion.li
                      key={`${entry.rank}-${entry.label}`}
                      variants={fadeInUp}
                      className="glass-card-hover p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-center font-bold text-accent-primary">
                          #{entry.rank}
                        </span>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-text-tertiary" />
                          <span className="truncate max-w-[160px] text-text-primary">
                            {entry.label} ({entry.walletAddress.slice(0, 4)}...{entry.walletAddress.slice(-4)})
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-green-400">
                        {entry.shannonIndex?.toFixed(2) ?? '—'}
                      </span>
                    </motion.li>
                  ))}
                </ol>
              )}
            </motion.section>

            {/* Streaks */}
            <motion.section className="glass-card p-6" variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-bold text-text-primary">Longest Streaks</h2>
              </div>
              {data?.longestStreaks.length === 0 ? (
                <p className="text-text-secondary">No habit streaks recorded yet.</p>
              ) : (
                <ol className="space-y-3">
                  {data?.longestStreaks.map((entry) => (
                    <motion.li
                      key={`${entry.rank}-${entry.label}`}
                      variants={fadeInUp}
                      className="glass-card-hover p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-center font-bold text-accent-primary">
                          #{entry.rank}
                        </span>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-text-tertiary" />
                          <span className="truncate max-w-[160px] text-text-primary">
                            {entry.label} ({entry.walletAddress.slice(0, 4)}...{entry.walletAddress.slice(-4)})
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-orange-400">
                        {entry.streak ?? 0} days
                      </span>
                    </motion.li>
                  ))}
                </ol>
              )}
            </motion.section>
          </div>
        )}
      </div>
    </PageTransition>
  );
}


