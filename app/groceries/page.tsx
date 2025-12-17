'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Camera, ShoppingCart, Package, Plus, Check } from 'lucide-react';

export default function GroceriesPage() {
  const { address } = useAccount();
  const [groceryList, setGroceryList] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setGroceryList([
      { id: '1', name: 'Organic Spinach', quantity: 1, foodId: 'spinach-id', checked: false },
      { id: '2', name: 'Grass-fed Beef', quantity: 1, foodId: 'beef-id', checked: false },
      { id: '3', name: 'Blueberries', quantity: 2, foodId: 'blueberries-id', checked: true },
    ]);
    setLoading(false);
  }, [address]);

  const addItem = async () => {
    if (!newItem.trim()) return;
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      const item = { id: (Math.random() * 1000).toFixed(0), name: newItem, quantity: 1, checked: false };
      setGroceryList((prev) => [...prev, item]);
      setNewItem('');
      setLoading(false);
    }, 500);
  };

  const toggleCheckItem = (id: string) => {
    setGroceryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const scanBarcode = async () => {
    setScanning(true);
    // Simulate scanning and adding item
    setTimeout(() => {
      const scannedItem = { id: (Math.random() * 1000).toFixed(0), name: 'Organic Almond Milk', quantity: 1, foodId: 'almond-milk-id', checked: false };
      setGroceryList((prev) => [...prev, scannedItem]);
      setScanning(false);
      alert('Barcode scanned and item added: Organic Almond Milk');
    }, 2000);
  };

  const orderFromInstacart = async () => {
    alert('Ordering from Instacart is coming soon!');
  };

  const orderFromAmazon = async () => {
    alert('Ordering from Amazon Fresh is coming soon!');
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Smart Grocery List
            </h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Effortlessly manage your healthy food shopping with AI-powered suggestions.
            </p>
          </div>
          <AnimatedButton onClick={scanBarcode} disabled={scanning} size="sm" icon={<Camera className="w-4 h-4" />}>
            {scanning ? 'Scanning...' : 'Scan Barcode'}
          </AnimatedButton>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading grocery list..." />
          </div>
        ) : (
          <>
            {/* Add Item */}
            <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
              <h2 className="text-xl font-bold text-text-primary mb-4">Add New Item</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  placeholder="e.g., Organic Kale, Wild Salmon..."
                  className="flex-1 w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
                <AnimatedButton onClick={addItem} icon={<Plus className="w-5 h-5" />} disabled={!newItem.trim()}>
                  Add
                </AnimatedButton>
              </div>
            </motion.div>

            {/* Grocery List */}
            <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
              <h2 className="text-xl font-bold text-text-primary mb-4">Your Smart List</h2>
              {groceryList.length === 0 ? (
                <p className="text-text-secondary">No items yet. Add some groceries to get started!</p>
              ) : (
                <motion.ul className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
                  {groceryList.map((item) => (
                    <motion.li
                      key={item.id}
                      variants={fadeInUp}
                      className="glass-card-hover p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleCheckItem(item.id)}
                          className="w-5 h-5 rounded text-accent-primary focus:ring-accent-primary border-border-medium bg-bg-elevated"
                        />
                        <span className={`text-text-primary ${item.checked ? 'line-through text-text-tertiary' : ''}`}>
                          {item.name} {item.quantity > 1 && `x${item.quantity}`}
                        </span>
                      </div>
                      {item.foodId && (
                        <span className="text-xs text-semantic-success flex items-center gap-1">
                          <Check className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </motion.div>

            {/* One-Click Ordering */}
            {groceryList.length > 0 && (
              <motion.div className="glass-card p-6" variants={fadeInUp}>
                <h2 className="text-xl font-bold text-text-primary mb-4">One-Click Ordering</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatedButton onClick={orderFromInstacart} variant="secondary" icon={<ShoppingCart className="w-5 h-5" />}>
                    Order from Instacart
                  </AnimatedButton>
                  <AnimatedButton onClick={orderFromAmazon} variant="secondary" icon={<Package className="w-5 h-5" />}>
                    Order from Amazon Fresh
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}

