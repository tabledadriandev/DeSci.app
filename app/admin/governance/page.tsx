'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Scale, ListChecks, CheckCircle2, XCircle, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  category?: string | null;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  endDate: string;
}

const statusConfig = {
  active: { icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  passed: { icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-400/10' },
  rejected: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-400/10' },
  pending: { icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
};

export default function GovernanceAdminPage() {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setProposals([
      { id: '1', title: 'Increase Staking Rewards', description: 'Proposal to increase staking rewards by 10%', type: 'rewards', status: 'active', votesFor: 100, votesAgainst: 20, createdAt: new Date().toISOString(), endDate: new Date().toISOString() },
      { id: '2', title: 'New Feature: Gamified Leaderboards', description: 'Proposal to add gamified leaderboards to the app', type: 'feature', status: 'passed', votesFor: 200, votesAgainst: 10, createdAt: new Date().toISOString(), endDate: new Date().toISOString() },
      { id: '3', title: 'Decrease Transaction Fees', description: 'Proposal to decrease transaction fees by 5%', type: 'fees', status: 'rejected', votesFor: 50, votesAgainst: 150, createdAt: new Date().toISOString(), endDate: new Date().toISOString() },
    ]);
    setLoading(false);
  }, []);

  const total = proposals.length;
  const active = proposals.filter((p) => p.status === 'active').length;
  const passed = proposals.filter((p) => p.status === 'passed').length;
  const rejected = proposals.filter((p) => p.status === 'rejected').length;

  const summaryStats = [
    { label: 'Total Proposals', value: total, icon: ListChecks, color: 'text-blue-400' },
    { label: 'Active', value: active, icon: Clock, color: 'text-yellow-400' },
    { label: 'Passed', value: passed, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-400' },
  ];

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Governance Analytics
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            High-level overview of DAO proposals and their status.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {summaryStats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeInUp} className="glass-card-hover p-6 flex items-center gap-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Recent Proposals</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner text="Loading proposals..." />
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => <ProposalItem key={p.id} {...p} />)}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

function ProposalItem(proposal: GovernanceProposal) {
  const { icon: Icon, color, bgColor } = statusConfig[proposal.status];
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const support = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;

  return (
    <motion.div variants={fadeInUp} className="border border-border-light rounded-lg p-4 bg-bg-surface/50 hover:bg-bg-surface/80 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-base font-semibold text-text-primary">{proposal.title}</h3>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bgColor} ${color}`}>
          <Icon className="w-3.5 h-3.5" />
          {proposal.status}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">{proposal.description}</p>
      <div>
        <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden mb-1">
          <div
            className="h-full bg-bio-gradient"
            style={{ width: `${support}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary">
          <span>{support.toFixed(0)}% Support</span>
          <span>{totalVotes} votes</span>
        </div>
      </div>
    </motion.div>
  );
}


