'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Pill, Target, Sun, Brain, Leaf, Zap, ShoppingCart, Filter } from 'lucide-react';
import Image from 'next/image';

type SupplementItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string | null;
  category: string;
  type: string;
  stock?: number | null;
};

const GOALS = [
  { id: 'longevity', label: 'Longevity', icon: Target },
  { id: 'sleep', label: 'Sleep', icon: Sun },
  { id: 'metabolic', label: 'Metabolic Health', icon: Zap },
  { id: 'gut-health', label: 'Gut Health', icon: Leaf },
  { id: 'performance', label: 'Performance', icon: Brain },
] as const;
type Goal = (typeof GOALS)[number]['id'];

export default function SupplementsPage() {
  const { address } = useAccount();
  const [activeGoal, setActiveGoal] = useState<Goal>('longevity');
  const [items, setItems] = useState<SupplementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for supplements
    setItems([
      { id: '1', name: 'NMN (Nicotinamide Mononucleotide)', description: 'A precursor to NAD+, vital for cellular energy and repair. Supports healthy aging.', price: 75, currency: '$TA', image: 'https://images.unsplash.com/photo-1547949003-ef6a67f0b5d5?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'anti-aging', type: 'supplement', stock: 20 },
      { id: '2', name: 'Magnesium L-Threonate', description: 'Crosses the blood-brain barrier to improve sleep quality and cognitive function.', price: 30, currency: '$TA', image: 'https://images.unsplash.com/photo-1576092762744-cf645479603f?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'sleep', type: 'supplement', stock: 15 },
      { id: '3', name: 'Berberine HCl', description: 'Supports healthy glucose metabolism and cardiovascular health.', price: 45, currency: '$TA', image: 'https://images.unsplash.com/photo-1594928509014-a90d40e11818?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'metabolic', type: 'supplement', stock: 10 },
      { id: '4', name: 'Probiotic Blend 50 Billion CFU', description: 'A powerful blend of beneficial bacteria to support a healthy gut microbiome.', price: 60, currency: '$TA', image: 'https://images.unsplash.com/photo-1589138656208-d25a83a152e1?auto=format&fit=crop&q=80&w=2874&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'gut-health', type: 'supplement', stock: 25 },
    ]);
    setLoading(false);
  }, [activeGoal]);

  const purchase = async (itemId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }
    setPurchasingId(itemId);
    // Simulate API call
    setTimeout(() => {
      alert('Purchase initiated (Mock)');
      setPurchasingId(null);
      // Update stock
      setItems(prev => prev.map(item => item.id === itemId && item.stock !== null ? { ...item, stock: item.stock - 1 } : item));
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Supplements Marketplace
            </h1>
            <p className="text-base text-text-secondary mt-1 max-w-2xl">
              Evidence-informed supplements curated for Table d&apos;Adrian protocols.
            </p>
          </div>
        </motion.div>

        {/* Goal Filters */}
        <motion.div className="glass-card p-4 mb-8" variants={fadeInUp}>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6 text-accent-primary" /> Filter by Goal
          </h2>
          <div className="flex flex-wrap gap-3">
            {GOALS.map((g) => {
              const Icon = g.icon;
              const isActive = activeGoal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGoal(g.id)}
                  className={`glass-card-hover flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-bio-gradient text-white shadow-glow'
                      : 'border border-border-medium hover:border-accent-secondary/50 text-text-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {g.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading supplements..." />
          </div>
        ) : items.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card text-center py-12">
            <Pill className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">No supplements listed yet</h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              As we onboard partner brands and finalize protocols, recommended supplements will start to appear here.
            </p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
            {items.map((item) => (
              <motion.div key={item.id} variants={fadeInUp}>
                <div className="glass-card-hover p-6 h-full flex flex-col">
                  {item.image && (
                    <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-bg-elevated">
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
                          {activeGoal.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-1">
                      <p className="text-2xl font-bold text-accent-primary flex items-center gap-1">
                        {item.price} {item.currency}
                      </p>
                      <AnimatedButton
                        type="button"
                        onClick={() => purchase(item.id)}
                        disabled={!address || purchasingId === item.id || (item.stock !== null && item.stock <= 0)}
                      >
                        {purchasingId === item.id ? (
                          'Purchasing…'
                        ) : item.stock !== null && item.stock <= 0 ? (
                          'Out of Stock'
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" /> Buy
                          </>
                        )}
                      </AnimatedButton>
                    </div>
                    {item.stock != null && (
                      <p className="text-xs text-text-tertiary mt-2">
                        {item.stock} in stock
                      </p>
                    )}
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



