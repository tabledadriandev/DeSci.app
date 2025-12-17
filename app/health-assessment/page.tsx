'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Trophy, HeartPulse, Brain, Leaf, Scale, Users, Activity, Utensils, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';
import { fadeInUp } from '@/lib/animations/variants';
import Link from 'next/link';

interface AssessmentData {
  // Personal Health History
  chronicConditions: string[];
  pastSurgeries: string[];
  currentMedications: string[];
  
  // Family Medical History
  familyHistory: Array<{ condition: string; relation: string }>;
  
  // Lifestyle
  sleepHours: number | null;
  stressLevel: number | null;
  exerciseFrequency: string | null;
  exerciseType: string[];
  
  // Dietary
  mealFrequency: string | null;
  foodGroups: string[];
  dietaryRestrictions: string[];
  waterIntake: number | null;
  
  // Mental Health
  anxietyLevel: number | null;
  depressionIndicators: string[];
  moodStability: string | null;
  
  // Symptoms
  currentSymptoms: string[];
  symptomSeverity: Array<{ symptom: string; severity: number }>;
  concerns: string[];
}

const CHRONIC_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis',
  'Depression', 'Anxiety', 'Thyroid Issues', 'High Cholesterol', 'Obesity',
  'Sleep Apnea', 'Migraines', 'IBS', 'GERD', 'Other'
];

const EXERCISE_TYPES = [
  'Walking', 'Running', 'Cycling', 'Swimming', 'Weight Training',
  'Yoga', 'Pilates', 'Dancing', 'Sports', 'Other'
];

const FOOD_GROUPS = [
  'Fruits', 'Vegetables', 'Whole Grains', 'Lean Protein', 'Dairy',
  'Nuts & Seeds', 'Legumes', 'Healthy Fats'
];

const DEPRESSION_INDICATORS = [
  'Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep changes',
  'Appetite changes', 'Difficulty concentrating', 'Feelings of worthlessness',
  'Thoughts of self-harm'
];

export default function HealthAssessmentPage() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [riskScores, setRiskScores] = useState<any>(null);
  
  const [data, setData] = useState<AssessmentData>({
    chronicConditions: [],
    pastSurgeries: [],
    currentMedications: [],
    familyHistory: [],
    sleepHours: null,
    stressLevel: null,
    exerciseFrequency: null,
    exerciseType: [],
    mealFrequency: null,
    foodGroups: [],
    dietaryRestrictions: [],
    waterIntake: null,
    anxietyLevel: null,
    depressionIndicators: [],
    moodStability: null,
    currentSymptoms: [],
    symptomSeverity: [],
    concerns: [],
  });

  const steps = [
    { id: 'personal', title: 'Personal Health History', icon: HeartPulse },
    { id: 'family', title: 'Family Medical History', icon: Users },
    { id: 'lifestyle', title: 'Lifestyle Assessment', icon: Activity },
    { id: 'dietary', title: 'Dietary Habits', icon: Utensils },
    { id: 'mental', title: 'Mental Health', icon: Brain },
    { id: 'symptoms', title: 'Current Symptoms', icon: Zap },
    { id: 'review', title: 'Review & Submit', icon: CheckCircle },
  ];

  const handleSubmit = async () => {
    if (!address) {
      showToast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to complete the assessment.',
      });
      return;
    }
    setLoading(true);

    try {
      // Calculate risk scores
      const scores = calculateRiskScores(data);
      
      const response = await fetch('/api/health/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          ...data,
          ...scores,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setRiskScores(result.riskScores);
        setCompleted(true);
        showToast({
          variant: 'success',
          title: 'Assessment Complete!',
          description: 'Your health assessment has been saved. View your personalized longevity protocol next.',
        });
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to submit assessment' }));
        showToast({
          variant: 'error',
          title: 'Submission Failed',
          description: error.error || 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      showToast({
        variant: 'error',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScores = (data: AssessmentData) => {
    let heartDiseaseRisk = 0;
    let diabetesRisk = 0;
    let hypertensionRisk = 0;
    let strokeRisk = 0;
    let metabolicRisk = 0;

    // Heart Disease Risk (Framingham-inspired)
    if (data.chronicConditions.includes('High Cholesterol')) heartDiseaseRisk += 15;
    if (data.chronicConditions.includes('Hypertension')) heartDiseaseRisk += 20;
    if (data.chronicConditions.includes('Diabetes')) heartDiseaseRisk += 25;
    if (data.exerciseFrequency === 'rarely' || data.exerciseFrequency === 'never') heartDiseaseRisk += 10;
    if (data.stressLevel && data.stressLevel > 7) heartDiseaseRisk += 10;
    if (data.familyHistory.some(f => f.condition.includes('Heart'))) heartDiseaseRisk += 15;

    // Diabetes Risk
    if (data.chronicConditions.includes('Diabetes')) diabetesRisk = 100;
    else {
      if (data.familyHistory.some(f => f.condition.includes('Diabetes'))) diabetesRisk += 30;
      if (data.exerciseFrequency === 'rarely' || data.exerciseFrequency === 'never') diabetesRisk += 20;
      if (!data.foodGroups.includes('Whole Grains') || !data.foodGroups.includes('Vegetables')) diabetesRisk += 15;
    }

    // Hypertension Risk
    if (data.chronicConditions.includes('Hypertension')) hypertensionRisk = 100;
    else {
      if (data.stressLevel && data.stressLevel > 7) hypertensionRisk += 20;
      if (data.familyHistory.some(f => f.condition.includes('Hypertension'))) hypertensionRisk += 25;
      if (data.waterIntake && data.waterIntake < 2) hypertensionRisk += 10;
    }

    // Stroke Risk
    if (data.chronicConditions.includes('Hypertension')) strokeRisk += 30;
    if (data.chronicConditions.includes('Heart Disease')) strokeRisk += 25;
    if (data.familyHistory.some(f => f.condition.includes('Stroke'))) strokeRisk += 20;

    // Metabolic Syndrome Risk
    if (data.chronicConditions.includes('High Cholesterol')) metabolicRisk += 20;
    if (data.chronicConditions.includes('Hypertension')) metabolicRisk += 20;
    if (data.exerciseFrequency === 'rarely' || data.exerciseFrequency === 'never') metabolicRisk += 15;
    if (data.foodGroups.length < 4) metabolicRisk += 15;

    const overallRisk = Math.min(100, (heartDiseaseRisk + diabetesRisk + hypertensionRisk + strokeRisk + metabolicRisk) / 5);

    return {
      heartDiseaseRisk: Math.min(100, heartDiseaseRisk),
      diabetesRisk: Math.min(100, diabetesRisk),
      hypertensionRisk: Math.min(100, hypertensionRisk),
      strokeRisk: Math.min(100, strokeRisk),
      metabolicSyndromeRisk: Math.min(100, metabolicRisk),
      overallRiskScore: overallRisk,
    };
  };

  if (completed && riskScores) {
    return (
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Assessment Complete
            </h1>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-accent-primary" /> Your Risk Scores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(riskScores).map(([key, value]: [string, any]) => (
                    <motion.div key={key} variants={fadeInUp} className="glass-card p-4">
                      <p className="text-sm text-text-secondary mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-3xl font-bold text-accent-primary mb-2">
                        {typeof value === 'number' ? value.toFixed(1) : value}%
                      </p>
                      <ProgressBar
                        value={value}
                        max={100}
                        color={value < 30 ? 'success' : value < 60 ? 'warning' : 'error'}
                        size="sm"
                        animated
                        showValue={false}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-border-medium">
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent-primary" /> Next Steps
                </h2>
                <ul className="space-y-3 text-text-secondary list-disc pl-5">
                  <li>Review your personalized longevity protocol.</li>
                  <li>Start tracking biomarkers regularly.</li>
                  <li>Log daily symptoms and habits.</li>
                  <li>Schedule follow-up assessments.</li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/wellness-plan">
                    <AnimatedButton>
                      View Your Longevity Protocol
                    </AnimatedButton>
                  </Link>
                  <Link href="/biomarkers">
                    <AnimatedButton variant="secondary">
                      Go to Lab Results & Biomarkers
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <motion.div className="glass-card p-6 my-8" variants={fadeInUp}>
            <ProgressBar
              value={((currentStep + 1) / steps.length) * 100}
              label={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`}
              showValue={false}
              size="md"
            />
            <div className="flex justify-between mt-4 text-xs text-text-tertiary">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <Icon className={`w-5 h-5 ${idx <= currentStep ? 'text-accent-primary' : 'text-text-tertiary'}`} />
                    <span className={`mt-1 hidden sm:block ${idx <= currentStep ? 'text-text-primary' : ''}`}>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            key={currentStep}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {steps[currentStep].title}
            </h2>

            {/* Step Content */}
            {currentStep === 0 && (
              <PersonalHealthStep data={data} setData={setData} />
            )}
            {currentStep === 1 && (
              <FamilyHistoryStep data={data} setData={setData} />
            )}
            {currentStep === 2 && (
              <LifestyleStep data={data} setData={setData} />
            )}
            {currentStep === 3 && (
              <DietaryStep data={data} setData={setData} />
            )}
            {currentStep === 4 && (
              <MentalHealthStep data={data} setData={setData} />
            )}
            {currentStep === 5 && (
              <SymptomsStep data={data} setData={setData} />
            )}
            {currentStep === 6 && (
              <ReviewStep data={data} />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <AnimatedButton
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </AnimatedButton>
              {currentStep < steps.length - 1 ? (
                <AnimatedButton
                  onClick={() => setCurrentStep(currentStep + 1)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  onClick={handleSubmit}
                  disabled={loading}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  {loading ? 'Submitting...' : 'Submit Assessment'}
                </AnimatedButton>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

// Step Components
function PersonalHealthStep({ data, setData }: { data: AssessmentData; setData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Chronic Conditions
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CHRONIC_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => {
                const updated = data.chronicConditions.includes(condition)
                  ? data.chronicConditions.filter(c => c !== condition)
                  : [...data.chronicConditions, condition];
                setData({ ...data, chronicConditions: updated });
              }}
              className={`glass-card-hover p-3 rounded-lg border-2 text-left transition ${
                data.chronicConditions.includes(condition)
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Past Surgeries (comma-separated)
        </label>
        <input
          type="text"
          value={data.pastSurgeries.join(', ')}
          onChange={(e) => setData({
            ...data,
            pastSurgeries: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          placeholder="e.g., Appendectomy, Knee surgery"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Current Medications (comma-separated)
        </label>
        <input
          type="text"
          value={data.currentMedications.join(', ')}
          onChange={(e) => setData({
            ...data,
            currentMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          placeholder="e.g., Metformin, Aspirin"
        />
      </div>
    </div>
  );
}

function FamilyHistoryStep({ data, setData }: { data: AssessmentData; setData: any }) {
  const [condition, setCondition] = useState('');
  const [relation, setRelation] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Add Family Medical History
        </label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="flex-1 px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            placeholder="Condition (e.g., Heart Disease)"
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          >
            <option value="">Relation</option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Grandparent">Grandparent</option>
            <option value="Aunt/Uncle">Aunt/Uncle</option>
            <option value="Other">Other</option>
          </select>
          <AnimatedButton
            type="button"
            onClick={() => {
              if (condition && relation) {
                setData({
                  ...data,
                  familyHistory: [...data.familyHistory, { condition, relation }]
                });
                setCondition('');
                setRelation('');
              }
            }}
          >
            Add
          </AnimatedButton>
        </div>
        <div className="space-y-2">
          {data.familyHistory.map((item, idx) => (
            <div key={idx} className="glass-card p-3 flex items-center justify-between">
              <span>{item.condition} ({item.relation})</span>
              <AnimatedButton
                type="button"
                onClick={() => setData({
                  ...data,
                  familyHistory: data.familyHistory.filter((_, i) => i !== idx)
                })}
                variant="ghost"
              >
                Remove
              </AnimatedButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LifestyleStep({ data, setData }: { data: AssessmentData; setData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Average Sleep Hours per Night
        </label>
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={data.sleepHours || ''}
          onChange={(e) => setData({ ...data, sleepHours: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Stress Level (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={data.stressLevel || 5}
            onChange={(e) => setData({ ...data, stressLevel: parseInt(e.target.value) })}
            className="flex-1 h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
          <span className="text-2xl font-bold text-accent-primary w-12 text-center">
            {data.stressLevel || 5}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Exercise Frequency
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['daily', 'weekly', 'rarely', 'never'].map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setData({ ...data, exerciseFrequency: freq })}
              className={`glass-card-hover p-3 rounded-lg border-2 text-left transition ${
                data.exerciseFrequency === freq
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Exercise Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                const updated = data.exerciseType.includes(type)
                  ? data.exerciseType.filter(t => t !== type)
                  : [...data.exerciseType, type];
                setData({ ...data, exerciseType: updated });
              }}
              className={`glass-card-hover p-3 rounded-lg border-2 text-left transition ${
                data.exerciseType.includes(type)
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DietaryStep({ data, setData }: { data: AssessmentData; setData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Meals per Day
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['3x', '4x', '5x+'].map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setData({ ...data, mealFrequency: freq })}
              className={`glass-card-hover p-3 rounded-lg border-2 text-left transition ${
                data.mealFrequency === freq
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Food Groups Regularly Consumed
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FOOD_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => {
                const updated = data.foodGroups.includes(group)
                  ? data.foodGroups.filter(g => g !== group)
                  : [...data.foodGroups, group];
                setData({ ...data, foodGroups: updated });
              }}
              className={`glass-card-hover p-3 rounded-lg border-2 text-left transition ${
                data.foodGroups.includes(group)
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Daily Water Intake (liters)
        </label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={data.waterIntake || ''}
          onChange={(e) => setData({ ...data, waterIntake: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        />
      </div>
    </div>
  );
}

function MentalHealthStep({ data, setData }: { data: AssessmentData; setData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Anxiety Level (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={data.anxietyLevel || 5}
            onChange={(e) => setData({ ...data, anxietyLevel: parseInt(e.target.value) })}
            className="flex-1 h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
          <span className="text-2xl font-bold text-accent-primary w-12 text-center">
            {data.anxietyLevel || 5}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Depression Indicators
        </label>
        <div className="grid grid-cols-2 gap-3">
          {DEPRESSION_INDICATORS.map((indicator) => (
            <button
              key={indicator}
              type="button"
              onClick={() => {
                const updated = data.depressionIndicators.includes(indicator)
                  ? data.depressionIndicators.filter(i => i !== indicator)
                  : [...data.depressionIndicators, indicator];
                setData({ ...data, depressionIndicators: updated });
              }}
              className={`glass-card-hover p-3 rounded-lg border-2 text-left transition ${
                data.depressionIndicators.includes(indicator)
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {indicator}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Mood Stability
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['stable', 'variable', 'unstable'].map((stability) => (
            <button
              key={stability}
              type="button"
              onClick={() => setData({ ...data, moodStability: stability })}
              className={`glass-card-hover p-3 rounded-lg border-2 transition ${
                data.moodStability === stability
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-medium hover:border-accent-secondary/50'
              }`}
            >
              {stability.charAt(0).toUpperCase() + stability.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SymptomsStep({ data, setData }: { data: AssessmentData; setData: any }) {
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState(5);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Add Current Symptom
        </label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            className="flex-1 px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            placeholder="e.g., Headaches, Fatigue"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">Severity:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="flex-1 h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <span className="text-2xl font-bold text-accent-primary w-12 text-center">{severity}</span>
          </div>
          <AnimatedButton
            type="button"
            onClick={() => {
              if (symptom) {
                setData({
                  ...data,
                  currentSymptoms: [...data.currentSymptoms, symptom],
                  symptomSeverity: [...data.symptomSeverity, { symptom, severity }]
                });
                setSymptom('');
                setSeverity(5);
              }
            }}
          >
            Add
          </AnimatedButton>
        </div>
        <div className="space-y-2">
          {data.symptomSeverity.map((item, idx) => (
            <div key={idx} className="glass-card p-3 flex items-center justify-between">
              <span>{item.symptom} (Severity: {item.severity}/10)</span>
              <AnimatedButton
                type="button"
                onClick={() => {
                  setData({
                    ...data,
                    currentSymptoms: data.currentSymptoms.filter((_, i) => i !== idx),
                    symptomSeverity: data.symptomSeverity.filter((_, i) => i !== idx)
                  });
                }}
                variant="ghost"
              >
                Remove
              </AnimatedButton>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Health Concerns
        </label>
        <textarea
          value={data.concerns.join('\n')}
          onChange={(e) => setData({
            ...data,
            concerns: e.target.value.split('\n').filter(Boolean)
          })}
          className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[120px] resize-y"
          rows={4}
          placeholder="List any health concerns or questions..."
        />
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: AssessmentData }) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-semibold text-text-primary mb-4">Review Your Assessment</h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <div>
            <strong>Chronic Conditions:</strong> {data.chronicConditions.length > 0 ? data.chronicConditions.join(', ') : 'None'}
          </div>
          <div>
            <strong>Family History:</strong> {data.familyHistory.length} conditions
          </div>
          <div>
            <strong>Sleep:</strong> {data.sleepHours || 'Not specified'} hours
          </div>
          <div>
            <strong>Exercise:</strong> {data.exerciseFrequency || 'Not specified'}
          </div>
          <div>
            <strong>Stress Level:</strong> {data.stressLevel || 'Not specified'}/10
          </div>
          <div>
            <strong>Symptoms:</strong> {data.currentSymptoms.length} logged
          </div>
        </div>
      </div>
      <p className="text-text-secondary text-sm">
        Click "Submit Assessment" to calculate your personalized risk scores and receive recommendations.
      </p>
    </div>
  );
}

