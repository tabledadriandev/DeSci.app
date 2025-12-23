/**
 * Step 5: Food Preferences
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { OnboardingData } from '../page';

interface FoodPreferencesStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Paleo',
  'Keto',
  'Mediterranean',
  'Low-carb',
  'Gluten-free',
  'Dairy-free',
];

const allergyOptions = [
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Fish',
  'Eggs',
  'Soy',
  'Wheat',
  'Dairy',
];

const cuisineOptions = [
  'Italian',
  'French',
  'Japanese',
  'Thai',
  'Mexican',
  'Indian',
  'Mediterranean',
  'American',
];

export default function FoodPreferencesStep({
  data,
  updateData,
  nextStep,
}: FoodPreferencesStepProps) {
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    data.dietaryRestrictions || []
  );
  const [foodAllergies, setFoodAllergies] = useState<string[]>(
    data.foodAllergies || []
  );
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(
    data.cuisinePreferences || []
  );

  const toggleArray = (
    array: string[],
    value: string,
    setter: (arr: string[]) => void
  ) => {
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      dietaryRestrictions,
      foodAllergies,
      cuisinePreferences,
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
          <Utensils className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Food Preferences
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    toggleArray(dietaryRestrictions, option, setDietaryRestrictions)
                  }
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    dietaryRestrictions.includes(option)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-elevated border-border-light text-text-primary hover:border-primary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Food Allergies
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allergyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    toggleArray(foodAllergies, option, setFoodAllergies)
                  }
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    foodAllergies.includes(option)
                      ? 'bg-error text-white border-error'
                      : 'bg-bg-elevated border-border-light text-text-primary hover:border-error'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Cuisine Preferences
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cuisineOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    toggleArray(cuisinePreferences, option, setCuisinePreferences)
                  }
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    cuisinePreferences.includes(option)
                      ? 'bg-success text-white border-success'
                      : 'bg-bg-elevated border-border-light text-text-primary hover:border-success'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
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
