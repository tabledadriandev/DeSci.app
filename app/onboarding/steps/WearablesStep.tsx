/**
 * Step 4: Connect Wearables
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Watch, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface WearablesStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const wearables = [
  { id: 'oura', name: 'Oura Ring', icon: '💍' },
  { id: 'apple', name: 'Apple Health', icon: '🍎' },
  { id: 'google', name: 'Google Fit', icon: '📱' },
  { id: 'whoop', name: 'WHOOP', icon: '⌚' },
  { id: 'strava', name: 'Strava', icon: '🏃' },
  { id: 'fitbit', name: 'Fitbit', icon: '⌚' },
];

export default function WearablesStep({
  data,
  updateData,
  nextStep,
}: WearablesStepProps) {
  const [connected, setConnected] = useState<string[]>(
    data.connectedWearables || []
  );

  const handleConnect = (wearableId: string) => {
    if (!connected.includes(wearableId)) {
      const newConnected = [...connected, wearableId];
      setConnected(newConnected);
      updateData({ connectedWearables: newConnected });
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className="glass-card p-8 rounded-2xl"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Watch className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Connect Wearables
          </h2>
        </div>

        <p className="text-text-secondary mb-6">
          Connect your wearable devices to automatically sync health data. You
          can add more later.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {wearables.map((wearable) => (
            <button
              key={wearable.id}
              onClick={() => handleConnect(wearable.id)}
              disabled={connected.includes(wearable.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                connected.includes(wearable.id)
                  ? 'bg-success/10 border-success text-success'
                  : 'bg-bg-elevated border-border-light text-text-primary hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wearable.icon}</span>
                  <span className="font-medium">{wearable.name}</span>
                </div>
                {connected.includes(wearable.id) && (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
            </button>
          ))}
        </div>

        {connected.length > 0 && (
          <div className="mb-6 p-4 bg-success/10 rounded-lg">
            <p className="text-sm text-success font-medium">
              {connected.length} device{connected.length > 1 ? 's' : ''}{' '}
              connected
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            {connected.length > 0 ? 'Continue' : 'Skip for Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
