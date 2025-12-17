'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Target, Heart, Activity, Apple, Clock, Stethoscope, Watch,
  ChevronRight, ChevronLeft, Check, Sparkles, Dna
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

interface OnboardingData {
  // Step 1: Personal Info
  gender: string;
  height: string;
  weight: string;
  
  // Step 2: Health Goals
  goals: string[];
  
  // Step 3: Current Conditions
  conditions: string[];
  
  // Step 4: Lifestyle
  activityLevel: string;
  sleepHours: string;
  stressLevel: string;
  
  // Step 5: Diet
  dietType: string;
  allergies: string[];
  
  // Step 6: Medical History
  medications: string;
  surgeries: string;
  familyHistory: string[];
  
  // Step 7: Wearables
  wearables: string[];
}

const STEPS = [
  { id: 1, title: 'About You', icon: User },
  { id: 2, title: 'Your Goals', icon: Target },
  { id: 3, title: 'Health Status', icon: Heart },
  { id: 4, title: 'Lifestyle', icon: Activity },
  { id: 5, title: 'Nutrition', icon: Apple },
  { id: 6, title: 'Medical History', icon: Stethoscope },
  { id: 7, title: 'Devices', icon: Watch },
];

const HEALTH_GOALS = [
  'Lose Weight', 'Build Muscle', 'Improve Sleep', 'Reduce Stress',
  'Increase Energy', 'Better Nutrition', 'Longevity', 'Mental Clarity',
  'Immune Support', 'Heart Health', 'Gut Health', 'Hormone Balance'
];

const HEALTH_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma',
  'Arthritis', 'Depression', 'Anxiety', 'Thyroid Issues',
  'High Cholesterol', 'Obesity', 'Sleep Apnea', 'Migraines',
  'IBS', 'GERD', 'None'
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { value: 'light', label: 'Lightly Active', desc: '1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', desc: '3-5 days/week' },
  { value: 'active', label: 'Very Active', desc: '6-7 days/week' },
  { value: 'athlete', label: 'Athlete', desc: 'Professional training' },
];

const DIET_TYPES = [
  'Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian',
  'Keto', 'Paleo', 'Mediterranean', 'Low-Carb', 'Gluten-Free'
];

const ALLERGIES = [
  'Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'None'
];

const FAMILY_HISTORY = [
  'Heart Disease', 'Diabetes', 'Cancer', 'Alzheimer\'s',
  'High Blood Pressure', 'Stroke', 'Autoimmune Disease', 'None'
];

const WEARABLES = [
  { id: 'apple', name: 'Apple Watch', icon: '⌚' },
  { id: 'fitbit', name: 'Fitbit', icon: '📱' },
  { id: 'oura', name: 'Oura Ring', icon: '💍' },
  { id: 'whoop', name: 'Whoop', icon: '🏋️' },
  { id: 'garmin', name: 'Garmin', icon: '🏃' },
  { id: 'samsung', name: 'Samsung Health', icon: '📊' },
  { id: 'none', name: 'None', icon: '❌' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    gender: '',
    height: '',
    weight: '',
    goals: [],
    conditions: [],
    activityLevel: '',
    sleepHours: '',
    stressLevel: '',
    dietType: '',
    allergies: [],
    medications: '',
    surgeries: '',
    familyHistory: [],
    wearables: [],
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    const arr = data[field] as string[];
    if (arr.includes(item)) {
      updateData(field, arr.filter(i => i !== item));
    } else {
      updateData(field, [...arr, item]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.gender && data.height && data.weight;
      case 2: return data.goals.length > 0;
      case 3: return data.conditions.length > 0;
      case 4: return data.activityLevel && data.sleepHours && data.stressLevel;
      case 5: return data.dietType;
      case 6: return true; // Optional
      case 7: return true; // Optional
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Save onboarding data
      localStorage.setItem('ta_onboarding_data', JSON.stringify(data));
      completeOnboarding();
      router.push('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-md border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center">
                <Dna className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Let's personalize your experience</h1>
                <p className="text-xs text-text-tertiary">Step {currentStep} of 7</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Skip for now
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 flex gap-1">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  step.id <= currentStep ? 'bg-accent-primary' : 'bg-border-light'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <StepContainer key="step1">
              <StepHeader 
                icon={User} 
                title="Tell us about yourself" 
                subtitle="This helps us personalize your health recommendations"
              />
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => updateData('gender', g.toLowerCase())}
                        className={cn(
                          'p-3 rounded-xl border text-sm font-medium transition-all',
                          data.gender === g.toLowerCase()
                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                            : 'border-border-light hover:border-accent-primary/50'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      value={data.height}
                      onChange={(e) => updateData('height', e.target.value)}
                      className="form-input"
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      value={data.weight}
                      onChange={(e) => updateData('weight', e.target.value)}
                      className="form-input"
                      placeholder="70"
                    />
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 2: Health Goals */}
          {currentStep === 2 && (
            <StepContainer key="step2">
              <StepHeader 
                icon={Target} 
                title="What are your health goals?" 
                subtitle="Select all that apply"
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HEALTH_GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleArrayItem('goals', goal)}
                    className={cn(
                      'p-3 rounded-xl border text-sm font-medium transition-all text-left',
                      data.goals.includes(goal)
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-light hover:border-accent-primary/50'
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 3: Health Conditions */}
          {currentStep === 3 && (
            <StepContainer key="step3">
              <StepHeader 
                icon={Heart} 
                title="Any current health conditions?" 
                subtitle="This helps us provide safer recommendations"
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HEALTH_CONDITIONS.map(condition => (
                  <button
                    key={condition}
                    onClick={() => toggleArrayItem('conditions', condition)}
                    className={cn(
                      'p-3 rounded-xl border text-sm font-medium transition-all text-left',
                      data.conditions.includes(condition)
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-light hover:border-accent-primary/50'
                    )}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 4: Lifestyle */}
          {currentStep === 4 && (
            <StepContainer key="step4">
              <StepHeader 
                icon={Activity} 
                title="Tell us about your lifestyle" 
                subtitle="Your daily habits affect your health recommendations"
              />
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Activity Level</label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => updateData('activityLevel', level.value)}
                        className={cn(
                          'w-full p-4 rounded-xl border text-left transition-all',
                          data.activityLevel === level.value
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-border-light hover:border-accent-primary/50'
                        )}
                      >
                        <div className="font-medium text-text-primary">{level.label}</div>
                        <div className="text-sm text-text-secondary">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Average Sleep (hours)</label>
                    <select
                      value={data.sleepHours}
                      onChange={(e) => updateData('sleepHours', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      {['<5', '5-6', '6-7', '7-8', '8-9', '9+'].map(h => (
                        <option key={h} value={h}>{h} hours</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Stress Level</label>
                    <select
                      value={data.stressLevel}
                      onChange={(e) => updateData('stressLevel', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      {['Low', 'Moderate', 'High', 'Very High'].map(s => (
                        <option key={s} value={s.toLowerCase()}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 5: Diet */}
          {currentStep === 5 && (
            <StepContainer key="step5">
              <StepHeader 
                icon={Apple} 
                title="What's your diet like?" 
                subtitle="We'll customize meal suggestions for you"
              />
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Diet Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {DIET_TYPES.map(diet => (
                      <button
                        key={diet}
                        onClick={() => updateData('dietType', diet.toLowerCase())}
                        className={cn(
                          'p-3 rounded-xl border text-sm font-medium transition-all',
                          data.dietType === diet.toLowerCase()
                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                            : 'border-border-light hover:border-accent-primary/50'
                        )}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Food Allergies/Intolerances</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ALLERGIES.map(allergy => (
                      <button
                        key={allergy}
                        onClick={() => toggleArrayItem('allergies', allergy)}
                        className={cn(
                          'p-2 rounded-lg border text-xs font-medium transition-all',
                          data.allergies.includes(allergy)
                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                            : 'border-border-light hover:border-accent-primary/50'
                        )}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 6: Medical History */}
          {currentStep === 6 && (
            <StepContainer key="step6">
              <StepHeader 
                icon={Stethoscope} 
                title="Medical History" 
                subtitle="Optional but helps with personalization"
              />
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Current Medications (optional)</label>
                  <textarea
                    value={data.medications}
                    onChange={(e) => updateData('medications', e.target.value)}
                    className="form-textarea"
                    placeholder="List any medications you're currently taking..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="form-label">Past Surgeries (optional)</label>
                  <textarea
                    value={data.surgeries}
                    onChange={(e) => updateData('surgeries', e.target.value)}
                    className="form-textarea"
                    placeholder="List any surgeries you've had..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="form-label">Family Health History</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FAMILY_HISTORY.map(condition => (
                      <button
                        key={condition}
                        onClick={() => toggleArrayItem('familyHistory', condition)}
                        className={cn(
                          'p-2 rounded-lg border text-xs font-medium transition-all',
                          data.familyHistory.includes(condition)
                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                            : 'border-border-light hover:border-accent-primary/50'
                        )}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 7: Wearables */}
          {currentStep === 7 && (
            <StepContainer key="step7">
              <StepHeader 
                icon={Watch} 
                title="Connect your devices" 
                subtitle="Sync data from your wearables for better insights"
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {WEARABLES.map(device => (
                  <button
                    key={device.id}
                    onClick={() => toggleArrayItem('wearables', device.id)}
                    className={cn(
                      'p-4 rounded-xl border transition-all flex flex-col items-center gap-2',
                      data.wearables.includes(device.id)
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-border-light hover:border-accent-primary/50'
                    )}
                  >
                    <span className="text-2xl">{device.icon}</span>
                    <span className="text-sm font-medium text-text-primary">{device.name}</span>
                    {data.wearables.includes(device.id) && (
                      <Check className="w-4 h-4 text-accent-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">You're all set!</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Based on your profile, we'll create personalized health recommendations and track your progress towards your goals.
                    </p>
                  </div>
                </div>
              </div>
            </StepContainer>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              currentStep === 1
                ? 'text-text-disabled cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all',
              canProceed()
                ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
                : 'bg-bg-elevated text-text-disabled cursor-not-allowed'
            )}
          >
            {currentStep === 7 ? (
              isSubmitting ? 'Saving...' : 'Complete Setup'
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// Helper Components
function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-accent-primary" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
    </div>
  );
}

