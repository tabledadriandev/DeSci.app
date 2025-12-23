'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function TreasuryPage() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    currency: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch('/api/treasury/balance'),
        fetch(`/api/treasury/transactions?${new URLSearchParams({
          ...(filters.type && { type: filters.type }),
          ...(filters.category && { category: filters.category }),
          ...(filters.currency && { currency: filters.currency }),
        })}`),
      ]);

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setBalance(balanceData);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error loading treasury data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'TA' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('USD', currency === 'TA' ? '$tabledadrian' : currency);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'dividend':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'expense':
      case 'proposal_execution':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'dividend':
        return 'text-green-600';
      case 'expense':
      case 'proposal_execution':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display text-accent-primary mb-2">DAO Treasury</h1>
          <p className="text-text-secondary">Transparent financial overview of the Table d'Adrian DAO</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))
            : balance?.balances?.map((bal: any) => (
                <div
                  key={bal.currency}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-accent-primary" />
                      <span className="text-sm font-medium text-text-secondary">{bal.currency}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-accent-primary">
                    {formatCurrency(bal.balance, bal.currency)}
                  </div>
                </div>
              ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-accent-primary">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="marketplace">Marketplace</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="data_licensing">Data Licensing</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Currency</label>
              <select
                value={filters.currency}
                onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              >
                <option value="">All Currencies</option>
                <option value="TA">$tabledadrian</option>
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-accent-primary">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Proposal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(tx.type)}
                          <span className="text-sm font-medium text-text-primary capitalize">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">
                        {tx.category || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {tx.description}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'revenue' || tx.type === 'dividend' ? '+' : '-'}
                        {formatCurrency(Math.abs(tx.amount), tx.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tx.proposal ? (
                          <a
                            href={`/governance?proposal=${tx.proposal.id}`}
                            className="text-accent-primary hover:underline"
                          >
                            {tx.proposal.title}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

