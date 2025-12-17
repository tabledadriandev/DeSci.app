'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Check,
  Home, Heart, Target, Utensils, Trophy, Users, ShoppingBag, 
  Activity, Brain, Pill, Calendar, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: string; // CSS selector to highlight
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Button text for action
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  hasCompletedTutorial: boolean;
  showWelcome: boolean;
  dismissWelcome: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Table d\'Adrian! 🎉',
    description: 'Your personal longevity and wellness companion. Let\'s take a quick tour of the key features that will help you on your health journey.',
    icon: Sparkles,
    position: 'center',
  },
  {
    id: 'health-score',
    title: 'Your Health Score',
    description: 'Track your overall health with our comprehensive scoring system. We analyze your biomarkers, habits, and lifestyle to give you actionable insights.',
    icon: Heart,
    position: 'center',
  },
  {
    id: 'ai-coach',
    title: 'AI Health Coach',
    description: 'Get personalized advice from our AI coach. Ask questions about nutrition, exercise, sleep, and more - available 24/7.',
    icon: Brain,
    position: 'center',
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Meals',
    description: 'Plan your meals, track calories and macros, and discover recipes tailored to your health goals and dietary preferences.',
    icon: Utensils,
    position: 'center',
  },
  {
    id: 'biomarkers',
    title: 'Biomarker Tracking',
    description: 'Log and monitor your vital health markers - from blood pressure to glucose levels. Get alerts when something needs attention.',
    icon: Activity,
    position: 'center',
  },
  {
    id: 'gamification',
    title: 'Challenges & Rewards',
    description: 'Stay motivated with daily challenges, earn tokens, climb leaderboards, and unlock achievements as you progress.',
    icon: Trophy,
    position: 'center',
  },
  {
    id: 'community',
    title: 'Community & Support',
    description: 'Connect with like-minded individuals, join health groups, share recipes, and support each other on the wellness journey.',
    icon: Users,
    position: 'center',
  },
  {
    id: 'marketplace',
    title: 'Marketplace & Services',
    description: 'Access premium supplements, test kits, chef services, and telemedicine consultations - all in one place.',
    icon: ShoppingBag,
    position: 'center',
  },
  {
    id: 'governance',
    title: 'Governance & Staking',
    description: 'Participate in platform decisions, stake your tokens, and earn rewards. Your voice matters in shaping the future of DeSci.',
    icon: Wallet,
    position: 'center',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'Start by completing your health assessment to get personalized recommendations. We\'re excited to be part of your wellness journey!',
    icon: Check,
    position: 'center',
    action: 'Start Health Assessment',
  },
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user has completed tutorial
    const completed = localStorage.getItem('ta_tutorial_completed');
    const welcomed = localStorage.getItem('ta_welcome_shown');
    
    if (!completed) {
      setHasCompletedTutorial(false);
    }
    if (!welcomed) {
      // Show welcome after a short delay
      const timer = setTimeout(() => setShowWelcome(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setShowWelcome(false);
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTutorial(true);
    localStorage.setItem('ta_tutorial_completed', 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTutorial();
    }
  }, [currentStep, endTutorial]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    endTutorial();
  }, [endTutorial]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('ta_welcome_shown', 'true');
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: TUTORIAL_STEPS.length,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        hasCompletedTutorial,
        showWelcome,
        dismissWelcome,
      }}
    >
      {children}
      
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && !hasCompletedTutorial && (
          <WelcomeModal onStart={startTutorial} onSkip={dismissWelcome} />
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {isActive && (
          <TutorialOverlay
            step={TUTORIAL_STEPS[currentStep]}
            stepNumber={currentStep + 1}
            totalSteps={TUTORIAL_STEPS.length}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTutorial}
          />
        )}
      </AnimatePresence>
    </TutorialContext.Provider>
  );
}

function WelcomeModal({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-bg-surface rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Decorative Header */}
        <div className="relative h-40 bg-gradient-to-br from-accent-primary via-blue-azure to-accent-secondary overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/30"
              initial={{ 
                x: Math.random() * 400, 
                y: Math.random() * 160,
                scale: 0 
              }}
              animate={{ 
                y: [null, Math.random() * -50 - 20],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary text-center">
            Welcome to Table d'Adrian! 🌟
          </h2>
          <p className="mt-3 text-text-secondary text-center">
            Your journey to optimal health starts here. Let us show you around and help you make the most of your experience.
          </p>

          {/* Feature highlights */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Heart, label: 'Health Tracking' },
              { icon: Brain, label: 'AI Coaching' },
              { icon: Trophy, label: 'Rewards' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-bg-elevated">
                <Icon className="w-6 h-6 mx-auto text-accent-primary" />
                <p className="mt-1 text-xs text-text-secondary">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={onStart}
              className="w-full py-3 px-4 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Take the Tour
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSkip}
              className="w-full py-3 px-4 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors font-medium"
            >
              I'll explore on my own
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TutorialOverlay({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TutorialStep;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const Icon = step.icon;
  const isLastStep = stepNumber === totalSteps;
  const isFirstStep = stepNumber === 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      {/* Skip button */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        key={step.id}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-bg-surface rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-bg-elevated">
          <motion.div
            className="h-full bg-accent-primary"
            initial={{ width: `${((stepNumber - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg"
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Content */}
          <div className="mt-5 text-center">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-bold text-text-primary"
            >
              {step.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-text-secondary leading-relaxed"
            >
              {step.description}
            </motion.p>
          </div>

          {/* Step indicator */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i + 1 === stepNumber
                    ? 'w-6 bg-accent-primary'
                    : i + 1 < stepNumber
                    ? 'bg-accent-primary/50'
                    : 'bg-border-light'
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={isFirstStep}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                isFirstStep
                  ? 'bg-bg-elevated text-text-disabled cursor-not-allowed'
                  : 'bg-bg-elevated text-text-primary hover:bg-border-light'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={onNext}
              className="flex-1 py-2.5 px-4 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {isLastStep ? (step.action || 'Finish') : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Export a button to restart the tutorial
export function TutorialButton({ className }: { className?: string }) {
  const { startTutorial } = useTutorial();

  return (
    <button
      onClick={startTutorial}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors',
        className
      )}
    >
      <Sparkles className="w-4 h-4" />
      View Tutorial
    </button>
  );
}

