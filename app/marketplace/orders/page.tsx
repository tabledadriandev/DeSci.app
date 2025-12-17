'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Package, Calendar, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceOrdersPage() {
  const { address } = useAccount();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    // Mock data for now
    setOrders([
      { id: '1', description: 'Longevity Supplement Pack', amount: 50, currency: '$TA', status: 'completed', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), txHash: '0xabc123...' },
      { id: '2', description: 'Biohacking Gadget X', amount: 120, currency: '$TA', status: 'pending', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), txHash: '0xdef456...' },
      { id: '3', description: 'Premium Meal Plan Subscription', amount: 30, currency: '$TA', status: 'failed', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), txHash: '0xghi789...' },
    ]);
    setLoading(false);
  }, [address]);

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!order.description?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed' && order.status !== 'completed') return false;
      if (statusFilter === 'pending' && order.status !== 'pending') return false;
      if (statusFilter === 'failed' && order.status !== 'failed') return false;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-semantic-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-semantic-warning" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-semantic-error" />;
      default:
        return <Clock className="w-5 h-5 text-text-tertiary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-semantic-success/10 text-semantic-success border-semantic-success/20';
      case 'pending':
        return 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20';
      case 'failed':
        return 'bg-semantic-error/10 text-semantic-error border-semantic-error/20';
      default:
        return 'bg-bg-elevated text-text-secondary border-border-medium';
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Order History
            </h1>
            <p className="text-base text-text-secondary max-w-2xl">
              View all your marketplace purchases and transactions.
            </p>
          </div>
          <Link href="/marketplace">
            <AnimatedButton variant="secondary" size="sm" icon={<Package className="w-4 h-4" />}>
              Back to Marketplace
            </AnimatedButton>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-bold text-text-primary">Filter Orders</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    statusFilter === status
                      ? 'bg-accent-primary text-white shadow-glow'
                      : 'glass-card-hover border border-border-medium hover:border-accent-secondary/50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading your orders..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card text-center py-12">
            <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No orders found</h3>
            <p className="text-text-secondary mb-6">
              {orders.length === 0
                ? "You haven't made any purchases yet. Start shopping in the marketplace!"
                : 'No orders match your search criteria.'}
            </p>
            {orders.length === 0 && (
              <Link href="/marketplace">
                <AnimatedButton variant="primary">Browse Marketplace</AnimatedButton>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
            {filteredOrders.map((order, index) => (
              <motion.div key={order.id} variants={fadeInUp}>
                <div className="glass-card-hover p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <h3 className="text-lg font-semibold text-text-primary">
                        {order.description || 'Marketplace Purchase'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {order.txHash && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">
                            {order.txHash.slice(0, 8)}...{order.txHash.slice(-6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent-primary mb-1">
                      {Math.abs(order.amount).toFixed(2)} {order.currency}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {order.amount < 0 ? 'Paid' : 'Received'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}


