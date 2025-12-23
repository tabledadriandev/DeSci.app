/**
 * Step 7: First Sync
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface FirstSyncStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function FirstSyncStep({
  nextStep,
}: FirstSyncStepProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncing(false);
    setSynced(true);
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className="glass-card p-8 rounded-2xl"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <RefreshCw className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            First Data Sync
          </h2>
        </div>

        <p className="text-text-secondary mb-8">
          Let's sync your connected wearables and fetch your initial health data.
          This may take a few moments.
        </p>

        {!synced ? (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-primary font-medium">
                  Syncing data...
                </span>
                {syncing && (
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                )}
              </div>
              {syncing && (
                <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? 'Syncing...' : 'Start Sync'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-3 text-success"
            >
              <CheckCircle2 className="w-12 h-12" />
              <span className="text-xl font-semibold">Sync Complete!</span>
            </motion.div>
            <p className="text-text-secondary">
              Your data has been successfully synced. Moving to next step...
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
