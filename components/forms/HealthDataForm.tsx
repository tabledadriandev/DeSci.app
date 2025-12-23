'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const healthDataSchema = z.object({
  age: z
    .number({ required_error: 'Age is required', invalid_type_error: 'Age must be a number' })
    .min(18, 'Age must be at least 18 years')
    .max(120, 'Age must be less than 120 years'),
  weight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be less than 300 kg')
    .optional(),
  height: z
    .number({ invalid_type_error: 'Height must be a number' })
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be less than 250 cm')
    .optional(),
  glucose: z
    .number({ invalid_type_error: 'Glucose must be a number' })
    .min(40, 'Glucose must be at least 40 mg/dL')
    .max(300, 'Glucose must be less than 300 mg/dL')
    .optional(),
  creatinine: z
    .number({ invalid_type_error: 'Creatinine must be a number' })
    .min(0.5, 'Creatinine must be at least 0.5 mg/dL')
    .max(5.0, 'Creatinine must be less than 5.0 mg/dL')
    .optional(),
  systolicBP: z
    .number({ invalid_type_error: 'Blood pressure must be a number' })
    .min(70, 'Systolic BP must be at least 70 mmHg')
    .max(250, 'Systolic BP must be less than 250 mmHg')
    .optional(),
});

type HealthData = z.infer<typeof healthDataSchema>;

interface HealthDataFormProps {
  onSubmit: (data: HealthData) => void | Promise<void>;
}

export function HealthDataForm({ onSubmit }: HealthDataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HealthData>({
    resolver: zodResolver(healthDataSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold text-base-content mb-6">Health Assessment</h2>

      {/* Age Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content">Age *</span>
          <span className="label-text-alt text-base-content/60">Required</span>
        </label>
        <input
          type="number"
          placeholder="Enter your age"
          className="input input-bordered w-full"
          {...register('age', { valueAsNumber: true })}
          aria-describedby="age-error"
          required
        />
        {errors.age && (
          <label className="label">
            <span className="label-text-alt text-error" id="age-error" role="alert">
              {errors.age.message}
            </span>
          </label>
        )}
      </div>

      {/* Weight Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content">Weight (kg) *</span>
        </label>
        <input
          type="number"
          step="0.1"
          placeholder="Enter weight in kg"
          className="input input-bordered w-full"
          {...register('weight', { valueAsNumber: true })}
        />
        {errors.weight && (
          <label className="label">
            <span className="label-text-alt text-error" role="alert">
              {errors.weight.message}
            </span>
          </label>
        )}
      </div>

      {/* Glucose Field with Tooltip */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content">
            Fasting Glucose (mg/dL) *
          </span>
          <span
            className="tooltip tooltip-right"
            data-tip="Measured after 8+ hours without food"
          >
            <span className="label-text-alt cursor-help text-info">?</span>
          </span>
        </label>
        <input
          type="number"
          step="0.1"
          placeholder="70-100 is normal"
          className="input input-bordered w-full"
          {...register('glucose', { valueAsNumber: true })}
        />
        {errors.glucose && (
          <label className="label">
            <span className="label-text-alt text-error" role="alert">
              {errors.glucose.message}
            </span>
          </label>
        )}
      </div>

      {/* Creatinine Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content">Creatinine (mg/dL)</span>
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="0.6-1.2 is normal"
          className="input input-bordered w-full"
          {...register('creatinine', { valueAsNumber: true })}
        />
        {errors.creatinine && (
          <label className="label">
            <span className="label-text-alt text-error" role="alert">
              {errors.creatinine.message}
            </span>
          </label>
        )}
      </div>

      {/* Systolic BP Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content">
            Systolic Blood Pressure (mmHg)
          </span>
        </label>
        <input
          type="number"
          placeholder="90-120 is normal"
          className="input input-bordered w-full"
          {...register('systolicBP', { valueAsNumber: true })}
        />
        {errors.systolicBP && (
          <label className="label">
            <span className="label-text-alt text-error" role="alert">
              {errors.systolicBP.message}
            </span>
          </label>
        )}
      </div>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Calculating...
            </>
          ) : (
            'Calculate Biological Age'
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="alert alert-info mt-4">
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
          Your data is encrypted and never shared with third parties.{' '}
          <a href="/privacy" className="link link-primary ml-1">
            Learn more
          </a>
        </span>
      </div>
    </form>
  );
}

