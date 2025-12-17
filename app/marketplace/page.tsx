'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { ShoppingBag, Package, Sparkles, CreditCard, Heart, Search, X, CheckCircle, Star, TrendingUp, ShoppingCart, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';

export default function MarketplacePage() {
  const { address } = useAccount();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'products' | 'services' | 'subscriptions' | 'treatments'
  >('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    void loadItems(activeCategory);
  }, [activeCategory]);

  const loadItems = async (category: typeof activeCategory) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category === 'products') params.set('type', 'product');
      if (category === 'services') params.set('type', 'service');
      if (category === 'subscriptions') params.set('type', 'subscription');
      if (category === 'treatments') params.set('type', 'treatment');

      const query = params.toString();
      const response = await fetch(`/api/marketplace${query ? `?${query}` : ''}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const purchaseItem = async (itemId: string, confirmed: boolean = false) => {
    if (!address) {
      showToast({
        title: 'Connect your wallet',
        description: 'Please connect your wallet to purchase marketplace items.',
        variant: 'info',
      });
      return;
    }

    if (!confirmed) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        setSelectedItem(item);
        setShowPurchaseConfirm(true);
      }
      return;
    }

    try {
      setPurchasingId(itemId);
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, itemId }),
      });

      const payload = await response.json();

      if (response.ok) {
        setPurchaseSuccess(true);
        setShowPurchaseConfirm(false);
        showToast({
          title: 'Purchase successful',
          description: payload.message || 'Your item has been purchased.',
          variant: 'success',
        });
        await loadItems(activeCategory);
        setTimeout(() => {
          setPurchaseSuccess(false);
          setSelectedItem(null);
        }, 3000);
      } else {
        showToast({
          title: 'Purchase failed',
          description: payload.error || 'Something went wrong while processing your purchase.',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      showToast({
        title: 'Purchase failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'error',
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const categories = [
    { id: 'all' as const, label: 'All', icon: ShoppingBag, color: 'from-blue-500 to-cyan-500' },
    { id: 'products' as const, label: 'Products', icon: Package, color: 'from-purple-500 to-indigo-500' },
    { id: 'services' as const, label: 'Services', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { id: 'treatments' as const, label: 'Treatments', icon: Heart, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="page-title">DeSci Marketplace</h1>
              <p className="page-subtitle max-w-2xl">
                Curated products, services, and subscriptions aligned with your longevity protocols.
              </p>
            </div>
            {address && (
              <Link href="/marketplace/orders">
                <AnimatedButton variant="secondary" size="sm" icon={<Package className="w-4 h-4" />}>
                  My Orders
                </AnimatedButton>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div className="section-card mb-6" variants={fadeInUp}>
          <div className="relative max-w-2xl w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search products, services, subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-12 pr-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-bg-elevated transition"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div className="glass-card p-4 mb-8" variants={fadeInUp}>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6 text-accent-primary" /> Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`glass-card-hover flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'border border-border-medium hover:border-accent-secondary/50 text-text-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading marketplace items..." />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.length === 0 ? (
              <motion.div variants={fadeInUp} className="glass-card col-span-full text-center py-12">
                <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
                <p className="text-text-secondary mb-6">
                  {searchQuery
                    ? `We couldn't find any items matching "${searchQuery}". Try adjusting your search or browse other categories.`
                    : 'Check back soon for new longevity products and services in this category!'}
                </p>
                {searchQuery && (
                  <AnimatedButton variant="secondary" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </AnimatedButton>
                )}
                {!searchQuery && activeCategory !== 'all' && (
                  <AnimatedButton onClick={() => setActiveCategory('all')}>
                    View All Items
                  </AnimatedButton>
                )}
              </motion.div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div key={item.id} variants={fadeInUp}>
                  <div className="glass-card-hover p-6 h-full flex flex-col">
                    {item.image && (
                      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-bg-elevated">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{item.name}</h3>
                          <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-semibold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-2xl font-bold text-accent-primary">
                          {item.price} {item.currency}
                        </p>
                        <div className="flex gap-2">
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            Details
                          </AnimatedButton>
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            onClick={() => purchaseItem(item.id)}
                            disabled={purchasingId === item.id || (item.stock !== null && item.stock <= 0)}
                          >
                            {purchasingId === item.id ? (
                              'Purchasing...'
                            ) : item.stock !== null && item.stock <= 0 ? (
                              'Out of Stock'
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Buy
                              </>
                            )}
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
