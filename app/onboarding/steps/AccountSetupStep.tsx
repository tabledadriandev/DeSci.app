/**
 * Step 2: Account Setup
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface AccountSetupStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function AccountSetupStep({
  data,
  updateData,
  nextStep,
}: AccountSetupStepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    age: data.age?.toString() || '',
    gender: data.gender || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
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
          <User className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Account Setup
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Your name"
              className="w-full px-4 py-3 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Age
            </label>
            <input
              type="number"
              required
              min="18"
              max="120"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              placeholder="Your age"
              className="w-full px-4 py-3 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Gender
            </label>
            <select
              required
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full px-4 py-3 bg-bg-elevated border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
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
