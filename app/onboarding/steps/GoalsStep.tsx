/**
 * Step 6: Health Goals
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface GoalsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const goalOptions = [
  'Weight loss',
  'Muscle gain',
  'Better sleep',
  'Increased energy',
  'Longevity',
  'Mental clarity',
  'Better digestion',
  'Improved fitness',
];

export default function GoalsStep({
  data,
  updateData,
  nextStep,
}: GoalsStepProps) {
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(
    data.primaryGoals || []
  );
  const [commitmentLevel, setCommitmentLevel] = useState<
    'low' | 'medium' | 'high'
  >(data.commitmentLevel || 'medium');

  const toggleGoal = (goal: string) => {
    if (primaryGoals.includes(goal)) {
      setPrimaryGoals(primaryGoals.filter((g) => g !== goal));
    } else {
      setPrimaryGoals([...primaryGoals, goal]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      primaryGoals,
      commitmentLevel,
    });
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
          <Target className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">Health Goals</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              What are your primary health goals? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    primaryGoals.includes(goal)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-elevated border-border-light text-text-primary hover:border-primary'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Commitment Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCommitmentLevel(level)}
                  className={`px-6 py-4 rounded-lg border transition-colors capitalize ${
                    commitmentLevel === level
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-elevated border-border-light text-text-primary hover:border-primary'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-sm text-text-secondary mt-2">
              How committed are you to following your personalized plan?
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Continue
          </button>
        </form>
      </div>
    </motion.div>
  );
}
