'use client';

import { useState } from 'react';
import { useForm, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils/cn';
import { Info } from 'lucide-react';

const healthDataSchema = z.object({
  age: z.number().min(18).max(120),
  weight: z.number().min(30).max(300).optional(), // kg
  height: z.number().min(100).max(250).optional(), // cm
  bmi: z.number().optional(),
  biomarkers: z.object({
    glucose: z.number().min(40).max(300).optional(), // mg/dL
    creatinine: z.number().min(0.5).max(5.0).optional(), // mg/dL
    systolicBP: z.number().min(70).max(250).optional(), // mmHg
    cystatinC: z.number().min(0.3).max(5.0).optional(), // mg/L
    albumin: z.number().min(1.0).max(6.0).optional(), // g/dL
    totalCholesterol: z.number().min(50).max(500).optional(), // mg/dL
    hdlCholesterol: z.number().min(10).max(150).optional(), // mg/dL
    ldlCholesterol: z.number().min(10).max(300).optional(), // mg/dL
    triglycerides: z.number().min(10).max(1000).optional(), // mg/dL
  }).optional(),
});

type HealthDataFormData = z.infer<typeof healthDataSchema>;

interface HealthDataFormProps {
  onSubmit: (data: HealthDataFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function HealthDataForm({ onSubmit, isLoading = false }: HealthDataFormProps) {
  const form = useForm<HealthDataFormData>({
    resolver: zodResolver(healthDataSchema),
    defaultValues: {
      biomarkers: {},
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Age Input */}
      <FormField>
        <label htmlFor="age" className="block text-sm font-semibold text-slate-900 mb-2">
          Age
          <span className="text-red-600 ml-1" aria-label="required">*</span>
          <span className="ml-2 text-xs text-slate-500">(Required)</span>
        </label>
        <input
          id="age"
          type="number"
          {...form.register('age', { valueAsNumber: true })}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your age"
          aria-describedby="age-help"
          required
        />
        <p id="age-help" className="mt-1 text-xs text-slate-600">
          Chronological age (in years)
        </p>
        {form.formState.errors.age && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {form.formState.errors.age.message}
          </p>
        )}
      </FormField>

      {/* Biomarker Input with Smart Tooltips */}
      <BiomarkerInputGroup
        biomarker="glucose"
        label="Fasting Glucose"
        unit="mg/dL"
        normalRange={{ min: 70, max: 100 }}
        explanation="Measured after 8+ hours without food. High glucose indicates metabolic dysfunction."
        form={form}
      />

      <BiomarkerInputGroup
        biomarker="cystatinC"
        label="Cystatin C"
        unit="mg/L"
        normalRange={{ min: 0.6, max: 1.2 }}
        explanation="Kidney function marker. High values indicate reduced kidney filtration."
        form={form}
      />

      <BiomarkerInputGroup
        biomarker="albumin"
        label="Albumin"
        unit="g/dL"
        normalRange={{ min: 3.5, max: 5.0 }}
        explanation="Nutritional status and inflammation marker. Low values may indicate malnutrition or inflammation."
        form={form}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={form.formState.isSubmitting || isLoading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {form.formState.isSubmitting || isLoading
          ? 'Calculating...'
          : 'Calculate Biological Age'}
      </button>
    </form>
  );
}

function FormField({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

interface BiomarkerInputGroupProps {
  biomarker: string;
  label: string;
  unit: string;
  normalRange: { min: number; max: number };
  explanation: string;
  form: ReturnType<typeof useForm<HealthDataFormData>>;
}

function BiomarkerInputGroup({
  biomarker,
  label,
  unit,
  normalRange,
  explanation,
  form,
}: BiomarkerInputGroupProps) {
  const [value, setValue] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const numValue = value ? Number(value) : null;
  const isOutOfRange =
    numValue !== null &&
    (numValue < normalRange.min || numValue > normalRange.max);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">
        {label}
        <span className="text-slate-500 font-normal ml-2">({unit})</span>
      </label>

      <div className="flex gap-2">
        <input
          type="number"
          step={unit === 'mg/L' || unit === 'g/dL' ? '0.01' : '1'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            form.setValue(
              `biomarkers.${biomarker}` as Path<HealthDataFormData>,
              e.target.value ? Number(e.target.value) : undefined
            );
          }}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:border-transparent',
            isOutOfRange
              ? 'border-yellow-300 focus:ring-yellow-500'
              : 'border-slate-300 focus:ring-blue-500'
          )}
          placeholder={`Normal: ${normalRange.min}−${normalRange.max}`}
          aria-describedby={`${biomarker}-help`}
        />
        <button
          type="button"
          className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setShowTooltip(!showTooltip)}
          aria-label={`Learn more about ${label}`}
          aria-expanded={showTooltip}
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {isOutOfRange && (
        <p className="text-sm text-yellow-600" role="alert">
          ⚠️ This value is outside the normal range ({normalRange.min}−{normalRange.max}).
          This may indicate a health condition.
        </p>
      )}

      {showTooltip && (
        <div
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900"
          role="tooltip"
          id={`${biomarker}-help`}
        >
          <p>{explanation}</p>
        </div>
      )}

      {!showTooltip && (
        <p className="text-xs text-slate-600" id={`${biomarker}-help`}>
          {explanation}
        </p>
      )}
    </div>
  );
}

