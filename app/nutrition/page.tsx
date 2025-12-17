'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import { Camera, Upload, Utensils, TrendingUp, AlertCircle, Plus, PieChart, Info } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const COMMON_FOODS = ['Chicken Breast', 'Salmon', 'Eggs', 'Oatmeal', 'Broccoli', 'Spinach', 'Avocado', 'Almonds'];

export default function NutritionPage() {
  const { address } = useAccount();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    foods: [] as string[],
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    notes: '',
  });

  useEffect(() => {
    // Mock data for now
    setDailyTotals({
      calories: 1800,
      protein: 120,
      carbs: 150,
      fats: 60,
      fiber: 25,
      targets: { calories: 2200, protein: 140, carbs: 200, fats: 70, fiber: 30 },
    });
    setMealLogs([
      { id: '1', mealType: 'breakfast', foods: ['Oatmeal', 'Berries'], calories: 350, protein: 10, carbs: 60, fats: 5, fiber: 8, date: new Date().toISOString() },
    ]);
    setLoading(false);
  }, [address, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    // Mock submit
    setShowForm(false);
    alert('Meal logged successfully! (Mock)');
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Nutrition Analysis
            </h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Track your meals, analyze macronutrients, and optimize your diet for peak performance.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Close' : 'Log Meal'}
          </button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading nutrition data..." />
          </div>
        ) : (
          <>
            {/* Daily Totals */}
            {dailyTotals && (
              <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-accent-primary" /> Daily Nutrition Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Calories', value: dailyTotals.calories, target: dailyTotals.targets.calories, unit: '' },
                    { label: 'Protein', value: dailyTotals.protein, target: dailyTotals.targets.protein, unit: 'g' },
                    { label: 'Carbs', value: dailyTotals.carbs, target: dailyTotals.targets.carbs, unit: 'g' },
                    { label: 'Fats', value: dailyTotals.fats, target: dailyTotals.targets.fats, unit: 'g' },
                    { label: 'Fiber', value: dailyTotals.fiber, target: dailyTotals.targets.fiber, unit: 'g' },
                  ].map(macro => (
                    <div key={macro.label} className="glass-card p-4 text-center">
                      <p className="text-sm text-text-secondary">{macro.label}</p>
                      <p className="text-3xl font-bold text-accent-primary">{macro.value?.toFixed(0)}{macro.unit}</p>
                      <p className="text-xs text-text-tertiary mt-1">Target: {macro.target}{macro.unit}</p>
                      <ProgressBar
                        value={(macro.value / macro.target) * 100}
                        max={100}
                        size="sm"
                        showValue={false}
                        animated
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Meal Log Form */}
            {showForm && (
              <motion.div className="glass-card p-6 mb-8" variants={fadeInUp}>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Log a Meal</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form content would be restyled here similar to other forms */}
                  <p className="text-text-secondary">Meal logging form would be here with redesigned inputs.</p>
                  <div className="flex gap-4">
                    <AnimatedButton type="submit" className="flex-1">
                      Save Meal
                    </AnimatedButton>
                    <AnimatedButton type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>
                      Cancel
                    </AnimatedButton>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Meal Logs */}
            <motion.div className="glass-card p-6" variants={fadeInUp}>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Meal Logs</h2>
              {mealLogs.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No meals logged for this date. Start tracking your nutrition!
                </div>
              ) : (
                <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
                  {mealLogs.map((meal) => (
                    <motion.div key={meal.id} variants={fadeInUp} className="glass-card-hover p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-text-primary capitalize">
                              {meal.mealType}
                            </span>
                            <span className="text-sm text-text-secondary">
                              {new Date(meal.date).toLocaleTimeString()}
                            </span>
                          </div>
                          {meal.foods && meal.foods.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {meal.foods.map((food: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-bg-elevated rounded text-sm text-text-secondary">
                                  {food}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-4 text-sm text-text-secondary">
                            <span>{meal.calories} cal</span>
                            <span>{meal.protein}g protein</span>
                            <span>{meal.carbs}g carbs</span>
                            <span>{meal.fats}g fats</span>
                            {meal.fiber > 0 && <span>{meal.fiber}g fiber</span>}
                          </div>
                        </div>
                        {meal.imageUrl && (
                          <img
                            src={meal.imageUrl}
                            alt="Meal"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}

