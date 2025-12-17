'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Trophy, Users, CheckCircle, Calendar } from 'lucide-react';

export default function TournamentsPage() {
  const { address } = useAccount();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTournaments([
      { id: '1', name: 'Metabolic Health Masters', description: 'Compete based on the biggest improvement in your metabolic health score over 30 days.', status: 'active', prizePool: 10000, entryFee: 50, participants: 78, maxParticipants: 100, endDate: new Date(Date.now() + 86400000 * 20).toISOString() },
      { id: '2', name: 'Sleep Score Champions', description: 'Achieve the highest average sleep score over one week.', status: 'upcoming', prizePool: 5000, entryFee: 20, participants: 0, maxParticipants: 200, endDate: new Date(Date.now() + 86400000 * 30).toISOString() },
    ]);
    setMyEntries([
      { tournamentId: '1' },
    ]);
    setLoading(false);
  }, [address]);

  const joinTournament = async (tournamentId: string) => {
    if (!address) return;
    alert(`Joining tournament ${tournamentId}! (Mock)`);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Wellness Tournaments
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Compete with the community, prove your progress, and earn substantial rewards.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading tournaments..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Tournaments */}
            <motion.div className="lg:col-span-2 space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
              <h2 className="text-2xl font-bold text-text-primary">Active Tournaments</h2>
              {tournaments
                .filter((t) => t.status === 'active')
                .map((tournament) => {
                  const isJoined = myEntries.some((e) => e.tournamentId === tournament.id);
                  return (
                    <motion.div
                      key={tournament.id}
                      variants={fadeInUp}
                      className="glass-card-hover p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-text-primary mb-2">
                            {tournament.name}
                          </h3>
                          <p className="text-text-secondary text-sm">{tournament.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-semantic-success/10 text-semantic-success rounded-full text-xs font-semibold border border-semantic-success/20">
                          Active
                        </span>
                      </div>

                      <div className="glass-card p-4 mb-4">
                        <p className="text-sm text-text-secondary">Prize Pool</p>
                        <p className="text-3xl font-bold text-accent-primary">{tournament.prizePool.toLocaleString()} $TA</p>
                        <p className="text-xs text-text-tertiary mt-1">Entry Fee: {tournament.entryFee} $TA</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-text-secondary mb-2">
                          <p className="flex items-center gap-1"><Users className="w-4 h-4" /> Participants</p>
                          <p>{tournament.participants} / {tournament.maxParticipants}</p>
                        </div>
                        <ProgressBar value={(tournament.participants / tournament.maxParticipants) * 100} size="sm" showValue={false} />
                      </div>

                      <div className="flex justify-between items-center text-sm text-text-secondary">
                        <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Ends: {new Date(tournament.endDate).toLocaleDateString()}</p>
                        {isJoined ? (
                          <p className="font-semibold text-semantic-success flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Joined
                          </p>
                        ) : (
                          <AnimatedButton onClick={() => joinTournament(tournament.id)}>
                            Join ({tournament.entryFee} $TA)
                          </AnimatedButton>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={fadeInUp} className="glass-card p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-accent-primary" /> Leaderboard
              </h2>
              <div className="space-y-3">
                <div className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-2xl">🥇</p>
                    <div>
                      <p className="font-semibold text-text-primary">BioHacker_01</p>
                      <p className="text-sm text-text-secondary">5,000 pts</p>
                    </div>
                  </div>
                  <p className="text-accent-primary font-bold">500 $TA</p>
                </div>
                <div className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-2xl">🥈</p>
                    <div>
                      <p className="font-semibold text-text-primary">WellnessWarrior</p>
                      <p className="text-sm text-text-secondary">4,500 pts</p>
                    </div>
                  </div>
                  <p className="text-accent-secondary font-bold">300 $TA</p>
                </div>
                <div className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-2xl">🥉</p>
                    <div>
                      <p className="font-semibold text-text-primary">LongevitySeeker</p>
                      <p className="text-sm text-text-secondary">4,200 pts</p>
                    </div>
                  </div>
                  <p className="text-accent-secondary font-bold">100 $TA</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

