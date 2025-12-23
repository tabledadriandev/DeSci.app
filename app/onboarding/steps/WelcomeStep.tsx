/**
 * Step 1: Welcome
 */

'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, TrendingUp } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function WelcomeStep({
  nextStep,
}: WelcomeStepProps) {
  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className="glass-card p-12 rounded-2xl text-center"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6"
        >
          <Sparkles className="w-16 h-16 mx-auto text-primary" />
        </motion.div>

        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Welcome to Table d'Adrian
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          Your personalized longevity and wellness companion
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <Heart className="w-8 h-8 mx-auto mb-3 text-error" />
            <h3 className="font-semibold text-text-primary mb-2">
              Track Everything
            </h3>
            <p className="text-sm text-text-secondary">
              Wearables, food, medical results, and more
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-success" />
            <h3 className="font-semibold text-text-primary mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-sm text-text-secondary">
              Personalized recommendations based on your data
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-text-primary mb-2">
              Earn Tokens
            </h3>
            <p className="text-sm text-text-secondary">
              Contribute to research and earn $TA rewards
            </p>
          </div>
        </div>

        <p className="text-text-secondary mb-6">
          This onboarding will take about 10 minutes. We'll help you set up your
          profile and connect your devices.
        </p>

        <button
          onClick={nextStep}
          className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-lg font-semibold"
        >
          Get Started
        </button>
      </div>
    </motion.div>
  );
}
