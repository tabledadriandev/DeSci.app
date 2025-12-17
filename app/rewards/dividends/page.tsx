'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Coins, TrendingUp, Clock, CheckCircle, Wallet, Gift } from 'lucide-react';

export default function DividendsPage() {
  const { address } = useAccount();
  const [dividends, setDividends] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setDividends([
      { id: '1', amount: 50.75, currency: '$TA', status: 'completed', distributionDate: new Date(Date.now() - 86400000 * 30).toISOString(), sourceType: 'data_licensing', usdValue: 12.68, txHash: '0xabc...' },
      { id: '2', amount: 120.50, currency: '$TA', status: 'completed', distributionDate: new Date(Date.now() - 86400000 * 60).toISOString(), sourceType: 'data_licensing', usdValue: 28.92, txHash: '0xdef...' },
      { id: '3', amount: 75.00, currency: '$TA', status: 'pending', distributionDate: new Date(Date.now() + 86400000 * 10).toISOString(), sourceType: 'data_licensing', usdValue: 18.75 },
    ]);
    setTotalEarned(171.25);
    setPendingCount(1);
    setLoading(false);
  }, [address]);

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Data Licensing Dividends
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Earn 40% of all data licensing revenue by opting in to share your anonymized health data for research.
          </p>
        </motion.div>

        {!address ? (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card text-center py-12">
            <Wallet className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Connect Your Wallet</h2>
            <p className="text-text-secondary">Please connect your wallet to view your dividend earnings.</p>
          </motion.div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner text="Loading your dividend data..." />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={fadeInUp} className="glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-text-secondary">Total Earned</p>
                      <TrendingUp className="w-5 h-5 text-accent-primary" />
                    </div>
                    <p className="text-4xl font-bold text-accent-primary">{totalEarned.toFixed(2)} $TA</p>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-text-secondary">Pending Payouts</p>
                      <Clock className="w-5 h-5 text-semantic-warning" />
                    </div>
                    <p className="text-4xl font-bold text-semantic-warning">{pendingCount}</p>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-text-secondary">Total Payments</p>
                      <Coins className="w-5 h-5 text-text-tertiary" />
                    </div>
                    <p className="text-4xl font-bold text-text-primary">{dividends.length}</p>
                  </motion.div>
                </motion.div>

                {/* Dividends List */}
                <motion.div className="glass-card p-6" variants={fadeInUp}>
                  <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-accent-primary" /> Payment History
                  </h2>
                  {dividends.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                      <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-bold text-text-primary mb-2">No Dividends Yet</h3>
                      <p className="text-sm max-w-md mx-auto">
                        Opt in to data sharing in Settings to start earning dividends from research data licensing revenue.
                      </p>
                    </div>
                  ) : (
                    <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
                      {dividends.map((dividend) => (
                        <motion.div
                          key={dividend.id}
                          variants={fadeInUp}
                          className="glass-card-hover p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-bold text-lg text-text-primary">
                                {dividend.amount.toFixed(4)} {dividend.currency}
                              </p>
                              {dividend.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-semantic-success" />
                              ) : (
                                <Clock className="w-5 h-5 text-semantic-warning" />
                              )}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {new Date(dividend.distributionDate).toLocaleDateString()} •{' '}
                              {dividend.sourceType === 'data_licensing' ? 'Data Licensing' : dividend.sourceType}
                              {dividend.usdValue && ` • ~$${dividend.usdValue.toFixed(2)} USD`}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                dividend.status === 'completed'
                                  ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20'
                                  : 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20'
                              }`}
                            >
                              {dividend.status}
                            </span>
                            {dividend.txHash && (
                              <a
                                href={`https://basescan.org/tx/${dividend.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent-primary hover:underline"
                              >
                                View on BaseScan
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}

