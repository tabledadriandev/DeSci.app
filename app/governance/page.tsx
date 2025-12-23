'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import Skeleton from '@/components/ui/Skeleton';
import { Vote, TrendingUp, FileText, CheckCircle, XCircle, Zap, Users, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, Legend, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';

const TA_CONTRACT = '0xee47670a6ed7501aeeb9733efd0bf7d93ed3cb07' as `0x${string}`;

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProposal, setNewProposal] = useState({ title: '', description: '', type: 'feature' });
  const [votingPower, setVotingPower] = useState<any>(null);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const { data: balance } = useBalance({
    address,
    token: TA_CONTRACT,
    chainId: 8453,
  });

  useEffect(() => {
    loadProposals();
    if (address) {
      loadVotingPower();
    }
  }, [address]);

  const loadProposals = async () => {
    try {
      const response = await fetch('/api/governance/proposals');
      const data = await response.json();
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVotingPower = async () => {
    try {
      const response = await fetch(`/api/governance/voting-power?address=${address}`);
      const data = await response.json();
      setVotingPower(data);
    } catch (error) {
      console.error('Error loading voting power:', error);
    }
  };

  const createProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newProposal.title || !newProposal.description) return;

    try {
      const response = await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          ...newProposal,
        }),
      });

      if (response.ok) {
        setNewProposal({ title: '', description: '', type: 'feature' });
        await loadProposals();
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const vote = async (proposalId: string, voteType: 'for' | 'against') => {
    if (!address) return;

    try {
      const response = await fetch(`/api/governance/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          proposalId,
          vote: voteType,
        }),
      });

      if (response.ok) {
        await loadProposals();
        await loadVotingPower();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!isConnected) {
    return (
      <PageTransition>
        <div className="min-h-screen  flex items-center justify-center p-4">
          <AnimatedCard className="max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Vote className="w-16 h-16 text-accent-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold gradient-text mb-4">
                DAO Governance
              </h1>
              <p className="text-text-secondary mb-8">
                Connect your wallet to participate in governance
              </p>
              <ConnectButton />
            </motion.div>
          </AnimatedCard>
        </div>
      </PageTransition>
    );
  }

  const tokenBalance = balance ? parseFloat(balance.formatted) : 0;
  const totalVotingPower = votingPower?.totalWeightedPower || tokenBalance;

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                DAO Governance
              </h1>
              <p className="text-text-secondary text-lg">
                Vote on proposals with your $tabledadrian holdings
              </p>
            </div>
            </motion.div>
            <AnimatedCard delay={0.1} className="text-center md:text-right min-w-[200px]">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent-primary" />
                <div className="text-sm text-text-secondary">Voting Power</div>
              </div>
              <div className="text-3xl font-bold text-accent-primary mb-1">
                {totalVotingPower.toFixed(2)}
              </div>
              <div className="text-xs text-text-tertiary">votes</div>
              {votingPower && votingPower.maxMultiplier > 1.0 && (
                <div className="text-xs text-semantic-success mt-2 font-semibold">
                  {votingPower.maxMultiplier.toFixed(1)}x multiplier active
                </div>
              )}
              <a
                href="/governance/treasury"
                className="text-xs text-accent-primary hover:underline mt-2 inline-block"
              >
                View Treasury →
              </a>
            </AnimatedCard>
          </div>

          {/* Create Proposal */}
          {tokenBalance >= 100 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <AnimatedCard className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-accent-primary" />
                  <h2 className="text-2xl font-bold text-text-primary">Create Proposal</h2>
                </div>
                <p className="text-text-secondary mb-6">
                  Requires minimum 100 $tabledadrian to create proposals
                </p>
                <form onSubmit={createProposal} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Proposal Title"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="input-premium"
                    required
                  />
                  <select
                    value={newProposal.type}
                    onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
                    className="input-premium"
                  >
                    <option value="feature">New Feature</option>
                    <option value="partnership">Partnership</option>
                    <option value="treasury">Treasury Allocation</option>
                    <option value="policy">Policy Change</option>
                  </select>
                  <textarea
                    placeholder="Proposal Description"
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    className="input-premium min-h-[120px] resize-none"
                    rows={6}
                    required
                  />
                  <AnimatedButton type="submit" variant="primary">
                    Create Proposal
                  </AnimatedButton>
                </form>
              </AnimatedCard>
            </motion.div>
          )}

          {/* Proposals List */}
          {loading ? (
            <div className="space-y-4 mt-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <AnimatedCard key={idx} className="overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="mt-2">
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
              {proposals.length === 0 ? (
                <AnimatedCard className="text-center py-12">
                  <p className="text-text-secondary">No proposals yet. Be the first to create one!</p>
                </AnimatedCard>
              ) : (
                proposals.map((proposal, index) => {
                  const totalVotes = (proposal.votesFor || 0) + (proposal.votesAgainst || 0);
                  const forPercentage = totalVotes > 0 ? ((proposal.votesFor || 0) / totalVotes) * 100 : 0;
                  const isActive = proposal.status === 'active';
                  const hasVoted = proposal.votes?.some((v: any) => v.voter === address);

                  return (
                    <motion.div key={proposal.id} variants={staggerItem}>
                      <AnimatedCard hover className="overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-text-primary">
                                {proposal.title}
                              </h3>
                              <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-semibold">
                                {proposal.type}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isActive
                                  ? 'bg-semantic-success/10 text-semantic-success'
                                  : proposal.status === 'passed'
                                  ? 'bg-semantic-info/10 text-semantic-info'
                                  : 'bg-semantic-error/10 text-semantic-error'
                              }`}>
                                {proposal.status}
                              </span>
                            </div>
                            <p className="text-text-secondary">{proposal.description}</p>
                          </div>
                        </div>

                        {/* Vote Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-text-secondary mb-2">
                            <span>For: {proposal.votesFor?.toFixed(2) || 0}</span>
                            <span>Against: {proposal.votesAgainst?.toFixed(2) || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="h-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${forPercentage}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                style={{ height: '100%', background: 'linear-gradient(to right, #10B981, #00D4AA)' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Vote Actions */}
                        {isActive && !hasVoted && (
                          <div className="flex gap-3">
                            <AnimatedButton
                              variant="primary"
                              size="sm"
                              onClick={() => vote(proposal.id, 'for')}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Vote For
                            </AnimatedButton>
                            <AnimatedButton
                              variant="secondary"
                              size="sm"
                              onClick={() => vote(proposal.id, 'against')}
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Vote Against
                            </AnimatedButton>
                          </div>
                        )}

                        {hasVoted && (
                          <div className="text-sm text-semantic-success font-semibold">
                            ✓ You've already voted on this proposal
                          </div>
                        )}

                        {/* Voter Analytics Button */}
                        {proposal.votes && proposal.votes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border-light">
                            <AnimatedButton
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedProposal(selectedProposal === proposal.id ? null : proposal.id)}
                              className="w-full"
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              {selectedProposal === proposal.id ? 'Hide' : 'View'} Voter Analytics
                            </AnimatedButton>

                            {selectedProposal === proposal.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <div className="mt-4 space-y-4">
                                {/* Vote Distribution Pie Chart */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <PieChart className="w-5 h-5 text-accent-primary" />
                                    <h4 className="font-semibold text-text-primary">Vote Distribution</h4>
                                  </div>
                                  <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsPieChart>
                                        <Pie
                                          data={[
                                            { name: 'For', value: proposal.votesFor || 0, color: '#10B981' },
                                            { name: 'Against', value: proposal.votesAgainst || 0, color: '#EF4444' },
                                          ]}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : 0}%`}
                                          outerRadius={80}
                                          fill="#8884d8"
                                          dataKey="value"
                                        >
                                          <Cell fill="#10B981" />
                                          <Cell fill="#EF4444" />
                                        </Pie>
                                        <Tooltip />
                                      </RechartsPieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>

                                {/* Top Voters */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-accent-primary" />
                                    <h4 className="font-semibold text-text-primary">Top Voters</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {[...(proposal.votes || [])]
                                      .sort((a: any, b: any) => b.weight - a.weight)
                                      .slice(0, 10)
                                      .map((vote: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between p-2 bg-white rounded-lg"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                                              <span className="text-xs font-semibold text-accent-primary">
                                                {idx + 1}
                                              </span>
                                            </div>
                                            <div>
                                              <div className="text-sm font-medium text-text-primary">
                                                {vote.voter?.slice(0, 6)}...{vote.voter?.slice(-4)}
                                              </div>
                                              <div className="text-xs text-text-secondary">
                                                {vote.vote === 'for' ? (
                                                  <span className="text-semantic-success">✓ For</span>
                                                ) : (
                                                  <span className="text-semantic-error">✗ Against</span>
                                                )}
                                                {vote.multiplier > 1.0 && (
                                                  <span className="ml-2 text-semantic-warning">
                                                    {vote.multiplier.toFixed(1)}x
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-sm font-semibold text-accent-primary">
                                            {vote.weight.toFixed(2)} votes
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>

                                {/* Voting Power Distribution */}
                                {proposal.votes && proposal.votes.length > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                      <TrendingUp className="w-5 h-5 text-accent-primary" />
                                      <h4 className="font-semibold text-text-primary">Voting Power Breakdown</h4>
                                    </div>
                                    <div className="h-48">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                          data={[
                                            {
                                              range: '0-100',
                                              count: proposal.votes.filter((v: any) => v.weight <= 100).length,
                                            },
                                            {
                                              range: '100-500',
                                              count: proposal.votes.filter(
                                                (v: any) => v.weight > 100 && v.weight <= 500
                                              ).length,
                                            },
                                            {
                                              range: '500-1000',
                                              count: proposal.votes.filter(
                                                (v: any) => v.weight > 500 && v.weight <= 1000
                                              ).length,
                                            },
                                            {
                                              range: '1000+',
                                              count: proposal.votes.filter((v: any) => v.weight > 1000).length,
                                            },
                                          ]}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                                          <XAxis dataKey="range" stroke="#6B6560" fontSize={12} />
                                          <YAxis stroke="#6B6560" fontSize={12} />
                                          <Tooltip
                                            contentStyle={{
                                              backgroundColor: '#FFFFFF',
                                              border: '1px solid #E8E3DC',
                                              borderRadius: '8px',
                                            }}
                                          />
                                          <Bar dataKey="count" fill="#0F4C81" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                )}

                                {/* Vote Statistics */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-semantic-success">
                                      {proposal.votes.filter((v: any) => v.vote === 'for').length}
                                    </div>
                                    <div className="text-sm text-text-secondary">Voters For</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-semantic-error">
                                      {proposal.votes.filter((v: any) => v.vote === 'against').length}
                                    </div>
                                    <div className="text-sm text-text-secondary">Voters Against</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-accent-primary">
                                      {proposal.votes.length}
                                    </div>
                                    <div className="text-sm text-text-secondary">Total Voters</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-semantic-warning">
                                      {proposal.votes.filter((v: any) => v.multiplier > 1.0).length}
                                    </div>
                                    <div className="text-sm text-text-secondary">Lock-Up Voters</div>
                                  </div>
                                </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </AnimatedCard>
                    </motion.div>
                  );
                })
              )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
