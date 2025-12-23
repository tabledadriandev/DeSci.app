/**
 * Step 10: First Task
 */

'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface FirstTaskStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function FirstTaskStep({
  nextStep,
}: FirstTaskStepProps) {
  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className="glass-card p-8 rounded-2xl"
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-success" />
        </motion.div>

        <h2 className="text-3xl font-bold text-text-primary mb-4">
          You're All Set!
        </h2>
        <p className="text-xl text-text-secondary mb-8">
          Your onboarding is complete. Let's start with your first task.
        </p>

        <div className="glass-card p-6 rounded-xl mb-8 text-left">
          <h3 className="font-semibold text-text-primary mb-3">
            Your First Task
          </h3>
          <p className="text-text-secondary mb-4">
            Complete your first health log entry to earn your first $TA tokens
            and unlock more features.
          </p>
          <div className="flex items-center gap-2 text-primary">
            <span className="font-semibold">+50 $TA</span>
            <span className="text-text-secondary">reward waiting</span>
          </div>
        </div>

        <button
          onClick={nextStep}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <span>Complete Onboarding</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
