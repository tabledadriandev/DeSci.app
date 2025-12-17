'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Beaker, Filter, ShoppingCart, Package, Dna, Droplet, Microscope, X, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function TestKitsPage() {
  const { address } = useAccount();
  const [testKits, setTestKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState<any>(null);

  useEffect(() => {
    // Mock data for test kits
    setTestKits([
      { id: '1', name: 'Comprehensive Blood Panel', description: 'Measures over 50 key biomarkers for a full health overview.', imageUrl: 'https://images.unsplash.com/photo-1576092762791-d21f859f71bf?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', price: 199, currency: 'USD', kitType: 'blood', biomarkersTested: ['Cholesterol', 'Glucose', 'Vitamin D', 'Testosterone', 'CRP'], processingTime: 5 },
      { id: '2', name: 'Gut Microbiome Analysis', description: 'Full shotgun sequencing of your gut microbiome to analyze diversity and function.', imageUrl: 'https://images.unsplash.com/photo-1628348083864-dd68c34f5466?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', price: 299, currency: 'USD', kitType: 'microbiome', biomarkersTested: ['Shannon Index', 'Akkermansia', 'Bifidobacterium'], processingTime: 14 },
    ]);
    setLoading(false);
  }, []);

  const handleOrder = (kit: any) => {
    if (!address) {
      alert('Please connect your wallet to order.');
      return;
    }
    setSelectedKit(kit);
  };
  
  const getKitTypeIcon = (kitType: string) => {
    switch (kitType) {
      case 'blood': return Droplet;
      case 'microbiome': return Beaker;
      case 'dna': return Dna;
      case 'microfluidic': return Microscope;
      default: return Package;
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Test Kits & Diagnostics
          </h1>
          <p className="text-base text-text-secondary max-w-3xl">
            Order at-home test kits to get deep insights into your biomarkers and take control of your health.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading test kits..." />
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
            {testKits.map((kit) => {
              const Icon = getKitTypeIcon(kit.kitType);
              return (
                <motion.div key={kit.id} variants={fadeInUp} className="glass-card-hover p-6 flex flex-col justify-between">
                  <div>
                    {kit.imageUrl && (
                      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-bg-elevated">
                        <Image src={kit.imageUrl} alt={kit.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-accent-primary" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent-primary">{kit.kitType}</p>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">{kit.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-3">{kit.description}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-medium">
                      <p className="text-2xl font-bold text-accent-primary">${kit.price}</p>
                      <AnimatedButton onClick={() => handleOrder(kit)} icon={<ShoppingCart className="w-4 h-4" />}>
                        Order Kit
                      </AnimatedButton>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <AnimatePresence>
          {selectedKit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setSelectedKit(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="glass-card max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Order Confirmation</h2>
                <p className="text-text-secondary mb-4">You are about to order the <span className="font-bold text-text-primary">{selectedKit.name}</span>.</p>
                <div className="glass-card p-4 mb-4">
                  <p className="text-3xl font-bold text-accent-primary">${selectedKit.price}</p>
                </div>
                <div className="flex gap-4">
                  <AnimatedButton variant="secondary" onClick={() => setSelectedKit(null)} className="flex-1">Cancel</AnimatedButton>
                  <AnimatedButton onClick={() => alert('Order placed! (Mock)')} className="flex-1">Confirm Order</AnimatedButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

