'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { useSafeBalance } from '@/hooks/useSafeBalance';
import SafeConnectButton from '@/components/ui/SafeConnectButton';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Vote, TrendingUp, FileText, CheckCircle, XCircle, Zap, Users, BarChart3, PieChart, Info } from 'lucide-react';
import Link from 'next/link';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, Legend, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';

const TA_CONTRACT = '0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07' as `0x${string}`; // Mock address

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProposal, setNewProposal] = useState({ title: '', description: '', type: 'feature' });
  const [votingPower, setVotingPower] = useState<any>(null);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const { data: balance } = useSafeBalance({
    address,
    token: TA_CONTRACT,
    chainId: 8453, // Base mainnet
  });

  useEffect(() => {
    // Mock data for proposals and voting power
    setProposals([
      {
        id: '1',
        title: 'Increase Community Fund Allocation',
        description: 'Propose to allocate 10,000 $tabledadrian to a new community-led initiative for DeSci research grants.',
        type: 'treasury',
        status: 'active',
        votesFor: 1200,
        votesAgainst: 300,
        votes: [ // Mock votes for analytics
          { voter: '0xabc...123', vote: 'for', weight: 500, multiplier: 1.5 },
          { voter: '0xdef...456', vote: 'against', weight: 100, multiplier: 1.0 },
          { voter: '0xghi...789', vote: 'for', weight: 700, multiplier: 1.0 },
        ]
      },
      {
        id: '2',
        title: 'Integrate New Biomarker API',
        description: 'Proposal to integrate a new API for advanced biomarker data tracking and analysis.',
        type: 'feature',
        status: 'passed',
        votesFor: 2500,
        votesAgainst: 150,
        votes: []
      },
      {
        id: '3',
        title: 'Adjust Staking Rewards Program',
        description: 'Discussion on adjusting the current staking rewards to ensure long-term sustainability.',
        type: 'policy',
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        votes: []
      },
    ]);

    setVotingPower({
      balance: balance ? parseFloat(balance.formatted) : 150, // Mock if no actual balance
      lockedBalance: 100,
      totalWeightedPower: (balance ? parseFloat(balance.formatted) : 150) * 1.5, // Example multiplier
      maxMultiplier: 1.5,
    });
    setLoading(false);
  }, [balance, address]);

  const createProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newProposal.title || !newProposal.description) return;
    setLoading(true); // Simulate loading

    // Mock API call
    setTimeout(() => {
      const createdProposal = {
        id: String(proposals.length + 1),
        status: 'active',
        votesFor: 0,
        votesAgainst: 0,
        votes: [],
        ...newProposal,
      };
      setProposals((prev) => [createdProposal, ...prev]);
      setNewProposal({ title: '', description: '', type: 'feature' });
      setLoading(false);
      alert('Proposal created successfully!');
    }, 1500);
  };

  const vote = async (proposalId: string, voteType: 'for' | 'against') => {
    if (!address) return;
    setLoading(true); // Simulate loading

    // Mock API call
    setTimeout(() => {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                votesFor: voteType === 'for' ? p.votesFor + 1 : p.votesFor,
                votesAgainst: voteType === 'against' ? p.votesAgainst + 1 : p.votesAgainst,
                votes: [...p.votes, { voter: address, vote: voteType, weight: votingPower.totalWeightedPower, multiplier: votingPower.maxMultiplier }],
              }
            : p
        )
      );
      setLoading(false);
      alert('Vote cast successfully!');
    }, 1000);
  };

  const tokenBalance = balance ? parseFloat(balance.formatted) : 0;
  const totalVotingPower = votingPower?.totalWeightedPower || tokenBalance;

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center page-header gap-4">
          <div>
            <h1 className="page-title">DAO Governance</h1>
            <p className="page-subtitle">
              Vote on proposals with your $tabledadrian holdings and shape the future.
            </p>
          </div>
          <motion.div className="glass-card-hover p-6 text-center md:text-right min-w-[250px]" variants={fadeInUp}>
            <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
              <Zap className="w-6 h-6 text-accent-primary" />
              <p className="text-sm text-text-secondary">Your Voting Power</p>
            </div>
            <p className="text-4xl font-bold text-accent-primary mb-1">
              {totalVotingPower.toFixed(2)}
            </p>
            <p className="text-xs text-text-tertiary">weighted votes</p>
            {votingPower && votingPower.maxMultiplier > 1.0 && (
              <p className="text-xs text-semantic-success mt-2 font-semibold">
                {votingPower.maxMultiplier.toFixed(1)}x multiplier active
              </p>
            )}
            <Link href="/governance/treasury" className="text-xs text-accent-primary hover:underline mt-3 inline-block">
              View Treasury &rarr;
            </Link>
          </motion.div>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial="hidden" animate="visible" variants={fadeInUp}
            className="glass-card text-center py-10 mb-8"
          >
            <Vote className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-4">Connect Wallet to Participate</h2>
            <p className="text-base text-text-secondary mb-8">
              Your voting power is determined by your $tabledadrian token holdings.
            </p>
            <SafeConnectButton />
          </motion.div>
        )}

        {isConnected && (
          <>
            {/* Create Proposal */}
            {tokenBalance >= 100 ? ( // Assuming 100 $tabledadrian is the minimum
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-accent-primary" />
                  <h2 className="text-2xl font-bold text-text-primary">Create New Proposal</h2>
                </div>
                <p className="text-text-secondary mb-6">
                  A minimum of 100 $tabledadrian tokens is required to submit a new proposal to the DAO.
                </p>
                <form onSubmit={createProposal} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Proposal Title"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="form-input"
                    required
                  />
                  <select
                    value={newProposal.type}
                    onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
                    className="form-select"
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
                    className="form-textarea"
                    rows={6}
                    required
                  />
                  <AnimatedButton type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Create Proposal'}
                  </AnimatedButton>
                </form>
              </motion.div>
            ) : (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-6 mb-8 text-center text-text-secondary">
                <p>You need at least 100 $tabledadrian tokens to create a proposal.</p>
                <p className="text-sm mt-2">Current balance: {tokenBalance.toFixed(2)} $tabledadrian</p>
              </motion.div>
            )}

            {/* Proposals List */}
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner text="Loading proposals..." />
              </div>
            ) : (
              <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
                {proposals.length === 0 ? (
                  <motion.div variants={fadeInUp} className="glass-card text-center py-12">
                    <p className="text-text-secondary">No proposals yet. Be the first to create one!</p>
                  </motion.div>
                ) : (
                  proposals.map((proposal, index) => {
                    const totalVotes = (proposal.votesFor || 0) + (proposal.votesAgainst || 0);
                    const forPercentage = totalVotes > 0 ? ((proposal.votesFor || 0) / totalVotes) * 100 : 0;
                    const isActive = proposal.status === 'active';
                    const hasVoted = proposal.votes?.some((v: any) => v.voter === address);

                    return (
                      <motion.div key={proposal.id} variants={fadeInUp}>
                        <div className="glass-card-hover p-6 overflow-hidden">
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
                            <div className="w-full bg-bg-elevated rounded-full h-3 overflow-hidden">
                              <div className="h-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${forPercentage}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeInOut' }}
                                  className="h-full bg-accent-primary"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Vote Actions */}
                          {isActive && !hasVoted && (
                            <div className="flex gap-3 mt-4">
                              <AnimatedButton
                                variant="primary"
                                size="sm"
                                onClick={() => vote(proposal.id, 'for')}
                                className="flex-1"
                                disabled={loading}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Vote For
                              </AnimatedButton>
                              <AnimatedButton
                                variant="secondary"
                                size="sm"
                                onClick={() => vote(proposal.id, 'against')}
                                className="flex-1"
                                disabled={loading}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Vote Against
                              </AnimatedButton>
                            </div>
                          )}

                          {hasVoted && (
                            <div className="glass-card p-3 mt-4 text-sm text-semantic-success font-semibold flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> You've already voted on this proposal
                            </div>
                          )}

                          {/* Voter Analytics Button */}
                          {proposal.votes && proposal.votes.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border-medium">
                              <AnimatedButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedProposal(selectedProposal === proposal.id ? null : proposal.id)}
                                className="w-full"
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                {selectedProposal === proposal.id ? 'Hide' : 'View'} Voter Analytics
                              </AnimatedButton>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
