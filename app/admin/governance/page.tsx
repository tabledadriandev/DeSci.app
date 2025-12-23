'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import { Scale, ListChecks, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  category?: string | null;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  endDate: string;
}

export default function GovernanceAdminPage() {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/governance/proposals');
        const data = await res.json();
        setProposals(data || []);
      } catch (err) {
        console.error('Error loading proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = proposals.length;
  const active = proposals.filter((p) => p.status === 'active').length;
  const passed = proposals.filter((p) => p.status === 'passed').length;
  const rejected = proposals.filter((p) => p.status === 'rejected').length;

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial="initial" animate="animate" variants={fadeInUp}>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-1">
              Governance Analytics
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl">
              High-level overview of DAO proposals, their status, and voting power distribution.
            </p>
          </motion.div>

          {/* Summary */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AnimatedCard className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  Total Proposals
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {total.toString().padStart(2, '0')}
                </div>
              </div>
              </AnimatedCard>
              <AnimatedCard className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  Active
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {active.toString().padStart(2, '0')}
                </div>
              </div>
              </AnimatedCard>
              <AnimatedCard className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  Passed
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {passed.toString().padStart(2, '0')}
                </div>
              </div>
            </AnimatedCard>
            <AnimatedCard className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  Rejected
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {rejected.toString().padStart(2, '0')}
                </div>
              </div>
              </AnimatedCard>
            </div>
          </motion.div>

          {/* Proposals list */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15 }}
          >
            <AnimatedCard>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Recent Proposals</h2>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="border border-border-light rounded-lg p-4">
                      <div className="flex justify-between mb-2 gap-4">
                        <div className="skeleton h-4 w-48 rounded-md" />
                        <div className="skeleton h-4 w-20 rounded-full" />
                      </div>
                      <div className="skeleton h-3 w-full rounded-md mb-1" />
                      <div className="skeleton h-3 w-3/4 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : proposals.length === 0 ? (
                <div className="py-6 text-center text-sm text-text-secondary">
                  No proposals yet. When governance activity starts, you will see it here.
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {proposals.slice(0, 20).map((p) => {
                      const totalVotes = (p.votesFor || 0) + (p.votesAgainst || 0);
                      const support =
                        totalVotes > 0 ? Math.round((p.votesFor / totalVotes) * 100) : 0;
                      return (
                        <motion.div key={p.id} variants={staggerItem}>
                          <div className="border border-border-light rounded-lg p-4 bg-white/80">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div>
                                <div className="text-sm font-semibold text-text-primary">
                                  {p.title}
                                </div>
                                <div className="text-[11px] text-text-secondary">
                                  {p.type} • {p.category || 'general'}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                                  p.status === 'active'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : p.status === 'passed'
                                    ? 'bg-green-100 text-green-700'
                                    : p.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            <div className="text-xs text-text-secondary mb-3 line-clamp-2">
                              {p.description}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-text-secondary">
                              <div className="flex flex-col gap-1">
                                <span>
                                  For: {p.votesFor.toFixed(2)} • Against: {p.votesAgainst.toFixed(2)}
                                </span>
                                <div className="w-40 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                    style={{ width: `${support}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-right">
                                <div>
                                  Created{' '}
                                  {new Date(p.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                                <div>
                                  Ends{' '}
                                  {new Date(p.endDate).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </AnimatedCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}


