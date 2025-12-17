'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Wallet, Receipt, SlidersHorizontal } from 'lucide-react';

interface TreasuryBalance {
  currency: string;
  balance: number;
}

interface TreasuryTransaction {
  id: string;
  type: 'revenue' | 'expense' | 'dividend' | 'proposal_execution';
  category?: string;
  description: string;
  amount: number;
  currency: string;
  createdAt: string;
  proposal?: {
    id: string;
    title: string;
  };
}

export default function TreasuryPage() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<TreasuryBalance[]>([]);
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    currency: '',
  });

  useEffect(() => {
    // Mock data for now
    setBalance([
      { currency: '$TA', balance: 1250000.75 },
      { currency: 'ETH', balance: 50.12 },
      { currency: 'USDC', balance: 250000.00 },
    ]);
    setTransactions([
      { id: 't1', type: 'revenue', category: 'data_licensing', description: 'Enterprise Data License Q4', amount: 100000, currency: 'USDC', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 't2', type: 'expense', category: 'operations', description: 'Smart Contract Audit Fee', amount: 15000, currency: 'USDC', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
      { id: 't3', type: 'dividend', category: 'rewards', description: 'Quarterly $TA Dividend', amount: 50000, currency: '$TA', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
      { id: 't4', type: 'proposal_execution', category: 'grants', description: 'DeSci Research Grant (Prop #12)', amount: 20000, currency: 'ETH', createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), proposal: { id: '12', title: 'DeSci Research Grant' } },
    ]);
    setLoading(false);
  }, [filters]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'TA' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('USD', currency === '$TA' ? '$TA' : currency);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'dividend':
        return <ArrowDownRight className="w-4 h-4 text-semantic-success" />;
      case 'expense':
      case 'proposal_execution':
        return <ArrowUpRight className="w-4 h-4 text-semantic-error" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'dividend':
        return 'text-semantic-success';
      case 'expense':
      case 'proposal_execution':
        return 'text-semantic-error';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            DAO Treasury
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Transparent financial overview of the Table d'Adrian DAO.
          </p>
        </motion.div>

        {/* Balance Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner text="Loading treasury balances..." />
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={staggerContainer} initial="hidden" animate="visible">
            {balance.map((bal: any, idx: number) => (
              <motion.div key={bal.currency} variants={fadeInUp} className="glass-card-hover p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="w-6 h-6 text-accent-primary" />
                  <p className="text-sm font-medium text-text-secondary">{bal.currency} Balance</p>
                </div>
                <p className="text-4xl font-bold text-text-primary">
                  {formatCurrency(bal.balance, bal.currency)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-4">
            <SlidersHorizontal className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-bold text-text-primary">Transaction Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              >
                <option value="">All Types</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
                <option value="dividend">Dividend</option>
                <option value="proposal_execution">Proposal Execution</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              >
                <option value="">All Categories</option>
                <option value="marketplace">Marketplace</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="data_licensing">Data Licensing</option>
                <option value="operations">Operations</option>
                <option value="grants">Grants</option>
                <option value="rewards">Rewards</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Currency</label>
              <select
                value={filters.currency}
                onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              >
                <option value="">All Currencies</option>
                <option value="TA">$TA</option>
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div className="glass-card p-6" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-bold text-text-primary">Transaction History</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner text="Loading transactions..." />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No transactions found matching your criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-medium">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="visible" className="divide-y divide-border-medium">
                  {transactions.map((tx, idx) => (
                    <motion.tr key={tx.id} variants={fadeInUp} className="hover:bg-bg-elevated transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="text-sm font-medium text-text-primary capitalize">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary capitalize">
                        {tx.category || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary max-w-xs truncate">
                        {tx.description}
                        {tx.proposal && (
                          <Link href={`/governance?proposal=${tx.proposal.id}`} className="text-accent-primary hover:underline ml-2">
                            (Prop #{tx.proposal.id})
                          </Link>
                        )}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold text-right ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'revenue' || tx.type === 'dividend' ? '+' : '-'}
                        {formatCurrency(Math.abs(tx.amount), tx.currency)}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

