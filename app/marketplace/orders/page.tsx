'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import Skeleton from '@/components/ui/Skeleton';
import { Package, Calendar, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceOrdersPage() {
  const { address } = useAccount();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (address) {
      loadOrders();
    }
  }, [address]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from /api/marketplace/orders
      // For now, we'll fetch transactions that are purchases
      const response = await fetch(`/api/transactions?userId=${address}&type=purchase`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return 'bg-gray-100 text-text-secondary border-gray-200';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    Order History
                  </h1>
                  <p className="text-text-secondary text-lg">
                    View all your marketplace purchases and transactions
                  </p>
                </div>
                <Link href="/marketplace">
                  <AnimatedButton variant="secondary" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    Back to Marketplace
                  </AnimatedButton>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        statusFilter === status
                          ? 'bg-accent-primary text-white shadow-lg'
                          : 'bg-white text-text-primary hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <AnimatedCard key={idx}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-12 w-24 rounded-lg" />
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <AnimatedCard className="text-center py-12">
              <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No orders found</h3>
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
            </AnimatedCard>
          ) : (
            <div className="space-y-4">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredOrders.map((order, index) => (
                  <motion.div key={order.id} variants={staggerItem}>
                    <AnimatedCard hover delay={index * 0.05}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
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
                          <div className="text-2xl font-bold text-accent-primary mb-1">
                            {Math.abs(order.amount).toFixed(2)} $tabledadrian
                          </div>
                          <div className="text-sm text-text-secondary">
                            {order.amount < 0 ? 'Paid' : 'Received'}
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

