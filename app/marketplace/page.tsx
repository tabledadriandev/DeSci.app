'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { ShoppingBag, Package, Sparkles, CreditCard, Heart, Search, X, CheckCircle, Star, TrendingUp, ShoppingCart } from 'lucide-react';
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
          description: payload.message || 'Your wellness item has been purchased.',
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
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  Marketplace
                </h1>
                <p className="text-text-secondary text-lg">
                  Curated wellness products, services, and subscriptions aligned with your Table d'Adrian protocols
                </p>
              </div>
              {address && (
                <Link href="/marketplace/orders">
                  <AnimatedButton variant="secondary" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </AnimatedButton>
                </Link>
              )}
            </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search products, services, subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-text-tertiary" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.15 }}
            >
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                        : 'bg-white text-text-primary hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
            </motion.div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="premium-card">
                  <div className="skeleton h-40 w-full rounded-xl mb-4" />
                  <div className="skeleton h-5 w-2/3 rounded-md mb-2" />
                  <div className="skeleton h-3 w-full rounded-md mb-2" />
                  <div className="skeleton h-3 w-3/4 rounded-md mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-6 w-20 rounded-md" />
                    <div className="skeleton h-9 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
              {filteredItems.length === 0 ? (
                <AnimatedCard className="col-span-full">
                  <EmptyState
                    icon={Package}
                    title={searchQuery ? 'No results found' : 'No items in this category'}
                    description={
                      searchQuery
                        ? `We couldn't find any items matching "${searchQuery}". Try adjusting your search or browse other categories.`
                        : 'Check back soon for new wellness products and services in this category!'
                    }
                    action={
                      searchQuery
                        ? {
                            label: 'Clear Search',
                            onClick: () => setSearchQuery(''),
                            variant: 'secondary',
                          }
                        : {
                            label: 'View All Items',
                            onClick: () => setActiveCategory('all'),
                            variant: 'primary',
                          }
                    }
                  />
                </AnimatedCard>
              ) : (
                filteredItems.map((item, index) => (
                  <motion.div key={item.id} variants={staggerItem}>
                    <AnimatedCard hover delay={index * 0.05} className="h-full flex flex-col">
                      {item.image && (
                        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{item.name}</h3>
                          <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-semibold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-accent-primary">
                            {item.price} $tabledadrian
                          </div>
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
                    </AnimatedCard>
                  </motion.div>
                ))
              )}
              </motion.div>
            </div>
          )}

          {/* Item Detail Modal */}
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedItem(null)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-3xl font-bold text-text-primary">
                    {selectedItem.name}
                  </h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedItem.image && (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm font-semibold">
                      {selectedItem.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-sm font-semibold">
                      {selectedItem.category}
                    </span>
                    {selectedItem.stock !== null && (
                      <span className="px-3 py-1 bg-semantic-warning/10 text-semantic-warning rounded-full text-sm font-semibold">
                        {selectedItem.stock > 0 ? `${selectedItem.stock} in stock` : 'Out of stock'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Description</h3>
                    <p className="text-text-secondary leading-relaxed">{selectedItem.description}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Price</div>
                      <div className="text-3xl font-bold text-accent-primary">
                        {selectedItem.price} $tabledadrian
                      </div>
                    </div>
                    <AnimatedButton
                      variant="primary"
                      size="lg"
                      onClick={() => purchaseItem(selectedItem.id)}
                      disabled={purchasingId === selectedItem.id || (selectedItem.stock !== null && selectedItem.stock <= 0)}
                    >
                      {purchasingId === selectedItem.id ? (
                        'Processing...'
                      ) : selectedItem.stock !== null && selectedItem.stock <= 0 ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </AnimatedButton>
                  </div>
                </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Purchase Confirmation Modal */}
          {showPurchaseConfirm && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowPurchaseConfirm(false)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="max-w-md w-full bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  Confirm Purchase
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold text-text-primary mb-2">{selectedItem.name}</div>
                    <div className="text-2xl font-bold text-accent-primary">
                      {selectedItem.price} $tabledadrian
                    </div>
                  </div>

                  <div className="text-sm text-text-secondary">
                    By confirming, you agree to complete the transaction using your connected wallet.
                  </div>

                  <div className="flex gap-3">
                    <AnimatedButton
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setShowPurchaseConfirm(false);
                        setSelectedItem(null);
                      }}
                    >
                      Cancel
                    </AnimatedButton>
                    <AnimatedButton
                      variant="primary"
                      className="flex-1"
                      onClick={() => purchaseItem(selectedItem.id, true)}
                      disabled={purchasingId === selectedItem.id}
                    >
                      {purchasingId === selectedItem.id ? 'Processing...' : 'Confirm Purchase'}
                    </AnimatedButton>
                  </div>
                </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Purchase Success Animation */}
          {purchaseSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPurchaseSuccess(false)}>
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                >
                  <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <div className="w-20 h-20 bg-semantic-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-semantic-success" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">Purchase Successful!</h3>
                    <p className="text-text-secondary mb-6">
                      Your purchase has been confirmed. You can view your order history in your profile.
                    </p>
                    <AnimatedButton variant="primary" onClick={() => setPurchaseSuccess(false)}>
                      Continue Shopping
                    </AnimatedButton>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
