'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp } from '@/lib/animations/variants';
import { Clock, Sun, Sunrise, Sunset } from 'lucide-react';

export default function FastingTrackerPage() {
  const { address } = useAccount();
  const [fastingStart, setFastingStart] = useState<Date | null>(null);
  const [fastingType, setFastingType] = useState('16:8');
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);

    // Mock an active fast
    const lastFastStart = localStorage.getItem('mockFastingStart');
    if (lastFastStart) {
      setFastingStart(new Date(lastFastStart));
    }
  }, []);

  useEffect(() => {
    if (fastingStart) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - fastingStart.getTime();
        setElapsed(Math.floor(diff / 1000)); // seconds
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fastingStart]);

  const startFast = async () => {
    if (!address) return; // In a real app, this would require authentication

    const startTime = new Date();
    setFastingStart(startTime);
    localStorage.setItem('mockFastingStart', startTime.toISOString());

    // Simulate API call
    console.log('Fasting started:', startTime.toISOString());
  };

  const endFast = async () => {
    if (!address || !fastingStart) return;

    // Simulate API call
    console.log('Fasting ended. Duration:', elapsed, 'seconds');
    localStorage.removeItem('mockFastingStart');
    setFastingStart(null);
    setElapsed(0);
  };

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <h1 className="page-title">Fasting Tracker</h1>
          <p className="page-subtitle max-w-2xl">
            Monitor and optimize your intermittent fasting protocols for enhanced longevity.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading fasting data..." />
          </div>
        ) : (
          <>
            <motion.div className="glass-card p-8 text-center my-8" variants={fadeInUp}>
              {fastingStart ? (
                <>
                  <p className="text-text-secondary text-lg mb-2">Fasting in Progress</p>
                  <motion.div
                    className="text-7xl font-bold text-accent-primary mb-6 drop-shadow-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                  >
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </motion.div>
                  <AnimatedButton onClick={endFast} variant="primary">
                    End Fast
                  </AnimatedButton>
                </>
              ) : (
                <>
                  <p className="text-text-secondary text-lg mb-6">Start a New Fast</p>
                  <div className="mb-8">
                    <label className="form-label">Fasting Protocol</label>
                    <select
                      value={fastingType}
                      onChange={(e) => setFastingType(e.target.value)}
                      className="form-select w-full sm:w-auto"
                    >
                      <option value="16:8">16:8 (16h fast, 8h eat)</option>
                      <option value="18:6">18:6 (18h fast, 6h eat)</option>
                      <option value="20:4">20:4 (20h fast, 4h eat)</option>
                      <option value="OMAD">OMAD (One Meal A Day)</option>
                      <option value="24:0">24 Hour Fast</option>
                      <option value="36:0">36 Hour Fast</option>
                    </select>
                  </div>
                  <AnimatedButton onClick={startFast} variant="primary">
                    Start Fast
                  </AnimatedButton>
                </>
              )}
            </motion.div>

            {/* Circadian Rhythm Info */}
            <motion.div className="glass-card p-6" variants={fadeInUp}>
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Sun className="w-6 h-6 text-accent-primary" /> Circadian Rhythm Optimization
              </h2>
              <p className="text-text-secondary mb-4">
                Align your eating window with your body's natural circadian rhythm for optimal health benefits.
              </p>
              <div className="space-y-3">
                <div className="glass-card p-3 flex items-center gap-3">
                  <Sunrise className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-semibold text-text-primary">🌅 Morning (6 AM - 12 PM)</p>
                    <p className="text-sm text-text-secondary">Best time to break fast for metabolic benefits.</p>
                  </div>
                </div>
                <div className="glass-card p-3 flex items-center gap-3">
                  <Sun className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="font-semibold text-text-primary">☀️ Afternoon (12 PM - 6 PM)</p>
                    <p className="text-sm text-text-secondary">Optimal eating window for most people.</p>
                  </div>
                </div>
                <div className="glass-card p-3 flex items-center gap-3">
                  <Sunset className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="font-semibold text-text-primary">🌙 Evening (6 PM - 10 PM)</p>
                    <p className="text-sm text-text-secondary">Avoid eating late to support circadian rhythm.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}


