/**
 * Step 3: Medical History
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface MedicalHistoryStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function MedicalHistoryStep({
  data,
  updateData,
  nextStep,
}: MedicalHistoryStepProps) {
  const [healthConditions, setHealthConditions] = useState<string[]>(
    data.healthConditions || []
  );

  const conditions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Autoimmune Disorder',
    'Thyroid Issues',
    'None',
  ];

  const handleConditionToggle = (condition: string) => {
    if (condition === 'None') {
      setHealthConditions(['None']);
    } else {
      setHealthConditions((prev) => {
        const filtered = prev.filter((c) => c !== 'None');
        if (filtered.includes(condition)) {
          return filtered.filter((c) => c !== condition);
        }
        return [...filtered, condition];
      });
    }
  };

  const handleContinue = () => {
    updateData({
      healthConditions: healthConditions.length > 0 ? healthConditions : ['None'],
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
          <FileText className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Medical History
          </h2>
        </div>

        <p className="text-text-secondary mb-6">
          This helps us personalize your recommendations. You can skip this step
          and add it later.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Health Conditions (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {conditions.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => handleConditionToggle(condition)}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    healthConditions.includes(condition)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-elevated border-border-light text-text-primary hover:border-primary'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Upload Recent Test Results (optional)
            </label>
            <div className="border-2 border-dashed border-border-light rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-text-secondary" />
              <p className="text-text-secondary mb-2">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-text-tertiary">
                PDF or image files accepted
              </p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                id="medical-upload"
              />
              <label
                htmlFor="medical-upload"
                className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}
