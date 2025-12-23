/**
 * Step 9: Dashboard Tour
 */

'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Heart, Zap } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface DashboardTourStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function DashboardTourStep({
  nextStep,
}: DashboardTourStepProps) {
  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className="glass-card p-8 rounded-2xl"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Dashboard Tour
          </h2>
        </div>

        <p className="text-text-secondary mb-8">
          Here's what you'll find on your dashboard:
        </p>

        <div className="space-y-4 mb-8">
          <div className="glass-card p-6 rounded-xl flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                Health Metrics
              </h3>
              <p className="text-sm text-text-secondary">
                Track your biometrics, sleep, activity, and more in real-time
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex items-start gap-4">
            <Heart className="w-6 h-6 text-error flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                Biological Age
              </h3>
              <p className="text-sm text-text-secondary">
                See how your body age compares to your chronological age
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex items-start gap-4">
            <Zap className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                AI Insights
              </h3>
              <p className="text-sm text-text-secondary">
                Get personalized recommendations based on your data
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={nextStep}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
