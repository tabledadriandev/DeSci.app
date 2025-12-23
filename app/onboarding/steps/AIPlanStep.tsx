/**
 * Step 8: AI Plan Generation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface AIPlanStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function AIPlanStep({
  nextStep,
}: AIPlanStepProps) {
  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate AI plan generation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGenerating(false);
            setTimeout(() => nextStep(), 1500);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [nextStep]);

  return (
    <motion.div
      variants={glassEntranceAnimation}
      initial="initial"
      animate="animate"
      className="glass-card p-8 rounded-2xl"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Generating Your AI Plan
          </h2>
        </div>

        {generating ? (
          <div className="space-y-6">
            <p className="text-text-secondary mb-8">
              Our AI is analyzing your data and creating a personalized longevity
              plan tailored to your goals and preferences.
            </p>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-text-primary font-medium">
                  Generating plan... {progress}%
                </span>
              </div>
              <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
              <div className="glass-card p-4 rounded-lg">
                <div className="font-semibold text-text-primary mb-1">
                  Analyzing Data
                </div>
                <div>Processing your health metrics...</div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="font-semibold text-text-primary mb-1">
                  Creating Plan
                </div>
                <div>Building personalized recommendations...</div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="font-semibold text-text-primary mb-1">
                  Optimizing
                </div>
                <div>Fine-tuning for your goals...</div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-text-primary">
              Your Plan is Ready!
            </h3>
            <p className="text-text-secondary">
              Your personalized longevity plan has been generated. Let's take a
              tour of your dashboard.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
