/**
 * Comprehensive Onboarding Flow
 * 10-step onboarding process
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import AccountSetupStep from './steps/AccountSetupStep';
import MedicalHistoryStep from './steps/MedicalHistoryStep';
import WearablesStep from './steps/WearablesStep';
import FoodPreferencesStep from './steps/FoodPreferencesStep';
import GoalsStep from './steps/GoalsStep';
import FirstSyncStep from './steps/FirstSyncStep';
import AIPlanStep from './steps/AIPlanStep';
import DashboardTourStep from './steps/DashboardTourStep';
import FirstTaskStep from './steps/FirstTaskStep';

export interface OnboardingData {
  // Account Setup
  age?: number;
  gender?: string;
  name?: string;
  
  // Medical History
  recentTests?: any[];
  familyHistory?: string[];
  healthConditions?: string[];
  
  // Wearables
  connectedWearables?: string[];
  
  // Food Preferences
  dietaryRestrictions?: string[];
  foodAllergies?: string[];
  cuisinePreferences?: string[];
  
  // Goals
  primaryGoals?: string[];
  commitmentLevel?: 'low' | 'medium' | 'high';
  
  // Progress
  completedSteps?: number[];
}

const TOTAL_STEPS = 10;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    completedSteps: [],
  });

  const updateData = (step: number, data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({
      ...prev,
      ...data,
      completedSteps: [...(prev.completedSteps || []), step],
    }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    // Save onboarding data to backend
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      });
      
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      router.push('/dashboard');
    }
  };

  const skipOnboarding = () => {
    router.push('/dashboard');
  };

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: AccountSetupStep, title: 'Account Setup' },
    { component: MedicalHistoryStep, title: 'Medical History' },
    { component: WearablesStep, title: 'Connect Wearables' },
    { component: FoodPreferencesStep, title: 'Food Preferences' },
    { component: GoalsStep, title: 'Health Goals' },
    { component: FirstSyncStep, title: 'First Sync' },
    { component: AIPlanStep, title: 'AI Plan Generation' },
    { component: DashboardTourStep, title: 'Dashboard Tour' },
    { component: FirstTaskStep, title: 'First Task' },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <button
              onClick={skipOnboarding}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-success-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx + 1 <= currentStep
                  ? 'bg-primary'
                  : 'bg-border-light'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              data={onboardingData}
              updateData={(data) => updateData(currentStep, data)}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <span>{currentStep === TOTAL_STEPS ? 'Complete' : 'Next'}</span>
            {currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

