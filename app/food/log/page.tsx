'use client';

import { useState } from 'react';
import { Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { cn } from '@/lib/utils/cn';

export default function FoodLogPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentify = async () => {
    if (!image) return;

    setIdentifying(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', 'current-user-id'); // Would get from auth

      const response = await fetch('/api/food/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Identification failed');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to identify food');
    } finally {
      setIdentifying(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-bg-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Log Meal</h1>
          <p className="text-text-secondary">Take a photo and AI will identify your food</p>
        </motion.div>

        {/* Camera/Upload Section */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl"
        >
          {!preview ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border-light rounded-xl">
              <Camera className="w-12 h-12 text-text-tertiary mb-4" />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <span className="btn-primary inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Take Photo or Upload
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Food preview"
                className="w-full rounded-xl max-h-96 object-cover"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleIdentify}
                  disabled={identifying}
                  className="btn-primary flex items-center gap-2"
                >
                  {identifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Identifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Identify Food
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                    setResult(null);
                  }}
                  className="btn-secondary"
                >
                  Change Photo
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-4">Identified Foods</h2>
            
            {/* Foods List */}
            <div className="space-y-3 mb-4">
              {result.foods.map((food: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-bg-elevated">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">{food.name}</span>
                    <span className="text-sm text-text-secondary">
                      {food.portion.amount} {food.portion.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-xs text-text-secondary mb-1">Calories</p>
                <p className="text-lg font-bold font-mono text-primary">
                  {result.totalCalories}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <p className="text-xs text-text-secondary mb-1">Protein</p>
                <p className="text-lg font-bold font-mono text-success">
                  {result.macros.protein}g
                </p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <p className="text-xs text-text-secondary mb-1">Carbs</p>
                <p className="text-lg font-bold font-mono text-warning">
                  {result.macros.carbs}g
                </p>
              </div>
              <div className="p-3 rounded-lg bg-error/10">
                <p className="text-xs text-text-secondary mb-1">Fat</p>
                <p className="text-lg font-bold font-mono text-error">
                  {result.macros.fat}g
                </p>
              </div>
            </div>

            {/* Micronutrients */}
            {result.micronutrients && (
              <div className="mb-4 p-4 rounded-lg bg-bg-elevated">
                <p className="text-sm font-medium text-text-primary mb-2">Micronutrients</p>
                <div className="space-y-1 text-xs text-text-secondary">
                  {result.micronutrients.omega3 > 0 && (
                    <p>Omega-3: {result.micronutrients.omega3}mg</p>
                  )}
                  {result.micronutrients.polyphenols > 0 && (
                    <p>Polyphenols: {result.micronutrients.polyphenols}mg</p>
                  )}
                  {result.micronutrients.nadBoosters && result.micronutrients.nadBoosters.length > 0 && (
                    <p>NAD+ Boosters: {result.micronutrients.nadBoosters.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-2">Suggestions</p>
                <ul className="space-y-1 text-xs text-text-primary">
                  {result.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save Button */}
            <button className="btn-primary w-full mt-4">
              Save Meal
            </button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-4 rounded-2xl border-2 border-error/50 bg-error/10">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
