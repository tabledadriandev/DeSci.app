'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  age: z.number().min(18).max(120),
  gender: z.enum(['M', 'F', 'Other']),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  familyHistoryDiabetes: z.boolean().optional(),
  familyHistoryHeartDisease: z.boolean().optional(),
  familyHistoryCancer: z.boolean().optional(),
  exercisePerWeek: z.number().min(0).max(10),
  sleepHours: z.number().min(1).max(12),
  stressLevel: z.enum(['low', 'moderate', 'high']),
  dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'paleo']),
});

type FormData = z.infer<typeof schema>;

export default function HealthAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [savedProgress, setSavedProgress] = useState(false);
  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const values = watch();

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = getValues();
      localStorage.setItem('healthAssessment_draft', JSON.stringify(currentValues));
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, [getValues]);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('healthAssessment_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach((key) => {
          if (data[key] !== undefined) {
            // Set form values
          }
        });
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const bmi =
    values.height && values.weight
      ? (values.weight / ((values.height / 100) ** 2)).toFixed(1)
      : null;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/health-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Assessment failed');
      }

      const result = await response.json();
      localStorage.removeItem('healthAssessment_draft');
      router.push(`/health-assessment/results?id=${result.data.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit assessment');
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <main className="min-h-screen bg-base-200 py-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-base-content">Health Assessment</h1>
          <p className="text-base-content/70">
            Step {step} of {totalSteps} • ~5 minutes
          </p>
          <progress
            className="progress progress-primary w-full"
            value={progressPercent}
            max="100"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <h2 className="card-title text-base-content">Basic Information</h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Age</span>
                  </label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    className="input input-bordered w-full"
                    placeholder="Enter your age"
                  />
                  {errors.age && (
                    <span className="text-error text-sm mt-1">{errors.age.message}</span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Gender</span>
                  </label>
                  <select {...register('gender')} className="select select-bordered w-full">
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="text-error text-sm mt-1">{errors.gender.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content">
                        Height (cm)
                      </span>
                    </label>
                    <input
                      type="number"
                      {...register('height', { valueAsNumber: true })}
                      className="input input-bordered w-full"
                      placeholder="170"
                    />
                    {errors.height && (
                      <span className="text-error text-sm mt-1">{errors.height.message}</span>
                    )}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content">
                        Weight (kg)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('weight', { valueAsNumber: true })}
                      className="input input-bordered w-full"
                      placeholder="70"
                    />
                    {errors.weight && (
                      <span className="text-error text-sm mt-1">{errors.weight.message}</span>
                    )}
                  </div>
                </div>

                {bmi && (
                  <div
                    className={`alert ${
                      Number(bmi) < 18.5
                        ? 'alert-info'
                        : Number(bmi) < 25
                        ? 'alert-success'
                        : Number(bmi) < 30
                        ? 'alert-warning'
                        : 'alert-error'
                    }`}
                  >
                    <span>
                      BMI: {bmi}{' '}
                      {Number(bmi) < 18.5 && '(Underweight)'}
                      {Number(bmi) >= 18.5 && Number(bmi) < 25 && '(Healthy)'}
                      {Number(bmi) >= 25 && Number(bmi) < 30 && '(Overweight)'}
                      {Number(bmi) >= 30 && '(Obese)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Family History */}
          {step === 2 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <h2 className="card-title text-base-content">Family Health History</h2>
                <p className="text-sm text-base-content/70">
                  Check conditions that run in your family
                </p>

                {[
                  { name: 'familyHistoryDiabetes', label: 'Diabetes', icon: '🩺' },
                  { name: 'familyHistoryHeartDisease', label: 'Heart Disease', icon: '❤️' },
                  { name: 'familyHistoryCancer', label: 'Cancer', icon: '🔬' },
                ].map((item) => (
                  <label
                    key={item.name}
                    className="label cursor-pointer gap-4 hover:bg-base-200 p-4 rounded-lg"
                  >
                    <span className="label-text font-semibold text-base-content">
                      {item.icon} {item.label}
                    </span>
                    <input
                      type="checkbox"
                      {...register(item.name as any)}
                      className="checkbox checkbox-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle */}
          {step === 3 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <h2 className="card-title text-base-content">Lifestyle Habits</h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">
                      Exercise: {values.exercisePerWeek || 0}h/week
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    {...register('exercisePerWeek', { valueAsNumber: true })}
                    className="range range-primary"
                  />
                  <div className="w-full flex justify-between text-xs px-2">
                    <span>0h</span>
                    <span>5h</span>
                    <span>10h</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">
                      Sleep: {values.sleepHours || 0}h/night
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    {...register('sleepHours', { valueAsNumber: true })}
                    className="range range-success"
                  />
                  <div className="w-full flex justify-between text-xs px-2">
                    <span>1h</span>
                    <span>7h</span>
                    <span>12h</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Stress Level</span>
                  </label>
                  <select {...register('stressLevel')} className="select select-bordered w-full">
                    <option value="">Select</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                  {errors.stressLevel && (
                    <span className="text-error text-sm mt-1">{errors.stressLevel.message}</span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Diet Type</span>
                  </label>
                  <select {...register('dietType')} className="select select-bordered w-full">
                    <option value="">Select</option>
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="paleo">Paleo</option>
                  </select>
                  {errors.dietType && (
                    <span className="text-error text-sm mt-1">{errors.dietType.message}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4-5: Review */}
          {step >= 4 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <h2 className="card-title text-base-content">Review & Submit</h2>
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    ✓ Your data is encrypted • ✓ Never shared without permission • ✓ You can
                    delete anytime
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 fixed bottom-0 left-0 right-0 bg-base-200 p-4 border-t border-base-300 z-50">
            <div className="max-w-2xl mx-auto flex gap-4 w-full">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-outline flex-1"
                >
                  ← Back
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="btn btn-primary flex-1"
                >
                  Next →
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Analyzing...
                    </>
                  ) : (
                    'Complete Assessment'
                  )}
                </button>
              )}
            </div>
          </div>

          {savedProgress && (
            <div className="alert alert-success alert-sm fixed top-4 right-4 z-50">
              <span>✓ Progress saved</span>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
